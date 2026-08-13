---
name: gabe-repo-triage
description: >
  Triage one repository's maintainer queue - open issues, PRs, CI status, and
  unreleased changelog - and sort every item into autonomous / needs-Gabe /
  defer-close, URL-first. Use when Gabe says "triage <repo>", "what's in my
  queue", or "review the PRs/issues on X". Read-only triage by default; only
  acts when told to work autonomously.
---

# repo-triage

Maintainer-facing queue review for a single repo. Output is URL-first: every
item leads with its GitHub link so Gabe can click straight through. Triage one
repo unless told "broad", "all", or given multiple repos.

## Gates before any local work

- Checkout is on `main`, pull is clean, worktree has no uncommitted changes.
  If not, stop and report - do not mutate Gabe's working tree.
- Read `VISION.md` / `README.md` / `CLAUDE.md` if present to set the product-fit
  baseline.
- Treat Gabe's own comments on an issue/PR as authoritative routing.

## Gather the queue

Use `gh` against the repo's remote:
- `gh issue list` (open issues, newest + most-reacted),
- `gh pr list` (open PRs, draft vs ready, mergeable state),
- `gh run list` / `gh pr checks` (CI status for the default branch and PR heads),
- changelog / latest tag vs `main` to spot unreleased changes.

For no-remote local repos, triage the working tree and git log instead: dirty
state, stale branches, TODO/FIXME density, failing local checks.

## Classify each item

Give each item a one-line structured read: why it matters, author trust, product
fit, risk + blast radius, proof/test state, blockers, next action. Then sort:

1. **Autonomous** - fixable without Gabe's input: bugs with a clear repro, docs,
   narrow tests, low-risk cleanup, dependency bumps that pass CI.
2. **Needs Gabe** - blocked on his decision, missing credentials, security
   judgment, unclear product direction, or anything not yet decision-ready.
3. **Defer / close / supersede** - stale, duplicate, or overlapped by other work.

Trust read is factual: account age, repo activity, prior contributions. Risk is
low/medium/high with explicit blast-radius reasoning. Proof bar varies: bugs need
repro/logs, features need an end-to-end test plan, security changes need
code-path validation.

## Autonomous mode

When told to "work autonomously", process autonomous-eligible items in order:
implement the smallest correct fix, verify locally and end-to-end, run
`/code-review` before committing, get CI green, post test evidence, open the PR.
Never push to `main`, never release. Return to clean `main` and continue until
the autonomous queue is empty or you hit a blocker - then report it and stop.

