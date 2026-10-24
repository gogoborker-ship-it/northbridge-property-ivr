export type Phase = "steady" | "surge";

export type MetricView = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export type ThemeView = {
  reason: string;
  calls: number;
  share: string;
  sample: string;
};

export type TranscriptView = {
  time: string;
  quote: string;
  theme: string;
};

export type HourView = {
  phase: Phase;
  title: string;
  summary: string;
  codeRed: boolean;
  metrics: MetricView[];
  themes: ThemeView[];
  themeNote: string;
  transcripts: TranscriptView[];
};

export type DecisionGroup = {
  name: string;
  calls: number;
  share: string;
  action: string;
};

export type ScoreGuidance = {
  metric: string;
  expectation: string;
};

export type OperatingDecision = {
  hour: "tuesday-2pm";
  surge: true;
  editsFlow: false;
  editsRoster: false;
  leader: "Claims Business Owner";
  summary: string;
  groups: DecisionGroup[];
  scores: ScoreGuidance[];
};

export type RouteComparison = {
  label: string;
  text: string;
  liveQueue: string;
  proposedQueue: string;
  matches: boolean;
};

export type FlowRoute = {
  intent: string;
  queue: string;
  match?: string[];
};

export type FlowProposal = {
  liveVersion: string;
  proposedVersion: string;
  editsLiveFlow: false;
  sandboxPassed: boolean;
  sandboxOutput: string;
  salesPausedUntil: string;
  routes: FlowRoute[];
  comparisons: RouteComparison[];
  pullRequestUrl: string;
  liveFlowUrl: string;
  filesInPullRequest: string[];
  decisionAccepted: boolean;
  developerRejected: boolean;
  review: string;
  reviewIfWaiting: string;
  reviewIfAccepted: string;
  reviewIfRejected: string;
  reviewIfSentBack: string;
};

export type StaffingItem = {
  text: string;
  beforeAccept: string;
  afterAccept: string;
};

export type StaffingProposal = {
  editsRoster: false;
  overtimeAuthorized: false;
  summary: string;
  items: StaffingItem[];
  decisionAccepted: boolean;
  review: string;
  reviewIfWaiting: string;
  reviewIfAccepted: string;
};

export type AgentDesk = {
  ranAtLabel: string;
  decision: OperatingDecision;
  flow: FlowProposal;
  staffing: StaffingProposal;
};
