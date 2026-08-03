---
name: moodboard
description: Apply the user's saved visual taste - their own reference library of images, boards, or screenshots - as creative influence on whatever is being designed or built - a UI, landing page, component, brand, deck, or image prompt. Has an adjustable influence dial, from strictly mirroring a named reference to loosely seasoning a build with their whole taste profile. Use whenever the user mentions their boards, saved references, moodboard, Pinterest, "my taste", or pulling inspo/inspiration from things they've saved; asks for a moodboard or a design brief grounded in their references; or wants the aesthetic of anything they're building to feel like them instead of generic AI defaults - including mid-build ("make this feel more like my saved editorials"). Also use for first-time setup when the user wants to point the skill at their reference library. NOT for critiquing existing designs.
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

Give the AI the user's saved visual taste as a creative mind to draw on, then apply it to whatever is being built. This is not a curation ritual: don't make them pick images, answer questionnaires, or approve rounds of candidates. Infer the influence level, load the right layer, translate it to the target medium, apply it.

## The taste profile (per-user state)

Lives at `~/.claude/moodboard/taste-profile.md`. It records, in its header, where the user's reference library is and when it was last compiled; the body is a distilled read of their taste - corpus-wide through-lines plus per-collection DNA blocks.

**If the profile exists**: trust it. Its header tells you where the library lives and how it's organized.

**If it doesn't exist**: run setup once.
1. Ask where their references live. Anything works: a folder of images, a Pinterest mirror/export, a screenshots dump, subfolders-as-boards. One question, then go.
2. Read the library. If images have caption/metadata sidecars (markdown, JSON), read those - far cheaper than vision. Otherwise look at the images directly; prefer thumbnails or downscaled copies when they exist. For big libraries, sample: every collection, not every image.
3. Compile the profile: `## Corpus taste profile` (palette tendencies with real hexes, materials/textures, composition habits, photographic mood, era/subculture signals, typography sensibility, anti-patterns derived from what the library consistently avoids) then `## Collections` (one block each: what it is, its DNA, dominant hexes, "use for: ..."). Mark low-signal collections (memes, utility screenshots) as such in one line rather than forcing a read.
4. Stamp the header: library path, layout notes, compile date. Offer to recompile whenever the library has visibly grown past the stamp.

The profile is the asset. Compiling it is slow once so that using it is instant forever.

## The dial

Infer the level from how the user phrases the ask; default to **guided**. They can move it mid-flight ("stricter", "looser", "not that one", "just use these two").

| Level | They say things like | Load | References act as |
|---|---|---|---|
| **strict** | "use this image / this board exactly", names specific references | The named images + their metadata | Hard constraints: palette from those exact references, composition and texture mirrored closely |
| **guided** (default) | "moodboard for X", "make it feel like my editorials", "pull inspo for this" | The 1-3 relevant collections (route via the profile's "use for" lines); look at the few images that end up driving decisions | Strong direction: distill DNA fresh from those collections, cite the driving references |
| **ambient** | "use my taste", "my saved stuff", anything broad | The taste profile only | Seasoning: build freely, break ties toward the profile |

The reason the dial matters: strictness is the user's call, not a fixed pipeline. A strict ask deserves fidelity to specific images; a broad ask deserves zero friction and no fake precision.

## Flow

1. **Read the ask.** What's being built + dial level. Ask only if you can't infer both - one question max, then move.
2. **Load the layer** per the table. For guided, pick collections by the profile's "use for" lines; grep caption files when the ask is thematic ("warm wood", "harsh flash") rather than collection-shaped.
3. **Read the driving references.** When specific images are carrying the direction (strict always, guided usually), read `references/reading-lenses.md` and extract principles through its lenses - not just a palette. One well-read image yields form, material, process, era, composition, function, mood, and refusals; each can transfer at a different literalness (quote / translate / abstract / invert).
4. **Translate to the target medium** (next section).
5. **Apply.**
   - Mid-build: fold the influence directly into the work - tokens, CSS, copy tone, image prompt, slide styling. No file unless asked.
   - Brief requested ("write a moodboard", "give me a brief"): fill `assets/moodboard.template.md` -> `MOODBOARD.md` in cwd. For the palette run `node scripts/build-palette.mjs "#hex" "#hex" ...` with the driving references' dominant hexes - it assigns bg/surface/ink/accent by luminance/chroma and emits a W3C token block. Render only the roles it returns; a monochrome selection legitimately lacks accent or surface. Never invent a hex.

## Translating mediums

Reference libraries are usually fashion, interiors, prints, photography, posters - the target usually isn't. Transfer the **attribute**, not the artifact - an archive editorial doesn't put a model on the landing page, it lends its contrast curve and severity.

- **Palette + contrast** -> direct: dominant hexes and light/dark balance carry over as-is.
- **Material and texture** (concrete, linen, film grain, raw metal) -> surface treatment: backgrounds, grain overlays, border weight, shadow character.
- **Silhouette and structure** -> layout: drape = overlap and looseness, tailoring = grid discipline, asymmetric cuts = asymmetric composition.
- **Styling density** (layered vs stark) -> spacing and negative space.
- **Photographic mood** (harsh flash vs soft daylight, candid vs staged) -> contrast curve, image treatment, motion feel (harsh = abrupt/none, soft = restrained ease).
- **Era + subculture signal** -> typography direction: editorial serif, brutalist mono, geometric sans. A direction, not a font pick.
- **What the references never do** -> anti-patterns. Derive from the actual library; don't recite stock bans.

## Honesty

- If the user's taste genuinely doesn't cover the ask, say so and build without forcing off-brand references - an honest "your library doesn't go there" beats a wrong vibe.
- When specific references drove decisions, cite them (path or URL) - receipts, so a design that ships traces back to its references.
- ASCII only, no emojis, in anything written to files.
