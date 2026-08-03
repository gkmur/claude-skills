# moodboard

Your saved visual taste, as a creative mind your AI can draw on.

Point it at the folders and boards of images you have already saved. It studies the
library once and writes down what your taste is - real hexes, materials, composition
habits, what you never save - then applies that to whatever you are building: a UI,
a brand, a deck, an image prompt.

## Process

```
your ask ("moodboard for X")
  1. infer the dial       how strictly to apply your taste
  2. load the layer       one image / a collection / the whole profile
  3. read the references  8 lenses -> design decisions
  4. translate            fashion/interiors/art -> the thing you're building
  5. apply                straight into the build, or a portable MOODBOARD.md
```

## The dial

Strictness comes from how you phrase the ask. There is nothing to configure.

| You say | It does |
|---|---|
| "build this strictly off this image" | Treats that image as law: its exact palette, its composition |
| "moodboard for a portfolio site" | Picks the 1-3 relevant collections, pulls a direction from them, tells you which images drove it |
| "just use my taste" | Builds normally, but every judgment call goes your way |

Say "stricter", "looser", or "not that one" at any point to move it.

## The lenses

Each driving image is read the way an art historian reads a work - eight questions,
each producing a design decision rather than a description:

| Lens | Asks the image | Example answer |
|---|---|---|
| Form | What shapes and contrast dominate? | "one dark figure on an empty field" -> one hero element, lots of empty space |
| Material | What is it made of? | worn nylon and sewn patches -> matte surfaces, one collage moment |
| Process | How was it made? | woodblock printing with misaligned layers -> slightly offset color layers |
| Era | What scene is it from, rejecting what? | 2003 Antwerp anti-fashion -> mono type, no friendly startup chrome |
| Composition | Where does the eye go? Where is it empty? | huge concrete mass, one window -> dense block cut by a single bright CTA |
| Function | What job did the object do? | a lamp diffuses light -> soft glow layers instead of drop shadows |
| Mood | What's the emotional temperature? | austere but tender -> minimal motion, quiet copy |
| Refusals | What would this image never do? | Rams audio wall: zero ornament -> strip every decorative element |

Each answer can then be applied at four levels of literalness:

| Move | Meaning | Example |
|---|---|---|
| quote | copy it exactly | use the reference's actual hexes |
| translate | same idea, new medium | garment drape -> overlapping layout |
| abstract | keep only the rule | "worn beats pristine" -> allow rough edges everywhere |
| invert | do the opposite, on purpose | reference is cluttered -> go stark, and say why |

One image therefore feeds many different builds: a Raf bomber photo gives a landing
page its negative space, a deck its photography style, a physical product its
material honesty. The attributes transfer; the artifact does not.

## Output

During a build, the influence lands directly in the work. Ask for a brief and it
writes `MOODBOARD.md`: the driving references with links, the design DNA, and a W3C
design-tokens block you can paste into Figma, CSS, or v0. Palette roles (bg /
surface / ink / accent) are computed from your references' actual hexes. If your
taste is monochrome, the palette is monochrome. It never invents a color.

## Install

```
/plugin marketplace add gkmur/skills
/plugin install moodboard@gkmur
```

On first use it asks where your references live, then compiles your taste profile
(slow once, instant after). Local files only - no services, no APIs, no dependencies.
