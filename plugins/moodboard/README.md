# moodboard

Your saved visual taste, as a creative mind your AI can draw on.

You've spent years saving images - boards, folders, screenshots of things that felt
right. That taste is real, but it's trapped: every AI build starts from generic
defaults instead of from you. This skill fixes that. Point it at your reference
library once; after that, anything you build can be influenced by your taste at
exactly the strictness you want.

## How it works

**Compile once.** On first run the skill asks where your references live - a folder
of images, a Pinterest mirror or export, subfolders-as-boards, anything. It reads the
library (captions and metadata if present, the images themselves if not) and distills
a taste profile to `~/.claude/moodboard/taste-profile.md`: your palette tendencies
with real hexes, recurring materials and textures, composition habits, era and
subculture signals, and the anti-patterns your taste consistently rejects. Slow once,
instant forever.

**Use by talking normally.** The skill infers how strictly to apply your taste from
how you phrase the ask - an influence dial with three levels:

| You say | Level | What happens |
|---|---|---|
| "Build this landing page strictly off this image" | strict | That reference becomes a hard constraint - its exact palette, its composition mirrored |
| "Moodboard for a portfolio site" / "make this feel like my editorials" | guided | Reads the 1-3 relevant collections, distills direction fresh, cites the driving references |
| "Just use my taste" | ambient | Builds freely, breaking ties toward your compiled profile - zero friction |

Move the dial mid-flight: "stricter", "looser", "not that one".

**It reads images like an art historian.** When a specific reference drives the work,
the skill reads it through eight lenses - form, material, process, era and lineage,
composition, function, mood, and what the image refuses to do - and turns each into a
transferable principle. Then each attribute can land at a chosen literalness: quote it
(the exact hex), translate it (drape becomes overlapping layout), abstract it (keep
only "worn beats pristine"), or invert it (use the reference as a foil). One image,
many possible applications.

**Attributes transfer, artifacts don't.** Your references are probably fashion,
interiors, prints, photography. The thing you're building probably isn't. The skill
carries the attribute across the medium gap: silhouette becomes layout, material
becomes surface treatment, styling density becomes spacing, photographic mood becomes
motion feel, era signal becomes type direction.

## Example

> "moodboard for the analytics dashboard, pull from my saved stuff"

The skill routes to your relevant collections, reads the few images worth reading,
and either applies the direction straight into the build or - if you ask for a brief -
writes a portable `MOODBOARD.md`: references with receipts (paths/URLs), design DNA
(palette, type direction, texture, composition, motion, anti-patterns), and a W3C
design-tokens block you can paste into Figma variables, CSS, or v0.

The palette is computed, not vibed: a zero-dependency script assigns bg / surface /
ink / accent roles from your references' dominant hexes by luminance and chroma. If
your references are monochrome, you get a monochrome palette - it never invents a hex.

## Install

```
/plugin marketplace add gkmur/skills
/plugin install moodboard@gkmur
```

Then say something like "set up moodboard with my references folder" - or just start
using it; it will offer setup on first touch.

## What's in the box

- `skills/moodboard/SKILL.md` - the skill: profile, dial, flow, medium translation
- `references/reading-lenses.md` - the eight-lens image-reading framework
- `scripts/build-palette.mjs` - deterministic palette roles + W3C tokens (Node, zero deps)
- `assets/moodboard.template.md` - the portable brief format

No external services, no APIs, no dependencies. Everything runs on local files.
