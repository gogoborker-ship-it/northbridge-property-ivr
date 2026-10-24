import { proposeFlowChange } from "./sandbox";
import { proposeStaffing, writeOperatingDecision } from "./read";
import type { AgentDesk } from "./types";

export function runSurgeDesk(): AgentDesk {
  const ranAtLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date());
  return {
    ranAtLabel,
    decision: writeOperatingDecision(),
    flow: proposeFlowChange({ decisionAccepted: false, developerRejected: false }),
    staffing: proposeStaffing(false),
  };
}
