---
name: pretext-typography
description: >
  Apply @chenglou/pretext for advanced web typography that CSS can't do —
  drop caps with margin protrusion, center-floated pull quotes, image
  flow-around wraps, multi-slot per-line layouts, canvas/SVG text rendering,
  and reflow-free measurement. Use when the user wants typography that
  flows around obstacles, asks for "book-quality" text, or needs precise
  programmatic line-break control. Do NOT use for plain body text — browser
  native rendering is equivalent and faster for that case.
---

# Pretext Typography

`@chenglou/pretext` is a canvas-measured layout engine. It does NOT replace
browser text rendering for ordinary prose. Use it where CSS hits a wall.

## When to invoke

- Drop cap that protrudes into the margin (left-side obstacle)
- Pull quote floated in the center of a paragraph (two-slot per line)
- Text wrapping around an irregular shape or floated image
- Canvas / SVG / WebGL text rendering
- Need to measure text height/width WITHOUT triggering DOM reflow
- Need to read line breaks programmatically (e.g. for animation)
- Need consistent line breaks across browsers
- Mixed-bidi / non-Latin script layout

## When NOT to invoke

- Plain left-aligned body paragraphs (browser native = same result)
- Headings, buttons, nav items, code blocks
- Anything under 2 lines
- Justified text expecting tighter spacing (Pretext is greedy too — no
  Knuth-Plass yet as of v0.0.7)
- Hyphenation (not in Pretext)

## Library facts

- Greedy line-breaking (same algorithm as the browser)
- Canvas-based measurement (no DOM reflow per layout)
- Returns `{ text, width, start, end }` per line — enables obstacle math
- All scripts + emoji + mixed-bidi supported
- ~47KB raw bundle (loads dynamically — not in initial JS)
- Latest version: check `npm view @chenglou/pretext version` before scaffolding

## Core API

```ts
import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext';

const prepared = prepareWithSegments(text, '16px Inter');
let cursor = { segmentIndex: 0, graphemeIndex: 0 };
while (true) {
  const line = layoutNextLine(prepared, cursor, availableWidth);
  if (!line) break;
  // line.text, line.width, line.start, line.end
  cursor = line.end;
}
```

## Required patterns

### 1. Lazy-load Pretext

Pretext is large. Always dynamic-import behind a cached promise so it ships
out of the initial bundle:

```ts
let pretextModulePromise: Promise<PretextModule | null> | null = null;
function loadPretextModule() {
  if (!pretextModulePromise) {
    pretextModulePromise = import('@chenglou/pretext').catch(() => null);
  }
  return pretextModulePromise;
}
```

### 2. Cache prepared text

`prepareWithSegments` does font measurement. Cache by `(text, font)`:

```ts
const prepareCache = new Map<string, PreparedTextWithSegments>();
const key = `${font}|${text}`;
```

### 3. ResizeObserver, not window.resize

ResizeObserver fires inside flex/grid changes. `window.resize` misses those.
Batch via RAF.

### 4. Native fallback

If Pretext fails to load, leave native rendering intact. Never break the page.

### 5. A11y contract

When you replace visible text with positioned spans:
- Keep an sr-only sibling with the full text for screen readers
- Aria-hidden the visual spans (or the parent)
- Preserve reading order in the DOM

### 6. Mobile degradation

Detect when obstacles disappear (e.g. drop cap becomes `position: static`
on narrow viewports) and restore native rendering. Don't ship a broken
layout on mobile.

## Patterns

### Justified column (NO visible win, foundation only)

For plain unjustified prose, native CSS is identical. Only build this if
you need a foundation that downstream obstacle patterns extend. Replace
`element.textContent = lines.join('\n')` and set
`white-space: pre-line`.

### Drop cap (left obstacle)

Cap is a CSS-styled DOM element with `position: absolute; left: -Npx`.
Read its bounding rect relative to the body. For each line where the
band overlaps cap's vertical span, narrow the slot to `[capRight+gap,
containerRight]`. Below the cap, full container width.

Render lines as absolutely-positioned spans inside the body element.
Hide source text via sr-only mirror.

### Center pull quote (multi-slot per line)

Pull quote is centered in the column. Lines that span the quote's
vertical band have TWO slots per line: `[0, quoteLeft]` and
`[quoteRight, containerRight]`. Call `layoutNextLine` twice per line,
fill slots left-to-right in reading order.

### Image flow-around (right obstacle)

Image floated logically right. Mirror image: lines intersecting image
band use slot `[0, imageLeft]`. Below the image, full width.

### Reading flashlight (research/lab only)

Track cursor Y. Line nearest cursor gets re-laid at higher quality.
With greedy-only Pretext, this is essentially decorative — wait for
upstream Knuth-Plass to make this meaningful.

## Performance budget

- Pretext lazy chunk ~47KB raw (~15KB gzip). Loads only on pages that use it.
- Inflates the `largest JS asset` budget. Set `maxJsBytes: 56 * 1024` or higher.
- Per layout call: ~0.1ms after prepare. Prepare is ~20ms one-time.
- Always RAF-batch ResizeObserver callbacks.

## Quality gates

Before shipping any Pretext-driven section:

1. Resize from 320 to 2560 — verify reflow at each breakpoint
2. Disable JS — verify native fallback renders the same content
3. `prefers-reduced-motion: reduce` — no transitions
4. VoiceOver / screen reader — verify reading order + completeness
5. Text selection — verify user can still select the visible text
   (or accept the tradeoff explicitly)
6. View Transitions — verify cleanup + re-init on navigation

## Reference implementation

`gkmur/portfolio` (Astro 5 + Cloudflare Pages):
- `src/scripts/pretext-typography.ts` — `createJustifiedParagraph`,
  `createReadableColumn`, `createDropCapParagraph`
- `src/components/ProjectHero.astro` — drop cap component
- `src/scripts/text-river.ts` — obstacle wrap example (cursor trail)

## Anti-patterns

- Wrapping every paragraph site-wide. Cost > benefit for plain prose.
- Using `quality: 'knuth-plass'` — accepted but no-op until upstream ships it.
- Skipping the sr-only mirror. Breaks screen readers.
- Skipping the mobile mode-switch. Breaks narrow viewports.
- Importing Pretext statically. Bloats initial bundle.
- Re-laying out on every animation frame. Use ResizeObserver + RAF gate.

## Library version policy

Check current version before scaffolding:

```sh
npm view @chenglou/pretext version
```

Bumping versions: Pretext is pre-1.0. Read the CHANGELOG for breaking
changes in `prepareWithSegments` / `layoutNextLine` signatures before
upgrading. Run `npm run validate` to catch perf budget regressions.
