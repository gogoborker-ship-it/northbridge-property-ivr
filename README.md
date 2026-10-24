# Northbridge claims desk

This repository is the Tuesday hail demo for Northbridge Mutual property claims. It holds the live phone flow, the roster, the scenario, the claims owner desk, and the Cursor Agent SDK agent that reads them.

The live flow is version `2026.10.24.1`. A new loss, including a hail claim or a neck injury, reaches an adjuster, and the sales offer stays on. The prepared change is `ivr/proposals/tuesday-hail.json`. [Pull request #1](https://github.com/gogoborker-ship-it/northbridge-property-ivr/pull/1) is that change waiting for the IVR developer. It does not merge itself.

## The hour

Tuesday 2:00pm local. A normal hour is 70 offered calls. The hail hour is 220. Of those, 140 are simple storm claims, 40 are sales, 22 are an upsell during a claim, and 18 mention an injury or a lawyer. Abandonment moves from 5% to 18%. Average handle time moves from 6m 40s to 11m 20s. Containment moves from 42% to 15%. First-call resolution moves from 74% to 61%. CSAT moves from 4.4 to 3.6. Service level moves from 82% to 34%. Occupancy moves from 78% to 96%.

The Tuesday roster has 10 claims adjusters, 8 sales agents, 6 of those sales agents trained for claims, and 4 people on call. Overtime is not authorized.

## Run the desk

Node 22.13 or newer. Use Node, not Bun.

```bash
npm install
cd web && npm install && cd ..
npm run dev:web
```

Open http://127.0.0.1:4488. The quiet hour is the live band. Simulate the storm hour, then start the three agents. The desk reads the scenario, runs `ivr/route-call.mjs` against the live flow and the prepared flow, and reads the roster. Accept the decision or send it back. The pull request link opens the flow diff.

## Run a caller through the live flow

```bash
node ivr/route-call.mjs "The hail went through the skylight and water is coming into the bedroom."
node ivr/route-call.mjs --flow ivr/proposals/tuesday-hail.json "The hail broke the skylight and my neck is hurting."
npm run check:flow
```

On the live flow the hail caller reaches `adjuster_queue`. On the prepared flow that caller reaches `self_service_fnol`, and a caller who also mentions a neck injury reaches `licensed_queue` because the injury match runs first.

## The three agents

The Cursor agent is `bot/agent.ts`. The model is `grok-4.5`. Each agent has one skill and calls one tool. The Claims Business Owner is the leader.

- Claims Intake Agent uses `bot/skills/intake-surge-playbook.md` and `write_operating_decision`. It writes the operating decision. It does not edit the flow or the roster.
- Contact Flow Agent uses `bot/skills/flow-release-rules.md` and `propose_flow_change`. It runs the sandbox and points at the pull request. It does not merge.
- Workforce Management Agent uses `bot/skills/capacity-and-quality.md` and `propose_staffing`. It says who can move without overtime. Overtime waits for the workforce manager. The two flagged calls wait for the quality supervisor.

A rejected review returns to the Claims Business Owner. The live flow stays on version `2026.10.24.1`.

To talk to the agent, sign in once with `npx @grok/agent-sdk login`, then:

```bash
npm run dev:agent
```

The playground is http://127.0.0.1:4471/playground. A model turn spends Cursor usage. The desk does not call the model.

## Checks

```bash
npm run check:flow
npm run check
npm run validate
```

`check:flow` proves the live routes and the prepared routes. `check` typechecks the agent and the shared procedures. `validate` checks the agent package. Evals in `evals/` ask the model to call the right tool and leave the live files alone. They spend usage, so run them when you want a model pass:

```bash
npx @grok/agent-sdk eval --dir . --list
npx @grok/agent-sdk eval --dir .
```
