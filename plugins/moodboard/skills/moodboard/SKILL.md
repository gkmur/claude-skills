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

## Files in this skill

- `SKILL.md` - this spine.
- `config.json` - Pinterest-mirror paths + query defaults. Read it first; don't hardcode paths.
- `scripts/build-palette.mjs` - turns the selected pins' dominant hexes into a roled palette + W3C token block (step 5).
- `assets/moodboard.template.md` - the MOODBOARD.md shape to copy (step 6).

## Preconditions

- Read `config.json` for `pinterest_dir`, `thumbs_dir`, `board_glob`, `score_floor`, `query_limit`. Use those values below instead of literal paths, so a moved mirror is a one-file edit.
- Pinterest shadow lives at `config.pinterest_dir` (default `~/wiki/pinterest/*.md`), indexed into the wiki MCP (`source_id: "wiki"`). Pins surface with slugs like `pinterest/<board>`.
- Thumbs at `config.thumbs_dir` (default `~/wiki/raw/pinterest/.thumbs/<pin_id>.jpg`) - read these, NEVER the originals (~80% fewer tokens, same taste signal).
- Each pin block in a result carries: design-aware caption, thumb path, original image path, pin URL, dominant color hex.

If the mirror is empty or missing on this machine: it is built/refreshed on the **Mac mini** and synced here via git. Tell the user to pull the wiki (or run the sync on the mini) - do NOT point at a local sync script; it does not exist on the MacBook. Verify with:

```bash
ls "$(node -e 'process.stdout.write(require("./config.json").board_glob.replace(/^~/, process.env.HOME))')" 2>/dev/null | wc -l   # expect ~20 board files
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
- `limit`: `config.query_limit` (default 8)
- Leave `cross_modal` default (text). True image->image is not indexed yet (see Roadmap).
- Treat `score >= config.score_floor` (default ~0.5) as the floor; keep only results whose `slug` starts with `pinterest/`.

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

From the selected pins. Deterministic parts run as code; subjective parts stay model-inferred (do not fake them with a script).

- **Palette (scripted)** - collect the dominant hex of each selected pin (already in the parsed block; read a thumb only if a pin lacks one), then run the script to get roled colors + the portable token block:
  ```bash
  node scripts/build-palette.mjs "#hex1" "#hex2" "#hex3" "#hex4"
  ```
  It assigns bg/surface/ink/accent by luminance + chroma and emits the W3C `tokens` object - paste both straight into the brief. Don't hand-roll the role assignment or the JSON.
- **Typographic feel** - inferred from caption keywords (editorial / monospaced / display serif / geometric sans). 1-2 *directions*, not specific fonts (that's design-consultation's job).
- **Texture / materiality** - concrete, paper, glass, linen, raw metal, film grain.
- **Composition** - symmetric/asymmetric, density, grid feel, negative space.
- **Motion feel** - static / restrained / fluid / cinematic. Map to a 1-10 intensity.
- **Anti-patterns** - what these references explicitly reject (e.g. "no gradient meshes", "no soft drop shadows", "no centered hero").

## Step 6 - Write the brief (portable)

Copy `assets/moodboard.template.md` and fill it in - write the result as `MOODBOARD.md` to cwd. The template is the canonical shape (References -> Design DNA -> Tokens -> Next step); editing it changes every future brief. Keep it tool-agnostic so it feeds Claude, /design-consultation, v0/Lovable, or an image-gen --sref prompt equally.

- Drop the `roles` and `tokens` from `build-palette.mjs` (step 5) straight into the Palette and Tokens sections - the machine-readable W3C token block is what pipes into Figma/CSS without a conversion step.
- Fill References from the 3 selected pins (anchor / composition / detail), Typography/Texture/Composition/Motion/Anti-patterns from the model-inferred DNA.

## Step 7 - STOP

Report what was written and suggest the next skill. Do NOT auto-invoke it.

## Gotchas

The failure points that quietly wreck a brief. Add to this list whenever one bites.

- **Never read original images - always the thumb.** Reading originals costs ~5x the tokens for the same taste signal. The thumb at `config.thumbs_dir` is enough to recognize taste; the original almost never is worth it.
- **Don't invent fonts or hex values absent from the data.** Palette comes from the pins' dominant colors (via `build-palette.mjs`) + what the thumbs show. Type direction is descriptive, not prescriptive - inventing a specific font is design-consultation's job, not this skill's.
- **Image->image isn't indexed yet.** `cross_modal: "image"` / `search_by_image` exist but the mirror's pins aren't multimodally embedded on gbrain - queries silently fall back to text. Don't promise visual-seed search; it returns text-ranked results (see Roadmap).
- **Cross-gating by board kills recall.** Let semantic score rank across all boards; off-domain boards (anime, tattoos) naturally score low. Filtering to a board up front throws away cross-board picks, which are the best ones.
- **If the vibe matches nothing, say so.** Suggest pinning references first. Don't fake it with off-brand picks - an honest "your boards don't cover this" beats a wrong brief.
- **Mirror missing != broken.** It's built on the Mac mini and synced via git. Tell the user to pull the wiki; there is no local sync script on the MacBook to point at.

## Notes

- **Cite pin URLs** - receipts. If a design ships well, it's traceable to the references that drove it.
- **ASCII only, no emojis** in MOODBOARD.md.
- Gabe is the taste-maker - never auto-finalize the picks; the curate loop in step 4 is the point.

## Roadmap (not yet wired)

- **Image->image mode.** `mcp__wiki__search_by_image` / `query` `cross_modal: "image"` exist, but the mirror's pin images are not multimodally indexed yet on gbrain (queries fall back to text). Once the mini runs a multimodal embed pass (Voyage-multimodal class, no modality gap), add a mode that seeds from a reference screenshot/URL and finds visually-similar pins, then extracts DNA from those. That makes the skill work from a visual seed, not just a text vibe.
- **Search-as-code extraction (partially shipped).** Palette is now scripted (`scripts/build-palette.mjs`). Still to do: `classify-type` and `score-motion` primitives the model composes per board - a type-heavy board gets different extraction than a color-first one. (These two are subjective inference, so they may stay model-side rather than become deterministic scripts.)
