---
name: moodboard
description: Pull visual inspiration from Gabe's Pinterest mirror (@gsw1sh boards) into a design brief. Queries the qmd-indexed shadow at ~/wiki/pinterest/, surfaces 3 curated candidates with thumbnail previews, lets you pick/reject/refine, then extracts design DNA (palette, type, texture, composition, motion) and writes MOODBOARD.md as input for /design-consultation, /frontend-design, or /design-shotgun. Use when starting UI work and you want the aesthetic grounded in your saved taste, not generic AI defaults. Trigger phrases - "pull moodboard inspo", "moodboard for X", "find inspo for", "what does my taste say about X".
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - AskUserQuestion
  - mcp__qmd__query
  - mcp__qmd__get
---

# Moodboard

Slots in **before** design-consultation / frontend-design / design-shotgun. Output is a curated brief, not code.

## Preconditions

- Pinterest shadow lives at `~/wiki/pinterest/*.md` (qmd collection `wiki`)
- Thumbs at `~/wiki/raw/pinterest/.thumbs/<pin_id>.jpg` (read these, NOT originals — ~60% token savings, same taste signal)
- Each pin in the shadow has: design-aware caption, thumb path, original image path, pin URL, dominant color hex

If `~/wiki/pinterest/` is empty or missing, STOP and tell the user to run `~/wiki/clawd/pinterest/sync.sh`.

## Step 0 - Context check

Check cwd for existing artifacts:

```bash
ls MOODBOARD.md DESIGN.md 2>/dev/null
```

If `MOODBOARD.md` exists, AskUserQuestion: extend / replace / cancel.
If only `DESIGN.md` exists, note it - DNA extraction should complement, not contradict.

## Step 1 - Intent capture

One AskUserQuestion with 2 sub-questions if intent isn't clear from the user message:

1. **What are you building?** (component, page, full product, brand)
2. **Vibe direction?** Options derived from your taste spectrum:
   - Editorial / archive / minimal
   - Brutalist / raw / industrial
   - Warm / organic / tactile
   - Dark-tech / cinematic / monospaced
   - High-end consumer / soft luxury
   - Other (free text)

Skip this step if the user's invocation already specifies both ("moodboard for a brutalist landing page" = enough).

## Step 2 - Query

Build a visual descriptor query, not a keyword query. Combine: vibe terms + material/texture + composition cues + mood.

Use `mcp__qmd__query` with:
- `collections: ["wiki"]`
- `intent`: one-line explanation of what you're hunting for
- `searches`: two passes
  - `{type: "vec", query: "<rich visual description>"}`
  - `{type: "lex", query: "<key tags from vibe>"}`
- Filter results to paths starting with `pinterest/`
- `minScore: 0.5`

Example for "brutalist landing page":
```
intent: "Find concrete/raw architecture references with strong type, asymmetric grids, warm material accents"
searches:
  - {type: "vec", query: "brutalist concrete interior architecture warm wood asymmetric composition raw materials editorial photography"}
  - {type: "lex", query: "brutalist concrete architecture"}
```

## Step 3 - Curate to 3

From query results (aim for 6-8 candidates):

1. For each candidate, read the markdown block to get: caption, thumb path, pin URL, board source, dominant color
2. Read the thumb image (`Read` tool on `~/wiki/raw/pinterest/.thumbs/<id>.jpg`) for top 6 only
3. Pick the 3 strongest — diversity matters: don't pick three near-duplicates. Aim for:
   - **Anchor pin** — sets the dominant mood/palette
   - **Composition pin** — informs layout / structure
   - **Detail pin** — texture, type treatment, or micro-element

## Step 4 - Present + curate (the interactive part)

AskUserQuestion with 4 options. Each of the 3 pin options uses the `preview` field showing:
- Caption (from markdown)
- Source board + pin URL
- Dominant color hex
- Why you picked it (anchor / composition / detail)

4th option: **"Show me different ones"** — re-query with a tweak (ask user what to adjust: more X, less Y, different board).

Allow multiSelect — user might want 2 of the 3, or all 3.

Loop on "show me different ones" up to 3 times before suggesting the user refine the vibe input.

## Step 5 - Extract DNA

From the selected pins, extract:

- **Palette** — pull dominant color hex from each pin's metadata + read thumbs to identify accent/neutral structure. Output as 3-5 hex codes with role labels (bg, surface, ink, accent).
- **Typographic feel** — inferred from caption keywords ("editorial", "monospaced", "display serif", "geometric sans"). Suggest 1-2 font directions, not specific fonts (that's design-consultation's job).
- **Texture / materiality** — concrete, paper, glass, fabric, raw metal, etc.
- **Composition rules** — symmetric/asymmetric, density, grid feel, negative space
- **Motion feel** — static / restrained / fluid / cinematic (map to design-taste-frontend's MOTION_INTENSITY scale 1-10)
- **Anti-patterns** — what these references explicitly reject (e.g. "no gradient meshes", "no soft drop shadows", "no centered hero")

## Step 6 - Write MOODBOARD.md

Write to cwd. Format:

```markdown
# Moodboard - <project / feature name>

Generated <date> from Pinterest mirror.

## References

### 1. Anchor - <board>
- Pin: <url>
- Thumb: ~/wiki/raw/pinterest/.thumbs/<id>.jpg
- Caption: <caption>
- Dominant: #hex
- Why: <one line>

### 2. Composition - <board>
...

### 3. Detail - <board>
...

## Design DNA

**Palette**
- bg: #hex
- surface: #hex
- ink: #hex
- accent: #hex

**Typography direction**
<1-2 sentences>

**Texture / materiality**
<1 sentence>

**Composition**
<1 sentence>

**Motion**
<intensity 1-10> - <description>

**Anti-patterns**
- <ban 1>
- <ban 2>
- <ban 3>

## Next step

Hand this to one of:
- `/design-consultation` - turn DNA into full DESIGN.md
- `/frontend-design` - build a component / page now
- `/design-shotgun` - explore variants on top of this brief
```

## Step 7 - STOP

Report what was written and suggest the next skill. Do NOT auto-invoke it. Gabe is the taste-maker — let him decide.

## Notes

- **Never read original images** — always the thumb. The thumb is enough to recognize taste.
- **Cite pin URLs in MOODBOARD.md** — receipts matter. If a design ships well, traceable back to the references that drove it.
- **Don't invent fonts or exact hex values that aren't in the data** — palette comes from the pins' dominant colors and what you see in the thumbs. Type direction is descriptive, not prescriptive.
- **No emojis in MOODBOARD.md.**
- **If the user's vibe doesn't match anything in the boards**, say so and suggest they pin some references first. Don't fake it with off-brand picks.
