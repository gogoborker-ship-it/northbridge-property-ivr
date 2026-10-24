import { readFileSync } from "node:fs";
import { loadFlow, routeUtterance } from "./route-call.mjs";

const scenario = JSON.parse(
  readFileSync(new URL("../scenario/tuesday-hail.json", import.meta.url), "utf8"),
);
const flow = loadFlow();
const failures = [];

if (flow.version !== "2026.10.24.1") {
  failures.push(`Live flow version is ${flow.version}. Expected 2026.10.24.1.`);
}
if (flow.prompts.salesOffer.enabled !== true) {
  failures.push("The live flow should still be offering sales.");
}
const surgeRoute = flow.nodes.main_menu.routes.find(
  (route) => route.intent === "storm_claim" || route.intent === "injury_or_attorney",
);
if (surgeRoute) {
  failures.push("The live flow should not contain the surge routes yet.");
}

for (const sample of scenario.samples) {
  const result = routeUtterance(flow, sample.text);
  if (result.queue !== sample.liveQueue) {
    failures.push(
      `${sample.label} went to ${result.queue ?? "none"}, expected ${sample.liveQueue}.`,
    );
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Live flow check passed. Storm and injury calls still reach an adjuster, and the sales offer is on.",
);
