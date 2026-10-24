import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["workforce"],
  cases: [
    {
      id: "capacity",
      description: "After the owner accepts, staffing comes from the roster and the roster file stays unchanged.",
      async test(t) {
        await t.send(
          "The Claims Business Owner accepted the Tuesday hail decision. Say who should be on the phones. Do not change the phone flow and do not authorize overtime yourself.",
        );
        t.succeeded();
        t.calledTool("propose_staffing", {
          input: { decisionAccepted: true },
          output: { editsRoster: false, overtimeAuthorized: false },
        });
        t.notCalledTool("propose_flow_change");
      },
    },
  ],
});
