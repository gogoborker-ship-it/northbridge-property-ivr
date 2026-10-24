import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["escalation"],
  cases: [
    {
      id: "rejection",
      description: "A rejected pull request returns to the owner and leaves the live flow version in place.",
      async test(t) {
        await t.send(
          "The IVR developer rejected the Tuesday hail pull request. Record that rejection and tell me the live flow version.",
        );
        t.succeeded();
        t.calledTool("propose_flow_change", {
          input: { developerRejected: true },
          output: { liveVersion: "2026.10.24.1", editsLiveFlow: false },
        });
      },
    },
  ],
});