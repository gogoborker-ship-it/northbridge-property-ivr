import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const LEXICON = {
  new_claim: [
    "hail",
    "roof",
    "wind",
    "water",
    "storm",
    "damage",
    "skylight",
    "injury",
    "hurt",
    "neck",
    "lawyer",
    "attorney",
    "tree",
  ],
  existing_claim: ["claim status", "already filed", "my adjuster"],
  billing: ["premium", "declaration", "renewal", "mortgage", "billing"],
  sales: ["quote", "second car", "new policy"],
  upsell: ["flood coverage", "additional coverage", "raise coverage", "add flood"],
};

export function loadFlow(url = new URL("./property-flow.json", import.meta.url)) {
  return JSON.parse(readFileSync(url, "utf8"));
}

export function routeUtterance(flow, text) {
  const normalized = text.toLowerCase();
  const routes = flow.nodes?.main_menu?.routes ?? [];
  for (const route of routes) {
    const words = route.match ?? LEXICON[route.intent] ?? [];
    if (words.some((word) => normalized.includes(word))) {
      return {
        intent: route.intent,
        queue: route.queue,
        salesOffer: flow.prompts?.salesOffer?.enabled === true,
      };
    }
  }
  return {
    intent: "unmatched",
    queue: null,
    salesOffer: flow.prompts?.salesOffer?.enabled === true,
  };
}

function isCli() {
  if (!process.argv[1]) return false;
  return import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (isCli()) {
  const text = process.argv.slice(2).join(" ").trim();
  if (!text) {
    console.error('Usage: node ivr/route-call.mjs "caller words"');
    process.exit(1);
  }
  const flow = loadFlow();
  const result = routeUtterance(flow, text);
  console.log(`version: ${flow.version}`);
  console.log(`intent: ${result.intent}`);
  console.log(`queue: ${result.queue ?? "none"}`);
  console.log(`salesOffer: ${result.salesOffer ? "on" : "off"}`);
}
