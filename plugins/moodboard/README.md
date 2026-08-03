# moodboard

Your saved visual taste, as a creative mind your AI can draw on.

Point it at your reference library once - image folders, a Pinterest mirror,
screenshots. It compiles a taste profile: your palettes (real hexes), materials,
composition habits, era signals, anti-patterns. After that, anything you build
can carry your aesthetic instead of generic AI defaults.

## The dial

Strictness is inferred from how you phrase the ask:

| You say | What happens |
|---|---|
| "build this strictly off this image" | That reference is a hard constraint - exact palette, mirrored composition |
| "moodboard for a portfolio site" | Reads your relevant collections, distills direction, cites references |
| "just use my taste" | Builds freely, breaking ties toward your profile |

Adjust mid-flight: "stricter", "looser", "not that one".

## How it reads an image

Eight lenses - form, material, process, era, composition, function, mood, refusals -
each ending in a transferable principle. Then each attribute lands at a chosen
literalness: quote it, translate it (drape -> overlapping layout), abstract it
("worn beats pristine"), or invert it. One image, many applications. Attributes
transfer, artifacts don't: silhouette becomes layout, material becomes surface,
photographic mood becomes motion.

Ask for a brief and it writes `MOODBOARD.md`: references with receipts, design DNA,
and a W3C design-tokens block for Figma/CSS/v0. Palette roles are computed from your
references' hexes by luminance/chroma - never invented.

## Install

```
/plugin marketplace add gkmur/skills
/plugin install moodboard@gkmur
```

Setup runs on first use. Local files only - no services, no APIs, no dependencies.
