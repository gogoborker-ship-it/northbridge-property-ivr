import { readFileSync } from "node:fs";
import { loadFlow, routeUtterance } from "./route-call.mjs";

const scenario = JSON.parse(
  readFileSync(new URL("../scenario/tuesday-hail.json", import.meta.url), "utf8"),
);
const flow = loadFlow();
const routes = flow.nodes.main_menu.routes;
const injury = routes.find((route) => route.intent === "injury_or_attorney");
const storm = routes.find((route) => route.intent === "storm_claim");
const failures = [];

if (flow.prompts.salesOffer.enabled !== false) {
  failures.push("Sales prompt is still on during the surge.");
}
if (!injury || injury.queue !== "licensed_queue") {
  failures.push("Injury and attorney language does not reach the licensed queue.");
}
if (!storm || storm.queue !== "self_service_fnol") {
  failures.push("Simple storm claims do not have a self-service path.");
}
if (injury && storm && routes.indexOf(injury) > routes.indexOf(storm)) {
  failures.push("A storm match would catch an injury call before the licensed route.");
}

for (const sample of scenario.samples) {
  const result = routeUtterance(flow, sample.text);
  if (result.queue !== sample.proposedQueue) {
    failures.push(
      `${sample.label} went to ${result.queue ?? "none"}, expected ${sample.proposedQueue}.`,
    );
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Sandbox passed. Sales is paused, storm claims can self-serve, and injury language reaches a licensed person.",
);
