import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { HourView, OperatingDecision, Phase, StaffingProposal } from "./types";

type Scenario = {
  id: "tuesday-2pm";
  when: string;
  steady: { title: string; summary: string };
  surge: { title: string; summary: string };
  metrics: {
    id: string;
    label: string;
    steady: string;
    surge: string;
    steadyNumber?: number;
    surgeNumber?: number;
    detail: string;
  }[];
  themes: { id: string; reason: string; calls: number; share: string; sample: string }[];
  steadyThemesNote: string;
  transcripts: {
    steady: { time: string; quote: string; theme: string }[];
    surge: { time: string; quote: string; theme: string }[];
  };
  samples: {
    id: string;
    label: string;
    text: string;
    liveQueue: string;
    proposedQueue: string;
  }[];
  scoreGuidance: { metric: string; expectation: string }[];
  staffing: {
    liveClaimSeats: number;
    rejectedSeatCount: number;
    onCallWindow: string;
    overtimeWindow: string;
    moveWindow: string;
    abandonmentTarget: number;
    qualityCalls: string[];
  };
};

type Roster = {
  window: string;
  claimsAdjusters: number;
  salesAgents: number;
  salesAgentsTrainedForClaims: number;
  onCallClaims: number;
  overtimeAuthorized: boolean;
};

type FlowFile = {
  version: string;
  prompts: { salesOffer: { enabled: boolean; pausedUntil?: string; text: string } };
  nodes: {
    main_menu: {
      routes: { intent: string; queue: string; match?: string[] }[];
    };
  };
};

export function repoRoot(): string {
  const candidates = [process.cwd(), path.join(process.cwd(), "..")];
  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, "scenario", "tuesday-hail.json"))) {
      return candidate;
    }
  }
  throw new Error("Cannot find scenario/tuesday-hail.json from the working directory.");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(path.join(repoRoot(), relativePath), "utf8")) as T;
}

export function loadScenario(): Scenario {
  return readJson<Scenario>("scenario/tuesday-hail.json");
}

export function loadRoster(): Roster {
  return readJson<Roster>("roster/tuesday-2pm.json");
}

export function loadFlowFile(relativePath: string): FlowFile {
  return readJson<FlowFile>(relativePath);
}

export function presentHour(phase: Phase): HourView {
  const scenario = loadScenario();
  const face = scenario[phase];
  return {
    phase,
    title: face.title,
    summary: face.summary,
    codeRed: phase === "surge",
    metrics: scenario.metrics.map((metric) => ({
      id: metric.id,
      label: metric.label,
      value: metric[phase],
      detail:
        phase === "surge"
          ? `${metric.detail} Was ${metric.steady}.`
          : `Steady at ${metric.steady}.`,
    })),
    themes: phase === "surge" ? scenario.themes : [],
    themeNote: scenario.steadyThemesNote,
    transcripts: scenario.transcripts[phase],
  };
}

export function presentHours(): { steady: HourView; surge: HourView } {
  return { steady: presentHour("steady"), surge: presentHour("surge") };
}

const GROUP_ACTIONS: Record<string, string> = {
  storm:
    "Send these callers to self-service intake. The loss is hail, roof, wind, or water, and nobody has mentioned an injury.",
  sales:
    "Leave the sales queue in place. Pause the sales prompt until you end the surge.",
  upsell:
    "Pause the upsell prompt. Do not offer extra coverage while a loss is being reported.",
  injury:
    "A licensed person takes any caller who mentions an injury, a lawyer, or fraud. A correct handoff is the result. Do not set a first-call-resolution target on these calls.",
};

export function writeOperatingDecision(): OperatingDecision {
  const scenario = loadScenario();
  const offered = scenario.metrics.find((metric) => metric.id === "offered");
  const abandonment = scenario.metrics.find((metric) => metric.id === "abandonment");
  const storm = scenario.themes.find((theme) => theme.id === "storm");
  const injury = scenario.themes.find((theme) => theme.id === "injury");
  if (!offered || !abandonment || !storm || !injury) {
    throw new Error("The Tuesday scenario is missing offered, abandonment, storm, or injury figures.");
  }
  return {
    hour: "tuesday-2pm",
    surge: true,
    editsFlow: false,
    editsRoster: false,
    leader: "Claims Business Owner",
    summary: `Treat ${scenario.when} as a property surge. Storm claims are ${storm.calls} of the ${offered.surgeNumber} offered calls, ${storm.share} of the hour, against a normal hour of ${offered.steadyNumber}. Abandonment is ${abandonment.surge}. ${injury.calls} callers have mentioned an injury or a lawyer, and the sales offer is still playing.`,
    groups: scenario.themes.map((theme) => ({
      name: theme.reason,
      calls: theme.calls,
      share: theme.share,
      action: GROUP_ACTIONS[theme.id] ?? theme.sample,
    })),
    scores: scenario.scoreGuidance,
  };
}

export function proposeStaffing(decisionAccepted: boolean): StaffingProposal {
  const scenario = loadScenario();
  const roster = loadRoster();
  const plan = scenario.staffing;
  if (plan.liveClaimSeats > roster.claimsAdjusters + roster.salesAgentsTrainedForClaims) {
    throw new Error("The seat band asks for more claim-trained people than the roster has.");
  }
  if (roster.salesAgentsTrainedForClaims < 6) {
    throw new Error("The roster does not have 6 claim-trained sales agents to move.");
  }
  const summary = `The ${roster.window} roster has ${roster.claimsAdjusters} claims adjusters and ${roster.salesAgents} sales agents. ${roster.salesAgentsTrainedForClaims} of those sales agents are trained for claims. ${roster.onCallClaims} people are on call. Overtime is ${roster.overtimeAuthorized ? "authorized" : "not authorized"}.`;
  const items = [
    {
      text: "Leave blended handle time alone. It rose because the short calls left and the calls that remain are storm intakes.",
      beforeAccept: "No seat change",
      afterAccept: "No seat change",
    },
    {
      text: `Move the ${roster.salesAgentsTrainedForClaims} claim-trained sales agents onto claims from ${plan.moveWindow}. The move adds no overtime.`,
      beforeAccept: "Waiting on the Claims Business Owner",
      afterAccept: "Ships after the check",
    },
    {
      text: `Staff ${plan.liveClaimSeats} live claim seats, not ${plan.rejectedSeatCount}, once simple storm claims are contained.`,
      beforeAccept: "Waiting on the Claims Business Owner",
      afterAccept: "Ships after the check",
    },
    {
      text: `Use the ${roster.onCallClaims} people on the on-call list from ${plan.onCallWindow} while abandonment stays above ${plan.abandonmentTarget} percent and those names remain.`,
      beforeAccept: "Waiting on the Claims Business Owner",
      afterAccept: "Ships while names remain",
    },
    {
      text: `Open a 2-hour overtime block ${plan.overtimeWindow}. The roster does not authorize overtime.`,
      beforeAccept: "Workforce manager",
      afterAccept: "Workforce manager",
    },
    {
      text: `Send ${plan.qualityCalls.join(" and ")} to the quality supervisor. The caller named an injury or a lawyer, and the intake continued as a simple claim. Do not score the agent here.`,
      beforeAccept: "Quality supervisor",
      afterAccept: "Quality supervisor",
    },
  ];
  const reviewIfWaiting =
    "No seats move until the Claims Business Owner accepts the operating decision.";
  const reviewIfAccepted =
    "The owner has accepted the decision. The six claim-trained agents can move, the live band is 8 seats, and the on-call list can be used while the names remain. Overtime still waits for the workforce manager. The two calls still wait for the quality supervisor.";
  return {
    editsRoster: false,
    overtimeAuthorized: false,
    summary,
    items,
    decisionAccepted,
    review: decisionAccepted ? reviewIfAccepted : reviewIfWaiting,
    reviewIfWaiting,
    reviewIfAccepted,
  };
}
