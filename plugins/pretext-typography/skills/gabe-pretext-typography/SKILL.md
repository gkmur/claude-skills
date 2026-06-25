---
name: gabe-pretext-typography
description: >
  Apply @chenglou/pretext when you need text measurement WITHOUT DOM reflow —
  predicting heights for virtualized lists, streaming LLM token rendering,
  shrinkwrap chat bubbles — or layouts CSS can't do (drop caps protruding
  into margins, center-floated pull quotes, image flow-around, canvas/SVG/
  WebGL text). Use also when you need programmatic line breaks for animation
  or cross-browser line-break consistency. Do NOT use for plain body text —
  browser native is equivalent quality and faster, and `text-wrap: pretty`
  ships in all modern browsers for free line balancing.
---

# Pretext Typography

`@chenglou/pretext` is a **text measurement engine that avoids DOM reflow**,
not a typography enhancement layer. Built by Cheng Lou at Midjourney to handle
streaming LLM tokens at 120fps without reflow storms. The drop-cap and
flow-around-dragon demos are flashy but, as Den Odell put it, "the wrong demo"
— the real point is virtualization and reflow-heavy UI.

Use it where browser layout cost is the bottleneck, or where CSS hits a wall.

## When to invoke

**Primary use cases (real production wins):**
- Virtualized lists / infinite scroll — predict heights of thousands of
  variable-content items without rendering (pairs with React Virtuoso,
  TanStack Virtual)
- Streaming chat / LLM token rendering — measure incoming text without
  triggering reflow on every token
- Shrinkwrap bubbles / dynamic-width containers — compute tightest-fit
  width before paint

**Secondary use cases (CSS can't do):**
- Drop cap that protrudes into the margin (left-side obstacle)
- Pull quote floated in the center of a paragraph (two-slot per line)
- Text wrapping around an irregular shape or floated image
- Canvas / SVG / WebGL text rendering
- Programmatic line breaks for per-line animation (stagger, reveal, morph)
- Cross-browser line-break consistency for design QA
- Mixed-bidi / non-Latin script layout with obstacle math

## When NOT to invoke

- Plain left-aligned body paragraphs — browser native = same result, faster.
  Reach for `text-wrap: pretty` (Chrome/Safari/Firefox 2024+) first for line
  balancing. Zero JS, zero a11y risk.
- Headings, buttons, nav items, code blocks
- Anything under 2 lines
- Static labels that never change (prepare cost dominates)
- Text that changes every frame (prepare cost dominates — Cheng Lou flags
  this explicitly)
- ASCII-only Latin lists where uWrap.js is sufficient (~27x faster for
  that narrow case; Pretext's overhead is Unicode/emoji/bidi correctness)
- Hyphenation (not in Pretext — use `hyphens: auto` in CSS)

## Library facts

- Two-phase: `prepare()` does one-time Canvas glyph measurement (~20ms);
  `layout()` is pure arithmetic on cached widths (~0.0002ms)
- Greedy line-breaking by default; recent versions ship a working Knuth-Plass
  mode — check `npm view @chenglou/pretext` for current API surface
- Returns `{ text, width, start, end }` per line — enables obstacle math
- All scripts + emoji + mixed-bidi supported (this is the cost vs uWrap.js)
- ~47KB raw bundle (loads dynamically — not in initial JS)
- Latest version: check `npm view @chenglou/pretext version` before scaffolding

## Known limitations

- `system-ui` on macOS has accuracy issues per the README — pin a real font
- No `font-feature-settings`, `font-variation-settings`, or
  `font-optical-sizing` support
- Myanmar and some CJK proportional fonts flagged unresolved in upstream
  RESEARCH.md
- Reports of Firefox/Linux and Safari rendering drift — QA on real browsers,
  not just Chrome
- If you render to canvas/WebGL instead of DOM, you lose screen readers,
  find-in-page, and selection — DOM virtualization is the safer pattern

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

### Virtualized list height prediction (primary win)

For a virtualized list of variable-content items (chat messages, feed
cards, search results), call `prepareWithSegments` once per item text +
the column width, then `layoutNextLine` in a loop to count lines. Multiply
by line-height to get exact pixel height — no off-screen render, no
reflow. Pipe the heights into React Virtuoso, TanStack Virtual, or your
own absolute-positioned scroller.

Cache prepared text aggressively; this is where the perf win compounds.

### Streaming text without reflow

For streaming LLM tokens or live transcripts, measure the incoming chunk
with Pretext to know its final line count before painting. Avoids the
reflow storm of appending text node + reading `offsetHeight` per token.

### Justified column (NO visible win, foundation only)

For plain unjustified prose, native CSS is identical. Only build this if
you need a foundation that downstream obstacle patterns extend. Replace
`element.textContent = lines.join('\n')` and set
`white-space: pre-line`. For pure line balancing on plain prose, prefer
`text-wrap: pretty` — zero JS, no a11y risk.

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

Track cursor Y. Line nearest cursor gets re-laid at higher quality
(Knuth-Plass mode if available in the installed version).

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

## Wider ecosystem (reference)

- Production: Midjourney (streaming token reflow), Creative Tim
  shadcn/ui editorial blocks
- Native ports: `swift-pretextkit` (Apple platforms), `expo-pretext`
  (React Native)
- Creative: chenglou.me/pretext demos (text wrapping around 3D objects,
  Bad Apple in reflowing text, ASCII camera modes)
- Critical reading: Den Odell, "You're looking at the wrong Pretext demo"
  — argues DOM virtualization is the real point, not the canvas demos

## Anti-patterns

- Wrapping every paragraph site-wide. Cost > benefit for plain prose.
  Use `text-wrap: pretty` for line balancing instead.
- Using Pretext to make body text "mold to viewports" — that's what
  CSS already does. Pretext does not improve viewport reflow quality
  for plain HTML paragraphs.
- Rendering text to canvas/WebGL for an article page — loses screen
  readers, find-in-page, and selection. DOM virtualization is the
  safer pattern unless you genuinely need WebGL.
- Skipping the sr-only mirror. Breaks screen readers.
- Skipping the mobile mode-switch. Breaks narrow viewports.
- Importing Pretext statically. Bloats initial bundle.
- Re-laying out on every animation frame. Use ResizeObserver + RAF gate.
- Using Pretext for ASCII-only Latin text where uWrap.js suffices and
  is ~27x faster.

## Library version policy

Check current version before scaffolding:

```sh
npm view @chenglou/pretext version
```

Bumping versions: Pretext is pre-1.0. Read the CHANGELOG for breaking
changes in `prepareWithSegments` / `layoutNextLine` signatures before
upgrading. Run `npm run validate` to catch perf budget regressions.

