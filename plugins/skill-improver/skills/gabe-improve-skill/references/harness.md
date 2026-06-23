# Wiring into skill-creator's statistical harness

Read this only when the user wants HARD NUMBERS behind a trigger or eval change,
not just the workflow's reasoning. The improver proposes changes; skill-creator
measures them. Don't rebuild either script — call them.

Locate skill-creator first:

```bash
find ~/.claude/plugins/marketplaces -type d -name skill-creator 2>/dev/null | grep '/skills/skill-creator$'
```

## Trigger rate (description changes)

`scripts/run_loop.py` runs each query 3x to get a stable trigger rate, splits
60/40 train/held-out, and returns `best_description` chosen by the held-out
score (so it doesn't overfit). Use it to prove a trigger-lens change.

1. Build a trigger eval set from the lens's queries (the `trigger` finding's
   evidence already lists should/should-not queries):

   ```json
   [
     {"query": "realistic concrete prompt", "should_trigger": true},
     {"query": "tricky near-miss prompt", "should_trigger": false}
   ]
   ```

2. Run from the skill-creator directory:

   ```bash
   python -m scripts.run_loop \
     --eval-set <path-to-trigger-eval.json> \
     --skill-path <target-skill-path> \
     --model <current session model id> \
     --max-iterations 5 --verbose
   ```

3. Report the before/after held-out score and apply `best_description` only if
   it beats the current one on the held-out split.

## Output quality (eval changes)

For an `eval`-lens change, use skill-creator's full run → grade → aggregate loop
to compare the snapshot vs the edited skill on the same prompts:

- Spawn with-skill and baseline (the snapshot) runs on each eval prompt.
- Grade against assertions.
- `python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name>`
  gives pass_rate, time, tokens as mean ± stddev with the delta.

Apply the change only if the edited skill's pass_rate beats the snapshot's
beyond the stddev — otherwise it's noise. See skill-creator's SKILL.md
"Running and evaluating test cases" for the full mechanics.

## Rule of thumb

Numbers gate behavior changes; the grill gates everything. A change with a nice
story but a flat benchmark doesn't land.
