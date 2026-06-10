# claude-skills - CLAUDE.md
> Dev checkout of the `gkmur/claude-skills` plugin marketplace. Each subdirectory of `plugins/` is a published skill (moodboard, pretext-typography, session-state, rubin, skill-improver). Edit here, push to GitHub, then run `/plugin update` in Claude Code to deploy.

## Commands
No package.json. All operations are git + Claude plugin CLI.

```bash
# Publish a new plugin version after editing plugins/<name>/
git add plugins/<name>/ && git commit -m "feat(<name>): ..." && git push

# Install / update in Claude Code (run in the Claude Code session, not here)
claude plugin install <name>@gkmur
claude plugin update <name>@gkmur
```

## Architecture
- `plugins/` - one subdirectory per plugin; each contains a `SKILL.md` (the skill prompt) and any supporting assets
- `plugins/moodboard/` - Pinterest-mirror moodboard tool (requires local wiki + qmd MCP)
- `plugins/pretext-typography/` - advanced web typography via @chenglou/pretext
- `plugins/session-state/` - session continuity wrap-up skill
- `plugins/rubin/` - Rick Rubin Socratic critique-and-ideation
- `plugins/skill-improver/` - dynamic multi-lens skill improver with grill gate
- `rubin-workspace/` - scratch/working space for rubin plugin development; not published

## Gotchas
- **Editing here does NOT update the live plugin** until you push and run `/plugin update`. Forget either step and Claude Code runs the old version.
- `moodboard` requires the Pinterest shadow at `~/wiki/pinterest/` and the qmd MCP. It will fail silently if those are missing.
- There is no CI/CD. The plugin registry reads directly from the GitHub repo on install/update.
- No package.json or build step. Skills are plain markdown prompt files.

## Out of bounds
- Do not modify `rubin-workspace/` and commit it unless you know it maps to a published plugin change.

<!-- written at be7fcb6, 2026-06-10 -->
