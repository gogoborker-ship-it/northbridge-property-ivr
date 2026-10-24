import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { writeOperatingDecision } from "../../shared/surge/read.js";

export default defineTool({
  description:
    "Write the Tuesday hail operating decision for the Claims Business Owner. Does not edit the phone flow or the roster.",
  effect: "read",
  execution: "server",
  inputSchema: z.object({
    hour: z.literal("tuesday-2pm"),
  }),
  execute() {
    return writeOperatingDecision();
  },
});
