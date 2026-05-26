# gkmur

Gabriel Murray's personal Claude skills marketplace.

## Install

```sh
claude plugin marketplace add gkmur/claude-skills
claude plugin install pretext-typography@gkmur
claude plugin install moodboard@gkmur
```

## Plugins

### pretext-typography

Advanced web typography via [@chenglou/pretext](https://www.npmjs.com/package/@chenglou/pretext) — drop caps with margin protrusion, center-floated pull quotes, image flow-around, canvas/SVG text rendering, reflow-free measurement.

Steers AWAY from applying Pretext to plain body text (browser native is equivalent and faster). Codifies a11y/perf/mobile contracts.

### moodboard

Pulls visual inspiration from a local Pinterest mirror (`~/wiki/pinterest/`) via the qmd MCP. Surfaces 3 curated pin candidates with thumbnail previews, lets you pick/refine, then extracts design DNA (palette, type, texture, composition, motion) into `MOODBOARD.md` as input for design-consultation, frontend-design, or design-shotgun.

Local-only: requires the Pinterest shadow and qmd MCP server.

## License

MIT
