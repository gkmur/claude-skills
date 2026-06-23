---
name: gabe-wrap-up
description: >
  Wrap up the current session by writing/updating the repo's .claude/STATE.md
  whiteboard so the next session can answer "where were we?". Invoke when the
  user says wrap up / close out / that's it / where did we leave off, OR
  proactively when a session winds down after substantial work. Synthesizes
  current focus, what's done, what's pending/blocked, and open decisions;
  bridges durable facts to ~/wiki/log.md. Do NOT use mid-task — only at a clean
  stopping point. Reading state back is automatic (a SessionStart hook loads
  STATE.md), so this skill is the WRITE side only.
---

# wrap-up — session state whiteboard

Synthesize this session into the repo's canonical `STATE.md` so the next session (on either machine) picks up cleanly. It's a whiteboard (a synthesis you overwrite), not a transcript.

## Step 1 — Resolve the canonical STATE.md path (worktree-safe)

All worktrees of a repo share one `.git` common dir, so they must share one STATE.md. Run:

```bash
common=$(git rev-parse --git-common-dir 2>/dev/null) || { echo "not a git repo"; exit 0; }
common=$(cd "$common" && pwd)        # absolute
root=$(dirname "$common")            # main repo root
mkdir -p "$root/.claude"
echo "$root/.claude/STATE.md"
```

Use that path as `STATE.md`. If not in a git repo, ask the user where to write it (or skip).

## Step 2 — Read the existing STATE.md first (merge, don't clobber)

If `STATE.md` already exists, read it. **Carry forward pending/blocked items and open decisions that were NOT resolved this session.** Only remove a pending item if this session actually closed it (move it to Done) or the user says it's dead. Losing a real open thread is the main failure mode — avoid it.

## Step 3 — Write STATE.md

Keep it under ~25 lines. Use this shape:

```markdown
# <repo> — session state

_Whiteboard for "where were we". Synthesis, not a transcript. Updated on wrap-up._

## Current focus
<1-2 lines: what we're actively working on right now>

## Done (recent)
- <concrete completed items from this session + still-relevant prior ones>

## Pending / blocked
- <unfinished work, with enough context to resume cold: file paths, decisions made, next step>

## Open decisions
- <unresolved choices the user still needs to make>

## Last updated
<YYYY-MM-DD>
```

Rules:
- Be concrete enough to resume cold: name files, URLs, exact next steps. "Fix the bug" is useless; "auth token refresh in src/auth.ts:42, repro in test X, next: check clock skew" is good.
- Synthesis, not stream-of-consciousness. Cut anything that won't matter next session.
- Match the user's terse voice. No filler.

## Step 4 — Bridge durable items to the wiki

STATE.md is ephemeral (task state, wiped as work completes). The wiki is durable. If this session produced something durable — a decision, a learned fact, a shipped system, a person/project update — append a one-line dated entry to `~/wiki/log.md` per the user's global wiki rule. Don't duplicate ephemeral task-state into the wiki.

## Step 5 — Offer to commit (never auto-commit)

- If the repo is **private**, offer: "Commit STATE.md so it syncs to your other machine?" Commit only if the user agrees (follow their git rules — specific files, no auto-push unless asked).
- If the repo may go **public**, suggest gitignoring `.claude/STATE.md` instead (the SessionStart hook reads it whether or not it's committed).
- Do not commit without explicit go-ahead.

## Step 6 — Short verbal summary

Give the user a tight summary of where things stand and the top 1-3 things to pick up next time. This is the same content as STATE.md, spoken — keep it short.

## Notes

- Reading is automatic: `~/.claude/hooks/session-state-load.sh` injects STATE.md at every SessionStart, so next session "where were we?" is already answered. This skill only writes.
- For full back-and-forth recall, the user can run `claude --resume`. For durable knowledge, `qmd` searches `~/wiki`.
