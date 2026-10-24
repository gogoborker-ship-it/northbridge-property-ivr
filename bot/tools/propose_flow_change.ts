import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { proposeFlowChange } from "../../shared/surge/sandbox.js";

export default defineTool({
  description:
    "Run the Tuesday hail flow sandbox and return the pull request. Does not merge and does not edit the live flow.",
  effect: "read",
  execution: "server",
  inputSchema: z.object({
    decisionAccepted: z.boolean(),
    developerRejected: z.boolean().optional().default(false),
  }),
  execute({ decisionAccepted, developerRejected }) {
    return proposeFlowChange({
      decisionAccepted,
      developerRejected: developerRejected === true,
    });
  },
});
