---
name: gabe-moodboard
description: Apply Gabe's saved visual taste (his local Pinterest mirror) as creative influence on whatever is being designed or built - a UI, landing page, component, brand, deck, or image prompt. Has an adjustable influence dial, from strictly mirroring named pins/boards to loosely seasoning a build with his whole taste profile. Use whenever Gabe mentions his boards, his Pinterest, his taste, or pulling inspo/inspiration/references from his saved stuff; asks for a moodboard or a design brief grounded in his taste; or wants the aesthetic of anything he's building to feel like him instead of generic AI defaults - including mid-build ("make this feel more like my editorials board"). NOT for critiquing existing designs or generating brand-guideline imagery.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
---

# Moodboard

Give the AI Gabe's saved visual taste as a creative mind to draw on, then apply it to whatever is being built. This is not a curation ritual: don't make him pick pins, answer questionnaires, or approve rounds of candidates. Infer the influence level, load the right layer, translate it to the target medium, apply it.

## The mirror (all local, no index/MCP needed)

- Boards: `~/wiki/pinterest/*.md` - one file per board. `index.md` is the routing table (board, pin count, topics). Each pin block carries a design-aware caption, thumb path, original path, pin URL, and dominant color hex.
- Thumbs: `~/wiki/raw/assets/pinterest/thumbnails/<pin_id>.jpg`. When you need to actually look at a pin, read the thumb, never the original (~5x the tokens, same taste signal).
- `references/taste-profile.md` - precompiled corpus-wide + per-board DNA. If its `synced` date is older than `index.md`'s, offer to regenerate it (instructions in its header).
- `references/reading-lenses.md` - how to deeply read a single reference image (8 lenses -> transferable principles, 4 application moves). Read it whenever a specific pin is driving decisions.
- The mirror rebuilds on the Mac mini and syncs via git. Boards missing or stale -> tell Gabe to pull the wiki; there is no local sync script.

## The dial

Infer the level from how Gabe phrases the ask; default to **guided**. He can move it mid-flight ("stricter", "looser", "not that board", "just use these two pins").

| Level | He says things like | Load | References act as |
|---|---|---|---|
| **strict** | "use this pin / this board exactly", names specific pins | The named pin blocks + their thumbs | Hard constraints: palette from those exact hexes, composition and texture mirrored closely |
| **guided** (default) | "moodboard for X", "make it feel like my editorials board", "pull inspo for this" | 1-3 relevant boards (route via `index.md` topics), read their files; thumbs only for the few pins that end up driving decisions | Strong direction: distill DNA fresh from those boards, cite the driving pins |
| **ambient** | "use my taste", "my boards", anything broad | `references/taste-profile.md` only | Seasoning: build freely, break ties toward the profile |

The reason the dial matters: strictness is his call, not a fixed pipeline. A strict ask deserves fidelity to specific images; a broad ask deserves zero friction and no fake precision.

## Flow

1. **Read the ask.** What's being built + dial level. Ask only if you can't infer both - one question max, then move.
2. **Load the layer** per the table. For guided, pick boards by topic match in `index.md`; grep captions across boards when the ask is thematic ("warm wood", "harsh flash") rather than board-shaped.
3. **Read the driving references.** When specific pins are carrying the direction (strict always, guided usually), read `references/reading-lenses.md` and extract principles through its lenses - not just a palette. One well-read image yields form, material, process, era, composition, function, mood, and refusals; each can transfer at a different literalness (quote / translate / abstract / invert).
4. **Translate to the target medium** (next section).
4. **Apply.**
   - Mid-build: fold the influence directly into the work - tokens, CSS, copy tone, image prompt, slide styling. No file unless he asks.
   - Brief requested ("write a moodboard", "give me a brief"): fill `assets/moodboard.template.md` -> `MOODBOARD.md` in cwd. For the palette run `node scripts/build-palette.mjs "#hex" "#hex" ...` with the driving pins' dominant hexes - it assigns bg/surface/ink/accent by luminance/chroma and emits a W3C token block. Render only the roles it returns; a monochrome selection legitimately lacks accent or surface. Never invent a hex.

## Translating mediums

The boards are fashion, interiors, prints, and posters; the target usually isn't. Transfer the **attribute**, not the artifact - a Raf editorial doesn't put a model on the landing page, it lends its contrast curve and severity.

- **Palette + contrast** -> direct: dominant hexes and light/dark balance carry over as-is.
- **Material and texture** (concrete, linen, film grain, raw metal) -> surface treatment: backgrounds, grain overlays, border weight, shadow character.
- **Silhouette and garment structure** -> layout: drape = overlap and looseness, tailoring = grid discipline, asymmetric cuts = asymmetric composition.
- **Styling density** (layered fits vs stark minimalism) -> spacing and negative space.
- **Photographic mood** (harsh flash vs soft daylight, candid vs staged) -> contrast curve, image treatment, motion feel (harsh = abrupt/none, soft = restrained ease).
- **Era + subculture signal** (archive 90s, Swiss, Dieter Rams) -> typography direction: editorial serif, brutalist mono, geometric sans. A direction, not a font pick.
- **What the references never do** -> anti-patterns. Derive from the actual boards (e.g. nothing there has gradient meshes or rounded-friendly SaaS chrome); don't recite stock bans.

## Honesty

- If his taste genuinely doesn't cover the ask, say so and build without forcing off-brand references - an honest "your boards don't go there" beats a wrong vibe.
- When specific pins drove decisions, cite their URLs - receipts, so a design that ships traces back to its references.
- ASCII only, no emojis, in anything written to files.
