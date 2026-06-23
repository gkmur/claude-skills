#!/usr/bin/env node
// Ship plugins to the gkmur marketplace in one command. Bumps the version in each
// named plugin's plugin.json (so consumers' /plugin update sees a new version),
// commits, and pushes. Daily iteration does NOT need this — edits hot-reload
// locally via dev-link. This is the "publish for other people" button.
//
//   node scripts/release.mjs <plugin...|--all> [--minor|--major]   (default: patch)
//
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PLUGINS = path.join(ROOT, 'plugins');
const argv = process.argv.slice(2);
const level = argv.includes('--major') ? 'major' : argv.includes('--minor') ? 'minor' : 'patch';
const names = argv.includes('--all')
  ? readdirSync(PLUGINS).filter((p) => existsSync(manifestOf(p)))
  : argv.filter((a) => !a.startsWith('--'));

if (!names.length) { console.error('usage: node scripts/release.mjs <plugin...|--all> [--minor|--major]'); process.exit(1); }

function manifestOf(plugin) { return path.join(PLUGINS, plugin, '.claude-plugin', 'plugin.json'); }
function bump(v, lvl) {
  const [a, b, c] = String(v || '0.0.0').split('.').map((n) => parseInt(n, 10) || 0);
  return lvl === 'major' ? `${a + 1}.0.0` : lvl === 'minor' ? `${a}.${b + 1}.0` : `${a}.${b}.${c + 1}`;
}

const changed = [];
for (const name of names) {
  const mf = manifestOf(name);
  if (!existsSync(mf)) { console.error(`skip ${name}: no plugin.json`); continue; }
  const json = JSON.parse(readFileSync(mf, 'utf8'));
  const next = bump(json.version, level);
  json.version = next;
  writeFileSync(mf, JSON.stringify(json, null, 2) + '\n', 'utf8');
  changed.push(`${name}@${next}`);
  console.log(`bumped ${name} -> ${next}`);
}
if (!changed.length) process.exit(1);

const git = (...a) => execFileSync('git', ['-C', ROOT, ...a], { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
git('add', '-A');
git('commit', '-m', `release: ${changed.join(', ')}`);
process.stdout.write('pushing... ');
try { git('push'); console.log('done'); }
catch (e) { console.log('FAILED\n' + (e.stderr || e.message)); process.exit(1); }

console.log(`\nPublished ${changed.join(', ')}.`);
console.log('Consumers (incl. you on cloud/Cowork) get it with:');
console.log('  /plugin marketplace update gkmur   then   /plugin update');
console.log('Your local Macs already run the latest via dev-link (file-based hot-reload).');
