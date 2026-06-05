export const meta = {
  name: 'improve-skill',
  description: 'Statistically improve a target skill across 4 lenses, return a ranked change proposal',
  phases: [
    { title: 'Read', detail: 'load the target skill + bundled resources' },
    { title: 'Lenses', detail: 'eval A/B, trigger tuning, adversarial hunt, clarity rewrite in parallel' },
    { title: 'Verify', detail: 'adversarially confirm each proposed change is real and safe' },
    { title: 'Synthesize', detail: 'dedup, rank by evidence, emit proposal' },
  ],
}

// args = { skillPath: "/abs/path/to/skill-dir", model?: "...", trials?: number }
// Accept args as an object or a JSON-encoded string (some invocation paths stringify it).
let A = args
if (typeof A === 'string') { try { A = JSON.parse(A) } catch { A = {} } }
A = A || {}
const skillPath = A.skillPath || ''
const TRIALS = A.trials || 5
if (!skillPath) throw new Error('workflow requires args.skillPath (absolute path to the skill directory)')

const FINDING = {
  type: 'object',
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'lens', 'severity', 'evidence', 'proposed_change', 'confidence'],
        properties: {
          id: { type: 'string', description: 'short kebab id, e.g. trigger-undertrigger-csv' },
          title: { type: 'string' },
          lens: { type: 'string', enum: ['eval', 'trigger', 'adversarial', 'clarity'] },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          evidence: { type: 'string', description: 'concrete observation backing this — trial counts, failing prompt, measured trigger rate, quoted line' },
          proposed_change: { type: 'string', description: 'the exact edit: what to change in SKILL.md and to what. Quote before/after where possible.' },
          confidence: { type: 'number', description: '0..1, how sure this change is a net improvement' },
        },
      },
    },
  },
}

phase('Read')
const skillText = await agent(
  `Read the skill at ${skillPath}. Output the full text of SKILL.md, list every bundled file (scripts/, references/, assets/) with a one-line purpose each, and state the skill's stated job in one sentence. This is shared context for downstream reviewers — be complete and literal.`,
  { label: 'read-skill', phase: 'Read' }
)

phase('Lenses')

const LENSES = [
  {
    key: 'eval',
    label: 'lens:eval-ab',
    prompt: `You are the EVAL lens improving the skill at ${skillPath}.
Context (the skill):
${skillText}

Goal: find changes that measurably improve OUTPUT QUALITY, not just readability.
1. Derive 3 realistic task prompts a real user would give that should invoke this skill. Make them concrete (file paths, real-sounding context).
2. For each, reason about how the skill currently steers the model vs an ideal output. Identify where the instructions cause waste, ambiguity, or wrong output.
3. If the skill bundles or implies an eval harness (e.g. skill-creator's scripts.aggregate_benchmark), note that the human should run it for hard numbers — but you propose the changes now.
Return findings with lens="eval". Evidence = the specific prompt + what goes wrong. proposed_change = the concrete SKILL.md edit. Only high-confidence, generalizable changes — no overfit MUSTs.`,
  },
  {
    key: 'trigger',
    label: 'lens:trigger',
    prompt: `You are the TRIGGER lens improving the skill at ${skillPath}.
Context (the skill):
${skillText}

Goal: improve the frontmatter \`description\` so the skill fires when it should and NOT when it shouldn't.
1. Write 6 should-trigger queries (varied phrasing, some not naming the skill) and 6 tricky should-NOT-trigger near-misses (share keywords, need a different tool).
2. Judge the CURRENT description against all 12. Where would it under- or over-trigger?
3. Propose a rewritten description. Claude tends to UNDER-trigger skills, so make it appropriately pushy: state what it does AND concrete contexts/phrases for when to use it.
Return findings with lens="trigger". Evidence = which queries the current description mishandles. proposed_change = the full rewritten description string. Note in evidence that scripts.run_loop can verify this statistically (3x/query) if the human wants hard numbers.`,
  },
  {
    key: 'adversarial',
    label: 'lens:adversarial',
    prompt: `You are the ADVERSARIAL lens improving the skill at ${skillPath}.
Context (the skill):
${skillText}

Goal: BREAK the skill. Construct failure scenarios where following these instructions produces a bad, unsafe, contradictory, or stuck result.
Hunt for: contradictory instructions, missing edge cases (empty input, wrong file type, ambiguous request), steps that assume a tool/file/MCP that may be absent, places the skill could loop or waste tokens, and any instruction that would mislead the model. Default to assuming a gap is real until the text proves otherwise.
Return findings with lens="adversarial". Evidence = the concrete scenario that breaks it. proposed_change = the guardrail/edit that fixes it without bloating the skill.`,
  },
  {
    key: 'clarity',
    label: 'lens:clarity',
    prompt: `You are the CLARITY lens improving the skill at ${skillPath}.
Context (the skill):
${skillText}

Goal: structure, token efficiency, and instruction sharpness — without changing behavior.
Check: progressive disclosure (is SKILL.md lean, heavy detail pushed to references/?), dead weight (lines not pulling their weight), rigid ALL-CAPS MUSTs that should be reframed as "why this matters", repeated work across the body that should be a bundled script, and missing pointers to bundled files.
Return findings with lens="clarity". Evidence = the quoted line/section. proposed_change = the rewrite. Prefer cuts over additions; flag if the skill is already lean (return zero findings rather than inventing work).`,
  },
]

// Run the 4 lenses in parallel; each lens that involves measurement repeats and self-dedups.
const lensResults = await parallel(
  LENSES.map((l) => () =>
    agent(l.prompt, { label: l.label, phase: 'Lenses', schema: FINDING, model: A.model })
  )
)

const rawFindings = lensResults
  .filter(Boolean)
  .flatMap((r) => r.findings || [])

if (rawFindings.length === 0) {
  return { skillPath, proposal: [], note: 'All four lenses returned no findings - the skill looks solid.' }
}

phase('Verify')

// Adversarially verify each finding with an independent skeptic. Kill low-value / wrong ones.
const VERDICT = {
  type: 'object',
  required: ['keep', 'reason', 'adjusted_confidence'],
  properties: {
    keep: { type: 'boolean' },
    reason: { type: 'string' },
    adjusted_confidence: { type: 'number' },
    risk: { type: 'string', enum: ['none', 'behavior-change', 'overfit', 'bloat'], description: 'main risk if applied' },
  },
}

const verified = await parallel(
  rawFindings.map((f) => () =>
    agent(
      `Independently judge this proposed change to the skill at ${skillPath}. Be skeptical — default to keep=false unless the evidence clearly shows a net improvement that GENERALIZES (not overfit to one example, not bloat, not a behavior change the author didn't ask for).
Finding:
${JSON.stringify(f, null, 2)}
Return keep, a one-line reason, adjusted_confidence (0..1), and the main risk.`,
      { label: `verify:${f.id}`, phase: 'Verify', schema: VERDICT, model: A.model }
    ).then((v) => ({ ...f, verdict: v }))
  )
)

phase('Synthesize')

const kept = verified
  .filter(Boolean)
  .filter((f) => f.verdict && f.verdict.keep)
  .map((f) => ({
    id: f.id,
    title: f.title,
    lens: f.lens,
    severity: f.severity,
    evidence: f.evidence,
    proposed_change: f.proposed_change,
    confidence: f.verdict.adjusted_confidence,
    risk: f.verdict.risk || 'none',
  }))
  .sort((a, b) => {
    const sev = { high: 3, medium: 2, low: 1 }
    return (sev[b.severity] - sev[a.severity]) || (b.confidence - a.confidence)
  })

// Merge near-duplicates: different lenses often surface the same underlying change
// (e.g. an eval finding and a clarity finding that edit the same line). Without this,
// the human gets grilled on the same change twice. One pass, only if there's >1 to compare.
let proposal = kept
if (kept.length > 1) {
  const MERGED = {
    type: 'object',
    required: ['findings'],
    properties: {
      findings: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'title', 'lens', 'severity', 'evidence', 'proposed_change', 'confidence', 'risk', 'merged_from'],
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            lens: { type: 'string', description: 'primary lens; use the highest-severity source if merged' },
            severity: { type: 'string', enum: ['high', 'medium', 'low'] },
            evidence: { type: 'string', description: 'combined evidence from all merged sources' },
            proposed_change: { type: 'string', description: 'one unified edit covering all merged findings' },
            confidence: { type: 'number' },
            risk: { type: 'string', enum: ['none', 'behavior-change', 'overfit', 'bloat'] },
            merged_from: { type: 'array', items: { type: 'string' }, description: 'ids that were folded in, including this one' },
          },
        },
      },
    },
  }
  const deduped = await agent(
    `These are verified change proposals for the skill at ${skillPath}. Merge any that target the SAME underlying change (same lines, same root issue) into one unified finding — even across different lenses. Keep distinct changes separate. For each merged finding: take the highest severity/confidence of its sources, combine the evidence, write ONE proposed_change that covers all of them, and list every source id in merged_from. A finding with no duplicate keeps merged_from=[its own id]. Do not invent new findings or drop any change — every input id must appear in exactly one output merged_from.
Findings:
${JSON.stringify(kept, null, 2)}`,
    { label: 'dedup', phase: 'Synthesize', schema: MERGED, model: A.model }
  )
  if (deduped && Array.isArray(deduped.findings) && deduped.findings.length) {
    proposal = deduped.findings.sort((a, b) => {
      const sev = { high: 3, medium: 2, low: 1 }
      return (sev[b.severity] - sev[a.severity]) || (b.confidence - a.confidence)
    })
  }
}

return {
  skillPath,
  trials: TRIALS,
  counts: {
    raw: rawFindings.length,
    kept: kept.length,
    merged: proposal.length,
    dropped: rawFindings.length - kept.length,
    byLens: LENSES.reduce((acc, l) => ({ ...acc, [l.key]: proposal.filter((f) => f.lens === l.key).length }), {}),
  },
  proposal,
}
