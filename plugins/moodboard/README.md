# moodboard

Your saved visual taste, as a creative mind your AI can draw on.

```
/plugin marketplace add gkmur/skills
/plugin install moodboard@gkmur
```

Then say: **"set up my moodboard"** and point it at a folder of images.

Local files only. No services, no APIs, no dependencies.

## What it does

You have folders and boards of saved images. This reads them once, writes down what
your taste is - real hexes, materials, composition habits, what you never save - and
applies it to what you build: a UI, a brand, a deck, an image prompt.

## Step by step

**1. Setup (once, ~2 minutes of your time)**
Point it at your references. Image folders, a Pinterest export, a screenshots dump -
subfolders become collections. It reads them and writes your taste profile to
`~/.claude/moodboard/taste-profile.md`. You can open and edit that file anytime.

**2. Ask for something**
No commands, no config. Just build something and mention your taste:
> "moodboard for a portfolio site"
> "make this feel like my saved editorials"
> "build the hero strictly off this image"

**3. It picks a strictness level from your wording**

| You say | It does |
|---|---|
| "strictly off this image" | Treats that image as law: exact palette, mirrored composition |
| "moodboard for X" | Pulls direction from your 1-3 relevant collections, names the images that drove it |
| "just use my taste" | Builds normally, every judgment call goes your way |

Say **"stricter"**, **"looser"**, or **"not that one"** to move it mid-build.

**4. It reads the driving images through 8 lenses**
Each question produces a design decision, not a description:

| Lens | Asks the image | Example answer |
|---|---|---|
| Form | What shapes and contrast dominate? | one dark figure on empty field -> one hero element, lots of empty space |
| Material | What is it made of? | worn nylon and sewn patches -> matte surfaces, one collage moment |
| Process | How was it made? | woodblock, misaligned layers -> slightly offset color layers |
| Era | What scene is it from, rejecting what? | 2003 Antwerp anti-fashion -> mono type, no startup chrome |
| Composition | Where does the eye go? Where is it empty? | concrete mass, one window -> dense block cut by a single bright CTA |
| Function | What job did the object do? | a lamp diffuses light -> soft glow instead of drop shadows |
| Mood | What is the emotional temperature? | austere but tender -> minimal motion, quiet copy |
| Refusals | What would this image never do? | Rams audio wall, zero ornament -> strip every decorative element |

**5. It decides how literally to apply each answer**

| Move | Meaning | Example |
|---|---|---|
| quote | copy it exactly | use the reference's actual hexes |
| translate | same idea, new medium | garment drape -> overlapping layout |
| abstract | keep only the rule | "worn beats pristine" -> allow rough edges |
| invert | do the opposite, on purpose | reference is cluttered -> go stark, and say why |

This is why one image feeds many builds. A Raf bomber photo gives a landing page its
negative space, a deck its photography style, a product its material honesty. The
attributes transfer; the artifact does not.

**6. You get the work, or a brief**
During a build, the influence lands directly in the code or prompt. Ask for a brief
and it writes `MOODBOARD.md`: driving references with links, the design DNA, and a
W3C design-tokens block for Figma, CSS, or v0.

Palette roles (bg / surface / ink / accent) are computed from your references' real
hexes. Monochrome taste gives a monochrome palette. It never invents a color.
