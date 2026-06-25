# skills - CLAUDE.md
> Dev checkout of the `gkmur/skills` plugin marketplace (registered under marketplace name `gkmur`; renamed from `claude-skills` 2026-06-11). Each subdirectory of `plugins/` is a published plugin; its skill dirs are `gabe-`prefixed (`gabe-moodboard`, `gabe-pretext-typography`, `gabe-wrap-up`, `gabe-rubin`, `gabe-improve-skill`, `gabe-orchestrate`, `gabe-repo-triage`, `gabe-writing-voice`).

## Two-path workflow
Iterate fast locally; publish to the marketplace only when shipping to other people / the cloud.

```bash
# DEV (fast): symlink every plugin's skill dir into ~/.claude/skills so edits
# hot-reload in the live Claude Code session — no /plugin update cycle. Run once
# per machine (and after adding a new plugin skill).
npm run dev-link

# RELEASE (ship): bump version(s) in plugin.json, commit, push. Only needed to
# distribute — your local Macs already run the latest via dev-link.
npm run release -- <plugin...|--all> [--minor|--major]   # default: patch
```

`dev-link` and `release` are dependency-free node scripts in `scripts/`. The marketplace is git-sourced, so a release is just a versioned push; consumers run `/plugin marketplace update gkmur` + `/plugin update`.

## Architecture
- `plugins/` - one subdirectory per plugin; each contains a `SKILL.md` (the skill prompt) and any supporting assets
- `plugins/moodboard/` - Pinterest-mirror moodboard tool (requires local wiki + qmd MCP)
- `plugins/pretext-typography/` - advanced web typography via @chenglou/pretext
- `plugins/session-state/` - session continuity wrap-up skill
- `plugins/rubin/` - Rick Rubin Socratic critique-and-ideation
- `plugins/skill-improver/` - dynamic multi-lens skill improver with grill gate
- `rubin-workspace/` - scratch/working space for rubin plugin development; not published

## Gotchas
- **Local dev does NOT need `/plugin update`.** After `npm run dev-link`, the plugin skills are file-based symlinks in `~/.claude/skills` and hot-reload on edit. `/plugin update` only matters for *consumers* (other people, or you on claude.ai/Cowork) after `npm run release`.
- After `release`, the installed plugin still needs `/plugin marketplace update gkmur` + `/plugin update` to refresh — the registry reads the GitHub repo on update; symlinking the plugin cache does not work (it gets clobbered).
- `gabe-moodboard` / `gabe-rubin` are local-only (need the wiki MCP / Pinterest shadow at `~/wiki/pinterest/`); they fail silently elsewhere — keep that in mind before listing them as broadly installable.
- There is no CI/CD. Skills are plain markdown prompt files; `scripts/` are the only code.

## Out of bounds
- Do not modify `rubin-workspace/` and commit it unless you know it maps to a published plugin change.

<!-- written at be7fcb6, 2026-06-10 -->

