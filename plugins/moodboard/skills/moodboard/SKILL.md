---
name: moodboard
description: Turn Gabe's curated visual taste into a portable design brief. Semantic-searches his Pinterest mirror (the qmd/gbrain-indexed shadow at ~/wiki/pinterest/, served by the wiki MCP), surfaces 3 cross-board candidates with thumbnail previews, lets him pick/reject/refine, then extracts design DNA (palette, type, texture, composition, motion, anti-patterns) and writes MOODBOARD.md - a tool-agnostic brief that feeds /design-consultation, /design-shotgun, frontend builders, or image-gen. The brief is the durable artifact; generation is downstream. Use when starting UI/brand work and you want the aesthetic grounded in saved taste, not generic AI defaults. Trigger phrases - "pull moodboard inspo", "moodboard for X", "find inspo for", "what does my taste say about X".
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - AskUserQuestion
  - mcp__wiki__query
  - mcp__wiki__search
---

# Moodboard

Slots in **before** design-consultation / design-shotgun / a frontend build. Output is a curated, portable brief - not code.

**Why this exists (the bet):** taste in your head is perishable; taste captured into a portable, machine-readable brief is a compounding asset. This skill is the compiler: curated corpus -> design DNA -> a brief that travels to any AI tool. MOODBOARD.md is the noun you own; each generation is the disposable verb.

## Preconditions

- Pinterest shadow lives at `~/wiki/pinterest/*.md`, indexed into the wiki MCP (`source_id: "wiki"`). Pins surface with slugs like `pinterest/<board>`.
- Thumbs at `~/wiki/raw/pinterest/.thumbs/<pin_id>.jpg` (read these, NEVER the originals - ~80% fewer tokens, same taste signal).
- Each pin block in a result carries: design-aware caption, thumb path, original image path, pin URL, dominant color hex.

If `~/wiki/pinterest/` is empty or missing on this machine: the mirror is built/refreshed on the **Mac mini** and synced here via git. Tell the user to pull the wiki (or run the sync on the mini) - do NOT point at a local sync script; it does not exist on the MacBook. Verify with:

```bash
ls ~/wiki/pinterest/*.md 2>/dev/null | wc -l   # expect ~20 board files
```

## Step 0 - Context check

```bash
ls MOODBOARD.md DESIGN.md design-tokens.json 2>/dev/null
```

If `MOODBOARD.md` exists, AskUserQuestion: extend / replace / cancel.
If `DESIGN.md` or `design-tokens.json` exists, note it - DNA extraction should complement, not contradict the existing system.

## Step 1 - Intent capture

Skip if the user's invocation already gives both target and vibe ("moodboard for a brutalist landing page" = enough). Otherwise one AskUserQuestion with up to 2 sub-questions:

1. **What are you building?** (component, page, full product, brand, deck)
2. **Vibe direction?** - draw from the *full* taste spectrum, not just interiors. The mirror spans interiors/home, fashion + archive editorials, graphic/poster/portfolio design, prints, objects, lighting. Offer a spread like:
   - Editorial / archive / minimal (Raf-era, Swiss, monochrome)
   - Brutalist / raw / industrial (concrete, black metal, asymmetric)
   - Warm / organic / tactile (japandi, wood, linen, soft neutrals)
   - Dark-tech / cinematic / monospaced
   - Graphic / poster / high-contrast type
   - Other (free text)

## Step 2 - Query (real wiki MCP interface)

Use `mcp__wiki__query`. Do NOT cross-gate by board - let semantic score rank across all boards (off-domain boards like anime/tattoos naturally score low for design queries).

- `query`: one rich *visual descriptor* string - combine vibe + material/texture + composition + mood. Not keywords.
- `limit`: 8
- Leave `cross_modal` default (text). True image->image is not indexed yet (see Roadmap).
- Treat `score >= ~0.5` as the floor; keep only results whose `slug` starts with `pinterest/`.

Example for "brutalist landing page":
```
query: "brutalist concrete interior architecture, black metal, warm wood, asymmetric composition, raw materials, editorial photography, stark high-contrast"
limit: 8
```

Results come back as **whole-board chunks with multiple pins inlined** in `chunk_text`. Each pin block already has caption + thumb path + pin URL + dominant color - parse them straight out. No separate `get` call is needed.

For lexical/exact-tag lookups (a named designer, a specific object), `mcp__wiki__search` is the keyword path.

## Step 3 - Curate to 3

From the parsed pins (aim for 6-8 candidates spanning >=2 boards):

1. Read the thumb (`Read` on `~/wiki/raw/pinterest/.thumbs/<id>.jpg`) for the top ~6 only.
2. Pick the 3 strongest - diversity matters, no near-duplicates, prefer cross-board:
   - **Anchor** - sets the dominant mood/palette
   - **Composition** - informs layout / structure / negative space
   - **Detail** - texture, type treatment, or micro-element

## Step 4 - Present + curate (interactive - the point)

AskUserQuestion with 4 options, `multiSelect: true`. Each pin option uses `preview` showing:
- Caption (from the parsed block)
- Source board + pin URL
- Dominant color hex
- Role + one-line why (anchor / composition / detail)

4th option: **"Show me different ones"** - re-query with a tweak (ask what to adjust: more X, less Y, a specific board). Loop up to 3 times before suggesting the user refine the vibe input. Gabe is the taste-maker; never auto-finalize the picks.

## Step 5 - Extract DNA

From the selected pins:

- **Palette** - dominant hex per pin + thumb read to find accent/neutral structure. 3-5 hex with role labels (bg, surface, ink, accent).
- **Typographic feel** - inferred from caption keywords (editorial / monospaced / display serif / geometric sans). 1-2 *directions*, not specific fonts (that's design-consultation's job).
- **Texture / materiality** - concrete, paper, glass, linen, raw metal, film grain.
- **Composition** - symmetric/asymmetric, density, grid feel, negative space.
- **Motion feel** - static / restrained / fluid / cinematic. Map to a 1-10 intensity.
- **Anti-patterns** - what these references explicitly reject (e.g. "no gradient meshes", "no soft drop shadows", "no centered hero").

## Step 6 - Write the brief (portable)

Write `MOODBOARD.md` to cwd. Keep it tool-agnostic so it feeds Claude, /design-consultation, v0/Lovable, or an image-gen --sref prompt equally. Include a machine-readable token block (W3C-design-tokens-shaped) so the palette pipes into Figma/CSS without a conversion step.

```markdown
# Moodboard - <project / feature name>

Generated <date> from the Pinterest mirror. Brief is the durable artifact; cite pins as receipts.

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

**Typography direction** - <1-2 sentences>

**Texture / materiality** - <1 sentence>

**Composition** - <1 sentence>

**Motion** - <1-10> - <description>

**Anti-patterns**
- <ban 1>
- <ban 2>
- <ban 3>

## Tokens (portable)

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "bg":      { "$type": "color", "$value": "#hex" },
    "surface": { "$type": "color", "$value": "#hex" },
    "ink":     { "$type": "color", "$value": "#hex" },
    "accent":  { "$type": "color", "$value": "#hex" }
  }
}
```

## Next step

Hand this to one of:
- `/design-consultation` - turn DNA into a full DESIGN.md
- `/design-shotgun` - explore variants on top of this brief
- a frontend build, or paste the Tokens block into v0 / Figma variables
```

## Step 7 - STOP

Report what was written and suggest the next skill. Do NOT auto-invoke it.

## Notes

- **Never read original images** - always the thumb. The thumb is enough to recognize taste, at a fraction of the token cost.
- **Cite pin URLs** - receipts. If a design ships well, it's traceable to the references that drove it.
- **Don't invent** fonts or hex values absent from the data. Palette comes from the pins' dominant colors + what the thumbs show. Type direction is descriptive, not prescriptive.
- **ASCII only, no emojis** in MOODBOARD.md.
- **If the vibe matches nothing** in the boards, say so and suggest pinning references first. Don't fake it with off-brand picks.

## Roadmap (not yet wired)

- **Image->image mode.** `mcp__wiki__search_by_image` / `query` `cross_modal: "image"` exist, but the mirror's pin images are not multimodally indexed yet on gbrain (queries fall back to text). Once the mini runs a multimodal embed pass (Voyage-multimodal class, no modality gap), add a mode that seeds from a reference screenshot/URL and finds visually-similar pins, then extracts DNA from those. That makes the skill work from a visual seed, not just a text vibe.
- **Search-as-code extraction.** Move Step 5 from a fixed checklist toward small primitives (extract palette, classify type, score motion) that the model composes per board - a type-heavy board gets different extraction than a color-first one - instead of one rigid pass.
