import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { proposeStaffing } from "../../shared/surge/read.js";

export default defineTool({
  description:
    "Recommend Tuesday hail seats from the roster. Does not authorize overtime, score agents, or edit the roster.",
  effect: "read",
  execution: "server",
  inputSchema: z.object({
    decisionAccepted: z.boolean(),
  }),
  execute({ decisionAccepted }) {
    return proposeStaffing(decisionAccepted);
  },
});
