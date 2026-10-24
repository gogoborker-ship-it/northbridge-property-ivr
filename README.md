# Northbridge property phone flow

This repository is the live phone flow for Northbridge Mutual property claims. A caller who reports a new loss reaches an adjuster. Sales and upsell prompts stay on. Injury language and attorney language travel with every other new loss, because the flow has no separate licensed route.

The Tuesday 2pm roster sits beside the flow so a reviewer can see who is scheduled. This repository does not move seats. A staffing change belongs in its own review.

## Run a caller through the flow

Node 22 or newer.

```bash
node ivr/route-call.mjs "The hail went through the skylight and water is coming into the bedroom."
```

That caller is reporting a storm loss. On this flow they land in `adjuster_queue`, and the sales offer still plays.

```bash
node ivr/route-call.mjs "I was in the car when the tree came down and my neck is hurting."
```

That caller mentions an injury. On this flow they also land in `adjuster_queue`.

```bash
npm run check
```

The check records the live behavior. Storm calls and injury calls reach an adjuster, and the sales offer is on. GitHub runs the same check on every push and pull request.

## Files

`ivr/property-flow.json` is the flow the phone tree loads. Version `2026.10.24.1` is what is live.

`ivr/route-call.mjs` walks that file in order and prints the queue for one utterance. A route may carry its own `match` list. Routes without one use the built-in words for that intent.

`roster/tuesday-2pm.json` is who is scheduled from 2pm to 4pm. Ten adjusters are on claims. Eight sales agents are on sales. Six of those sales agents are trained for claims. Four people are on call. Overtime is not authorized.
