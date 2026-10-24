import { loadFlow, routeUtterance } from "./route-call.mjs";

const flow = loadFlow();
const failures = [];

function expect(utterance, queue) {
  const result = routeUtterance(flow, utterance);
  if (result.queue !== queue) {
    failures.push(
      `"${utterance}" went to ${result.queue ?? "none"}, expected ${queue}.`,
    );
  }
}

if (flow.prompts.salesOffer.enabled !== true) {
  failures.push("The live flow should still be offering sales.");
}

const surgeRoute = flow.nodes.main_menu.routes.find(
  (route) =>
    route.intent === "storm_claim" || route.intent === "injury_or_attorney",
);
if (surgeRoute) {
  failures.push("The live flow should not contain the surge routes yet.");
}

expect(
  "The hail went through the skylight and water is coming into the bedroom.",
  "adjuster_queue",
);
expect(
  "I was in the car when the tree came down and my neck is hurting.",
  "adjuster_queue",
);
expect(
  "My sister said I should have a lawyer call you before I say anything.",
  "adjuster_queue",
);
expect("Hi, I wanted a quote on a second car.", "sales_queue");
expect(
  "I need a declaration page for my mortgage company.",
  "billing_queue",
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Live flow check passed. Storm and injury calls still reach an adjuster, and the sales offer is on.",
);
