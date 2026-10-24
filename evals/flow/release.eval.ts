import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["flow"],
  cases: [
    {
      id: "release",
      description: "After the owner accepts, the flow agent prepares the pull request and does not merge it.",
      async test(t) {
        await t.send(
          "The Claims Business Owner accepted the Tuesday hail operating decision. Prepare the phone flow change and say which pull request the IVR developer reviews. Do not merge it.",
        );
        t.succeeded();
        t.calledTool("propose_flow_change", {
          input: { decisionAccepted: true, developerRejected: false },
          output: { editsLiveFlow: false, sandboxPassed: true },
        });
      },
    },
  ],
});
