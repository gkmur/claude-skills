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
- Pin: <url>
- Thumb: ~/wiki/raw/pinterest/.thumbs/<id>.jpg
- Caption: <caption>
- Dominant: #hex
- Why: <one line>

### 3. Detail - <board>
- Pin: <url>
- Thumb: ~/wiki/raw/pinterest/.thumbs/<id>.jpg
- Caption: <caption>
- Dominant: #hex
- Why: <one line>

## Design DNA

**Palette** (roles from build-palette.mjs)
- bg: #hex
- surface: #hex
- ink: #hex
- accent: #hex

**Typography direction** - <1-2 sentences, model-inferred from captions; a direction, not specific fonts>

**Texture / materiality** - <1 sentence>

**Composition** - <1 sentence>

**Motion** - <1-10> - <description>

**Anti-patterns**
- <ban 1>
- <ban 2>
- <ban 3>

## Tokens (portable)

<!-- paste the `tokens` object from: node scripts/build-palette.mjs "#hex" "#hex" ... -->
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

