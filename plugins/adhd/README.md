# adhd

Output-style skill: lead with the next action, number multi-step work, restate
state across turns, suppress tangents, give specific time estimates, make wins
visible.

Invoke with `/adhd`. Stays on until "stop adhd mode".

Always-on: `touch ~/.claude/.adhd-always` — the SessionStart hook then injects
the ruleset every session. Delete the file to turn it off.

Forked from [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) (MIT),
renamed and trimmed to the Claude Code surface.
