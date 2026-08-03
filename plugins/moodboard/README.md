# moodboard

Your saved visual taste, as a creative mind your AI can draw on.

Point it at your reference library once - image folders, a Pinterest mirror,
screenshots. It compiles a taste profile: your palettes (real hexes), materials,
composition habits, era signals, anti-patterns. After that, anything you build
can carry your aesthetic instead of generic AI defaults.

## Process

```
your ask ("moodboard for X")
  1. infer the dial       how strictly to apply your taste
  2. load the layer       one image / a collection / the whole profile
  3. read the references  8 lenses -> transferable principles
  4. translate            attribute crosses the medium gap
  5. apply                straight into the build, or a portable MOODBOARD.md
```

## The dial

Strictness is inferred from how you phrase the ask:

| You say | What happens |
|---|---|
| "build this strictly off this image" | That reference is a hard constraint - exact palette, mirrored composition |
| "moodboard for a portfolio site" | Reads your relevant collections, distills direction, cites references |
| "just use my taste" | Builds freely, breaking ties toward your profile |

Adjust mid-flight: "stricter", "looser", "not that one".

## The lenses

Each driving image gets read like an art historian would - eight questions, each
ending in a principle that survives leaving the image:

| Lens | The question | Yields |
|---|---|---|
| Form | Dominant lines, shapes, values? | geometry, contrast curve, visual weight |
| Material | What is it made of, what did that force? | surface treatment, texture, imperfection budget |
| Process | Hand or machine, fast or slow? | edge quality, tolerance for irregularity |
| Era | When, where, reacting against what? | type direction, cultural register |
| Composition | How does the eye move, where is the emptiness? | layout, hierarchy, spacing |
| Function | What job did it originally do? | the equivalent job in your build |
| Mood | Emotional temperature? | motion feel, copy tone |
| Refusals | What does it conspicuously not do? | anti-patterns, derived not stock |

Each extracted attribute then lands at a chosen literalness:

- **quote** - lift it directly (the exact hex, the grid ratio)
- **translate** - carry it across mediums (drape -> overlapping layout)
- **abstract** - keep only the principle ("worn beats pristine"), re-derive natively
- **invert** - use the reference as a foil, on purpose

## What one reference does to a build

| Reference | Lens read | Effect on a landing page |
|---|---|---|
| Raf Simons 2003 bomber, lone figure in an empty field | form: one subject vs emptiness | one hero element, huge negative space |
| Same bomber - surplus nylon, sewn-on patches | material: reworked, worn | flat matte surfaces, one collage moment |
| Noguchi paper lantern | material: light through washi | translucent layers, soft glow instead of drop shadows |
| Braun/Rams wall audio | refusals: no ornament anywhere | strip chrome; controls only where functions exist |
| Ukiyo-e woodblock print | process: layered registration | slightly offset color layers, visible "printing" |
| Brutalist concrete interior | composition: mass + one window | dense content block cut by a single bright CTA |

Same references feeding a deck or a physical product produce different mixes -
attributes transfer, artifacts don't.

## Output

Ask for a brief and it writes `MOODBOARD.md`: references with receipts, design DNA,
and a W3C design-tokens block for Figma/CSS/v0. Palette roles are computed from your
references' hexes by luminance/chroma - never invented.

## Install

```
/plugin marketplace add gkmur/skills
/plugin install moodboard@gkmur
```

Setup runs on first use. Local files only - no services, no APIs, no dependencies.
