#!/usr/bin/env node
// Fast dev loop: symlink every plugin's skill dir into ~/.claude/skills so edits
// hot-reload in the live Claude Code session — no /plugin update cycle. The
// marketplace stays the *distribution* copy; this is the *iteration* copy.
// Idempotent. Skips a name already linked to a different source (e.g. the wiki
// copy of gabe-writing-voice).
import { readdirSync, existsSync, lstatSync, mkdirSync, readlinkSync, symlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PLUGINS = path.join(ROOT, 'plugins');
const DEST = path.join(process.env.HOME, '.claude', 'skills');

mkdirSync(DEST, { recursive: true });

let linked = 0, kept = 0, skipped = [];
for (const plugin of readdirSync(PLUGINS)) {
  const skillsDir = path.join(PLUGINS, plugin, 'skills');
  if (!existsSync(skillsDir)) continue;
  for (const skill of readdirSync(skillsDir)) {
    const src = path.join(skillsDir, skill);
    if (!existsSync(path.join(src, 'SKILL.md'))) continue;
    const link = path.join(DEST, skill);
    if (existsSync(link) || isLink(link)) {
      const cur = isLink(link) ? readlinkSync(link) : null;
      if (cur === src) { kept++; continue; }
      if (cur && cur !== src) { skipped.push(`${skill}: already -> ${cur}`); continue; }
      // a real dir/file with this name exists — don't clobber
      skipped.push(`${skill}: non-symlink exists at ${link}`); continue;
    }
    symlinkSync(src, link);
    linked++;
    console.log(`linked ${skill} -> plugins/${plugin}/skills/${skill}`);
  }
}
function isLink(p) { try { return lstatSync(p).isSymbolicLink(); } catch { return false; } }
console.log(`\n${linked} new, ${kept} already current` + (skipped.length ? `, ${skipped.length} skipped:\n  ${skipped.join('\n  ')}` : ''));
