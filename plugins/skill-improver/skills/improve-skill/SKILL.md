---
name: improve-skill
description: >
  Statistically improve an existing Claude skill that the user points you at.
  Fans out a dynamic multi-agent workflow across four lenses — eval-driven A/B,
  trigger/description tuning, adversarial weakness hunt, and clarity/structure
  rewrite — each backed by repeated trials and adversarial verification, then
  gates every proposed change through grill-me before applying. Use whenever
  the user says "improve this skill", "make this skill better", "tighten/harden
  this skill", "why isn't this skill triggering", "grill me on these skill
  changes", or points at a SKILL.md and wants it upgraded. This is for improving
  EXISTING skills; use skill-creator to author a new one from scratch.
---

# improve-skill

Point this at a skill directory; it runs a dynamic workflow that statistically
improves it, then makes you defend each change before it lands. The workflow
does the analysis; you and `grill-me` are the human gate.

## Why this shape

The heavy lifting — four review lenses, repeated trials, adversarial
verification — runs in a bundled `Workflow` script (`workflow.mjs`) that fans
out subagents headlessly. The human gate (`grill-me`) cannot run inside a
workflow, so it runs here in the conversation AFTER the workflow returns its
ranked proposal. Statistical means repeated trials + verification, not one-shot
opinion: every kept change survived an independent skeptic.

Reuse over reinvention: where a lens needs hard numbers, defer to
`skill-creator`'s existing harness (`scripts/run_loop.py` for trigger rate,
`scripts/aggregate_benchmark.py` for output variance) rather than rebuilding it.

## Inputs

The user gives a target skill. Resolve it to an absolute directory path
containing `SKILL.md`. If they only name a skill (e.g. "improve capture"),
locate it: check `~/projects/skills/plugins/*/skills/*/`,
`~/.claude/skills/`, `~/.agents/skills/`, and installed plugin marketplaces.
Confirm the resolved path with the user before proceeding if there's any
ambiguity.

## Workflow

### 1. Snapshot first

Skills are edited in place and the change may be wrong. Before anything:

```bash
cp -r <skill-path> /tmp/skill-improver-snapshot/<skill-name>
```

Tell the user where the snapshot is so a bad change is one `cp` from reverted.

### 2. Run the improvement workflow

Invoke the `Workflow` tool with the bundled script and the target path as args:

- `scriptPath`: this skill's `workflow.mjs` (absolute path)
- `args`: `{ "skillPath": "<absolute skill dir>", "model": "<current session model id>", "trials": 5 }`

Pass the model id powering THIS session so triggering/eval reasoning matches
what the user actually experiences. The workflow runs in the background and
notifies you when done; it returns:

```
{ skillPath, trials, counts: { raw, kept, dropped, byLens }, proposal: [ {id, title, lens, severity, evidence, proposed_change, confidence, risk}, ... ] }
```

If `proposal` is empty, the skill is already solid — tell the user, restore
nothing, stop. Don't invent work.

### 3. Present the proposal

Show the kept changes as a compact table: id, lens, severity, confidence, risk,
and a one-line what-changes. Lead with high-severity / high-confidence. Keep it
scannable — this is the menu the user is about to be grilled on.

### 4. Grill the user (the gate)

This is the point of the skill: no change lands without the user defending it.
Invoke the `grill-me` skill with the proposal as the plan to stress-test.
Frame it so grill-me interrogates, per change:

- Do you actually want this behavior change, or does it overfit your use?
- Does the evidence convince you, or do you want the eval/trigger harness run
  for hard numbers first?
- Accept / reject / modify — resolve each branch before moving on.

Drive grill-me until every proposed change has a decision. Capture the
accept/reject/modify verdict per id.

### 5. Apply accepted changes

For each accepted (or modified) change, edit `SKILL.md` (or the bundled file).
Apply changes as a batch, then:

- If the skill bundles scripts or a build/validate step, run it.
- If the target lives in the `claude-skills` marketplace, the user updates the
  live copy with `/plugin update` after pushing — remind them, don't push
  without an explicit go-ahead.

### 6. Optional: hard numbers

If during the grill the user wanted statistical proof for a trigger or eval
change, run the matching `skill-creator` harness (see `references/harness.md`)
and report mean ± spread before/after. Offer this; don't force it.

## Restore

A change went bad? One line:

```bash
cp -r /tmp/skill-improver-snapshot/<skill-name>/. <skill-path>/
```

## Notes

- The four lenses live in `workflow.mjs`; edit the lens prompts there to retune
  what each reviewer hunts for.
- Keep proposals lean. A skill that returns zero findings is a valid, good
  outcome — better than a padded changelist.
- See `references/harness.md` for wiring into skill-creator's eval scripts.
