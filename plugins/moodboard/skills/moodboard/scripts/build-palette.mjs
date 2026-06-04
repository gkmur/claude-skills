#!/usr/bin/env node
// build-palette.mjs - turn the dominant hexes of the selected pins into a roled,
// portable palette + a W3C-design-tokens block. Deterministic, zero-dependency:
// pure arithmetic on hex strings (no image decoding). The pins already carry a
// dominant hex from the gbrain index, so this composes them into bg/surface/ink/
// accent roles instead of the model hand-rolling the token JSON each time.
//
// Subjective DNA (type direction, motion, texture) stays model-inferred - it is not
// deterministic and must not be faked by a script.
//
//   node scripts/build-palette.mjs "#0a0a0a" "#f4f4f4" "#ec4d4d" "#2f2e2e"
//
// Roles: ink = darkest, bg = lightest, surface = mid between them, accent = most
// saturated (chroma). With <4 colors it fills what it can and omits the rest.

const hexes = process.argv.slice(2)
  .map((h) => h.trim())
  .filter(Boolean)
  .map(normalize)
  .filter(Boolean);

if (hexes.length === 0) {
  console.error('usage: build-palette.mjs "#hex" "#hex" ... (the dominant colors of the selected pins)');
  process.exit(1);
}

function normalize(h) {
  let s = h.replace(/^#/, "").toLowerCase();
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/.test(s)) return null;
  return "#" + s;
}
function rgb(hex) {
  const c = hex.slice(1);
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}
// relative luminance (sRGB, WCAG)
function luminance(hex) {
  const [r, g, b] = rgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
// HSL saturation as a chroma proxy
function saturation(hex) {
  const [r, g, b] = rgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return 0;
  const d = max - min;
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
}

const uniq = [...new Set(hexes)];
const byLum = [...uniq].sort((a, b) => luminance(a) - luminance(b)); // dark -> light
const ink = byLum[0];
const bg = byLum[byLum.length - 1];
const accent = [...uniq].sort((a, b) => saturation(b) - saturation(a))[0];

const roles = {};
roles.bg = bg;
roles.ink = ink;
// surface: a mid-luminance color that isn't bg or ink; else skip
const mids = byLum.filter((h) => h !== bg && h !== ink);
if (mids.length) roles.surface = mids[Math.floor((mids.length - 1) / 2)];
// accent: only if it adds a distinct, reasonably saturated color
if (accent && accent !== bg && accent !== ink && saturation(accent) > 0.15) roles.accent = accent;

const tokens = {
  $schema: "https://design-tokens.github.io/community-group/format/",
  color: Object.fromEntries(
    Object.entries(roles).map(([k, v]) => [k, { $type: "color", $value: v }])
  ),
};

console.log(JSON.stringify({ roles, tokens, inputs: uniq }, null, 2));
