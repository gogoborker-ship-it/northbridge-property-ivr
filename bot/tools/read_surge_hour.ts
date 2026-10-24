import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { presentHour } from "../../shared/surge/read.js";

export default defineTool({
  description:
    "Read the Tuesday property hour. Use steady for the quiet hour and surge for the hail storm.",
  effect: "read",
  execution: "server",
  inputSchema: z.object({
    phase: z.enum(["steady", "surge"]),
  }),
  execute({ phase }) {
    return presentHour(phase);
  },
});
