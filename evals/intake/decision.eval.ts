import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["intake"],
  cases: [
    {
      id: "decision",
      description: "The intake agent writes the Tuesday decision and leaves the flow and roster alone.",
      async test(t) {
        await t.send(
          "The Tuesday 2pm property hour is hot. Write the operating decision for the Claims Business Owner. Do not change the phone flow or the roster.",
        );
        t.succeeded();
        t.calledTool("write_operating_decision", {
          input: { hour: "tuesday-2pm" },
          output: { editsFlow: false, editsRoster: false, surge: true },
        });
        t.notCalledTool("propose_flow_change");
        t.notCalledTool("propose_staffing");
      },
    },
  ],
});
