export const REPO_URL = "https://github.com/gogoborker-ship-it/northbridge-property-ivr";
export const PULL_REQUEST_URL = `${REPO_URL}/pull/1`;
export const LIVE_FLOW_URL = `${REPO_URL}/blob/main/ivr/property-flow.json`;

export type RepoFile = {
  label: string;
  path: string;
  href: string;
};

function file(path: string, label: string): RepoFile {
  return {
    label,
    path,
    href: `${REPO_URL}/blob/main/${path}`,
  };
}

export function sourceFiles(): RepoFile[] {
  return [
    file("scenario/tuesday-hail.json", "Tuesday hail scenario"),
    file("ivr/property-flow.json", "Live phone flow"),
    file("ivr/proposals/tuesday-hail.json", "Prepared flow change"),
    file("roster/tuesday-2pm.json", "Tuesday roster"),
    file("bot/agent.ts", "Cursor SDK agent"),
  ];
}

export function sdkFiles(): { model: string; skills: RepoFile[]; tools: RepoFile[] } {
  return {
    model: "grok-4.5",
    skills: [
      file("bot/skills/intake-surge-playbook.md", "Intake surge playbook"),
      file("bot/skills/flow-release-rules.md", "Flow release rules"),
      file("bot/skills/capacity-and-quality.md", "Capacity band and quality rubric"),
    ],
    tools: [
      file("bot/tools/read_surge_hour.ts", "read_surge_hour"),
      file("bot/tools/write_operating_decision.ts", "write_operating_decision"),
      file("bot/tools/propose_flow_change.ts", "propose_flow_change"),
      file("bot/tools/propose_staffing.ts", "propose_staffing"),
    ],
  };
}
