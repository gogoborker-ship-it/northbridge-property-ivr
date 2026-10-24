# Northbridge claims desk

Agent SDK project (`@grok/agent-sdk`) for the Tuesday hail surge at Northbridge Mutual.

The served prompt is `bot/instructions.md`. The hour, the phone flow, and the roster are the evidence. Tools in `bot/tools/` read `shared/surge/` and must not invent queues or seat counts.

## Loop

```bash
npm run check:flow
npm run check
npx @grok/agent-sdk validate --dir .
npx @grok/agent-sdk tool call read_surge_hour --dir . --input '{"phase":"surge"}'
npm run dev:web
```

Run the CLI under Node, never Bun.

## Layout

- `scenario/tuesday-hail.json` is the hour.
- `ivr/property-flow.json` is the live flow, version `2026.10.24.1`.
- `ivr/proposals/tuesday-hail.json` is the prepared surge flow.
- `ivr/route-call.mjs` routes one utterance.
- `roster/tuesday-2pm.json` is the roster. Tools do not edit it.
- `bot/skills/` holds the three procedures.
- `shared/surge/` is import-only logic. It is not a discovered tool.
- `web/` is the claims owner desk.
- `evals/` is filesystem evals. Not `bot/evals/`.

## Do not

- Edit `ivr/property-flow.json` from a tool. The pull request is the change.
- Authorize overtime or score an agent in code.
- Add a second scenario beside Tuesday 2pm.
- Point `serve` at a parent folder. It mounts every sibling.
