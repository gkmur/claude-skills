import assert from 'node:assert/strict';
import { lstatSync, mkdtempSync, readlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(ROOT, 'scripts', 'dev-link.mjs');

function runDevLink(home) {
  return spawnSync(process.execPath, [SCRIPT], {
    encoding: 'utf8',
    env: { ...process.env, HOME: home },
  });
}

test('dev-link creates its destination and remains idempotent', () => {
  const home = mkdtempSync(path.join(tmpdir(), 'gkmur-dev-link-'));

  try {
    const first = runDevLink(home);
    assert.equal(first.status, 0, first.stderr);

    const link = path.join(home, '.claude', 'skills', 'moodboard');
    assert.equal(lstatSync(link).isSymbolicLink(), true);
    assert.equal(
      readlinkSync(link),
      path.join(ROOT, 'plugins', 'moodboard', 'skills', 'moodboard'),
    );

    const second = runDevLink(home);
    assert.equal(second.status, 0, second.stderr);
    assert.match(second.stdout, /already current/);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
