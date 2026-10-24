import { spawnSync } from "node:child_process";
import path from "node:path";
import { PULL_REQUEST_URL, LIVE_FLOW_URL } from "./links";
import { loadFlowFile, loadScenario, repoRoot } from "./read";
import type { FlowProposal, RouteComparison } from "./types";

const LIVE_FLOW = "ivr/property-flow.json";
const PROPOSAL = "ivr/proposals/tuesday-hail.json";

type RoutedCall = {
  version: string;
  intent: string;
  queue: string;
  salesOffer: string;
};

function routeFile(relativeFlow: string, text: string): RoutedCall {
  const root = repoRoot();
  const result = spawnSync(
    process.execPath,
    [path.join(root, "ivr", "route-call.mjs"), "--flow", path.join(root, relativeFlow), text],
    { cwd: root, encoding: "utf8", timeout: 10000 },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || `The phone-flow router failed for ${relativeFlow}.`);
  }
  const fields = Object.fromEntries(
    result.stdout
      .trim()
      .split("\n")
      .map((line) => {
        const index = line.indexOf(": ");
        return [line.slice(0, index), line.slice(index + 2)];
      }),
  );
  return {
    version: fields.version ?? "",
    intent: fields.intent ?? "",
    queue: fields.queue ?? "",
    salesOffer: fields.salesOffer ?? "",
  };
}

export function proposeFlowChange(input: {
  decisionAccepted: boolean;
  developerRejected: boolean;
}): FlowProposal {
  const scenario = loadScenario();
  const live = loadFlowFile(LIVE_FLOW);
  const proposed = loadFlowFile(PROPOSAL);
  const comparisons: RouteComparison[] = scenario.samples.map((sample) => {
    const before = routeFile(LIVE_FLOW, sample.text);
    const after = routeFile(PROPOSAL, sample.text);
    const matches = before.queue === sample.liveQueue && after.queue === sample.proposedQueue;
    return {
      label: sample.label,
      text: sample.text,
      liveQueue: before.queue,
      proposedQueue: after.queue,
      matches,
    };
  });
  const root = repoRoot();
  const check = spawnSync(process.execPath, [path.join(root, "ivr", "check-proposal.mjs")], {
    cwd: root,
    encoding: "utf8",
    timeout: 10000,
  });
  const sandboxOutput = (check.status === 0 ? check.stdout : check.stderr).trim();
  const sandboxPassed = check.status === 0 && comparisons.every((row) => row.matches);
  const pausedUntil = proposed.prompts.salesOffer.pausedUntil ?? "";
  const reviewIfWaiting = `The pull request is prepared and the sandbox has ${sandboxPassed ? "passed" : "failed"}. It waits until the Claims Business Owner accepts the operating decision. The live flow stays on version ${live.version}.`;
  const reviewIfAccepted = `The Claims Business Owner accepted the decision. The pull request is ready for the IVR developer. Injury language is matched first and sent to the licensed queue. Simple storm claims can finish in self-service. The sales offer is paused until 6pm. Both edits are in this pull request because they live in the same flow file. The live flow stays on version ${live.version} until that pull request is merged.`;
  const reviewIfRejected = `The IVR developer rejected the pull request. The live flow stays on version ${live.version}. The decision returns to the Claims Business Owner.`;
  const reviewIfSentBack = `The Claims Business Owner sent the decision back. The live flow stays on version ${live.version}. No seats move. The pull request stays open and is not approved.`;
  const review = input.developerRejected
    ? reviewIfRejected
    : input.decisionAccepted
      ? reviewIfAccepted
      : reviewIfWaiting;
  return {
    liveVersion: live.version,
    proposedVersion: proposed.version,
    editsLiveFlow: false,
    sandboxPassed,
    sandboxOutput,
    salesPausedUntil: pausedUntil,
    routes: proposed.nodes.main_menu.routes.filter(
      (route) => route.intent === "injury_or_attorney" || route.intent === "storm_claim",
    ),
    comparisons,
    pullRequestUrl: PULL_REQUEST_URL,
    liveFlowUrl: LIVE_FLOW_URL,
    filesInPullRequest: ["ivr/property-flow.json", "ivr/check-flow.mjs"],
    decisionAccepted: input.decisionAccepted,
    developerRejected: input.developerRejected,
    review,
    reviewIfWaiting,
    reviewIfAccepted,
    reviewIfRejected,
    reviewIfSentBack,
  };
}
