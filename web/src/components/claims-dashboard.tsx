"use client";

import { useState } from "react";
import type { AgentDesk, HourView } from "@shared/surge/types";

type FileLink = {
  label: string;
  path: string;
  href: string;
};

type SdkCatalog = {
  model: string;
  skills: FileLink[];
  tools: FileLink[];
};

type Owner = "pending" | "accepted" | "sent-back";

export function ClaimsDashboard({
  hours,
  sources,
  sdk,
}: {
  hours: { steady: HourView; surge: HourView };
  sources: FileLink[];
  sdk: SdkCatalog;
}) {
  const [phase, setPhase] = useState<"steady" | "surge">("steady");
  const [desk, setDesk] = useState<AgentDesk | null>(null);
  const [owner, setOwner] = useState<Owner>("pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hour = phase === "surge" ? hours.surge : hours.steady;
  const maxCalls = Math.max(...hours.surge.themes.map((theme) => theme.calls), 1);

  async function startAgents() {
    setLoading(true);
    setError(null);
    setOwner("pending");
    try {
      const response = await fetch("/api/agents", { method: "POST" });
      const body = (await response.json()) as AgentDesk & { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "The agents could not read the hour.");
      }
      setDesk(body);
    } catch (caught) {
      setDesk(null);
      setError(caught instanceof Error ? caught.message : "The agents could not read the hour.");
    } finally {
      setLoading(false);
    }
  }

  function returnToQuietHour() {
    setPhase("steady");
    setDesk(null);
    setOwner("pending");
    setError(null);
  }

  const flowReview =
    owner === "accepted"
      ? desk?.flow.reviewIfAccepted
      : owner === "sent-back"
        ? desk?.flow.reviewIfSentBack
        : desk?.flow.reviewIfWaiting;

  return (
    <div className="min-h-screen bg-[#f3efe6] text-[#1c1915]">
      <header className="border-b border-[#ddd6c8] px-6 py-5 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#6f675c]">
              Northbridge Mutual · Property claims
            </p>
            <h1 className="mt-1 font-serif text-4xl tracking-tight">Claims owner desk</h1>
          </div>
          <div className="text-sm text-[#6f675c]">
            <p>Tuesday · 2:00pm local</p>
            <a
              href="https://github.com/gogoborker-ship-it/northbridge-property-ivr"
              className="mt-1 block text-[#7f1d1d] underline"
            >
              Open the repository
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8 lg:px-10">
        <section className="rounded-2xl border border-[#ddd6c8] bg-white p-5">
          <h2 className="font-serif text-2xl">Files this desk reads</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6f675c]">
            The hour, the live phone flow, the prepared change, the roster, and the Cursor agent are in one repository.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {sources.map((source) => (
              <li key={source.path}>
                <a href={source.href} className="block rounded-xl bg-[#f3efe6] px-3 py-2 text-sm hover:bg-[#e7e0d4]">
                  <span className="block font-medium">{source.label}</span>
                  <span className="text-[#6f675c]">{source.path}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {hour.codeRed ? (
          <section className="rounded-2xl bg-[#7f1d1d] px-6 py-5 text-[#fff7ed]">
            <p className="text-xs uppercase tracking-[0.16em] text-[#fecaca]">Code red</p>
            <h2 className="mt-1 font-serif text-3xl">{hour.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#fee2e2]">{hour.summary}</p>
          </section>
        ) : (
          <section className="rounded-2xl border border-[#ddd6c8] bg-white px-6 py-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#6f675c]">This hour</p>
            <h2 className="mt-1 font-serif text-3xl">{hour.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6f675c]">{hour.summary}</p>
          </section>
        )}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {hour.metrics.map((metric) => (
            <article key={metric.id} className="rounded-2xl border border-[#ddd6c8] bg-white px-4 py-4">
              <p className="text-xs uppercase tracking-wide text-[#6f675c]">{metric.label}</p>
              <p className={`mt-2 font-serif text-3xl ${hour.codeRed ? "text-[#7f1d1d]" : ""}`}>
                {metric.value}
              </p>
              <p className="mt-2 text-xs leading-5 text-[#6f675c]">{metric.detail}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-[#ddd6c8] bg-white p-5">
            <h3 className="font-serif text-2xl">Why people are calling</h3>
            <p className="mt-1 text-sm text-[#6f675c]">
              Themes come from a scan of this hour’s transcripts, not from the menu the caller pressed.
            </p>
            {hour.themes.length > 0 ? (
              <ul className="mt-5 space-y-4">
                {hour.themes.map((theme) => (
                  <li key={theme.reason}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-medium">{theme.reason}</span>
                      <span className="text-sm text-[#6f675c]">
                        {theme.calls} · {theme.share}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[#f3efe6]">
                      <div
                        className="h-2 rounded-full bg-[#7f1d1d]"
                        style={{ width: `${(theme.calls / maxCalls) * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-[#6f675c]">{theme.sample}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-sm text-[#6f675c]">{hour.themeNote}</p>
            )}
          </div>

          <div className="rounded-2xl border border-[#ddd6c8] bg-white p-5">
            <h3 className="font-serif text-2xl">Transcript scan</h3>
            <ul className="mt-4 space-y-4">
              {hour.transcripts.map((line) => (
                <li key={line.quote} className="border-t border-[#f3efe6] pt-3 first:border-0 first:pt-0">
                  <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-[#6f675c]">
                    <span>{line.time}</span>
                    <span>{line.theme}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6">“{line.quote}”</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          {phase === "steady" ? (
            <button
              type="button"
              onClick={() => setPhase("surge")}
              className="rounded-full bg-[#7f1d1d] px-5 py-2.5 text-sm font-medium text-white"
            >
              Simulate the storm hour
            </button>
          ) : null}
          {phase === "surge" ? (
            <button
              type="button"
              onClick={startAgents}
              disabled={loading}
              className="rounded-full bg-[#1c1915] px-5 py-2.5 text-sm font-medium text-[#f3efe6] disabled:opacity-60"
            >
              {loading ? "Reading the hour…" : "Start the three agents"}
            </button>
          ) : null}
          {phase !== "steady" ? (
            <button
              type="button"
              onClick={returnToQuietHour}
              className="rounded-full border border-[#1c1915] px-5 py-2.5 text-sm"
            >
              Return to the quiet hour
            </button>
          ) : null}
        </section>

        {loading ? (
          <p className="text-sm leading-6 text-[#6f675c]">
            The intake agent is writing the decision, the flow agent is running the sandbox against the prepared phone flow, and the workforce agent is reading the Tuesday roster.
          </p>
        ) : null}

        {error ? (
          <section className="rounded-2xl border border-[#7f1d1d] bg-white px-5 py-4 text-sm leading-6 text-[#7f1d1d]">
            {error}
          </section>
        ) : null}

        {desk ? (
          <section className="space-y-4">
            <div>
              <h3 className="font-serif text-3xl">What the agents recommend</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6f675c]">
                Read at {desk.ranAtLabel}. The Claims Business Owner still leads. A licensed route, overtime, and a quality score wait for the person named on the card.
              </p>
            </div>

            {owner === "sent-back" ? (
              <p className="rounded-2xl bg-[#7f1d1d] px-5 py-4 text-sm leading-6 text-[#fff7ed]">
                {desk.flow.reviewIfSentBack}
              </p>
            ) : null}
            {owner === "accepted" ? (
              <p className="rounded-2xl bg-[#1c1915] px-5 py-4 text-sm leading-6 text-[#f3efe6]">
                {desk.flow.reviewIfAccepted}
              </p>
            ) : null}

            <article className="rounded-2xl border border-[#ddd6c8] bg-white p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-[#7f1d1d]">Intake surge playbook</p>
              <h4 className="mt-2 font-serif text-2xl">Claims Intake Agent</h4>
              <p className="mt-3 text-sm leading-6">{desk.decision.summary}</p>
              <ul className="mt-4 space-y-3">
                {desk.decision.groups.map((group) => (
                  <li key={group.name} className="text-sm leading-6">
                    <span className="font-medium">
                      {group.name} · {group.calls} · {group.share}.
                    </span>{" "}
                    {group.action}
                  </li>
                ))}
              </ul>
              <ul className="mt-4 space-y-2">
                {desk.decision.scores.map((score) => (
                  <li key={score.metric} className="text-sm leading-6 text-[#6f675c]">
                    <span className="font-medium text-[#1c1915]">{score.metric}. </span>
                    {score.expectation}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setOwner("accepted")}
                  className="rounded-full bg-[#1c1915] px-4 py-2 text-sm font-medium text-[#f3efe6]"
                >
                  Accept the decision
                </button>
                <button
                  type="button"
                  onClick={() => setOwner("sent-back")}
                  className="rounded-full border border-[#1c1915] px-4 py-2 text-sm"
                >
                  Send it back
                </button>
              </div>
            </article>

            <article className="rounded-2xl border border-[#1c1915] bg-[#1c1915] p-5 text-[#f3efe6]">
              <p className="text-xs uppercase tracking-[0.14em] text-[#fdba74]">Flow release rules</p>
              <h4 className="mt-2 font-serif text-2xl">Contact Flow Agent</h4>
              <p className="mt-3 text-sm leading-6 text-[#e7e5e4]">{flowReview}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[#fdba74]">
                property-flow.json · {desk.flow.liveVersion} to {desk.flow.proposedVersion}
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-[#0c0a09] p-4 text-xs leading-5 text-[#e7e5e4]">
                {JSON.stringify(desk.flow.routes, null, 2)}
              </pre>
              <p className="mt-3 text-sm text-[#e7e5e4]">
                Sales offer paused until {desk.flow.salesPausedUntil}.
              </p>
              <ul className="mt-4 space-y-3">
                {desk.flow.comparisons.map((row) => (
                  <li key={row.label} className="rounded-xl bg-[#0c0a09] px-3 py-2 text-sm leading-6">
                    <span className="block text-[#fdba74]">{row.label}</span>
                    <span className="text-[#e7e5e4]">
                      Live queue {row.liveQueue}. Proposed queue {row.proposedQueue}.
                    </span>
                  </li>
                ))}
              </ul>
              <pre className="mt-4 overflow-x-auto rounded-xl bg-[#0c0a09] p-4 text-xs leading-5 text-[#d6d3d1]">
                {desk.flow.sandboxOutput}
              </pre>
              <p className="mt-3 text-xs text-[#d6d3d1]">
                Pull request files: {desk.flow.filesInPullRequest.join(", ")}. The live file is not edited by this desk.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={desk.flow.liveFlowUrl}
                  className="inline-block rounded-full border border-[#f3efe6] px-4 py-2 text-sm font-medium text-[#f3efe6]"
                >
                  Open the live flow
                </a>
                <a
                  href={desk.flow.pullRequestUrl}
                  className="inline-block rounded-full bg-[#f3efe6] px-4 py-2 text-sm font-medium text-[#1c1915]"
                >
                  Open pull request #1
                </a>
              </div>
            </article>

            <article className="rounded-2xl border border-[#ddd6c8] bg-white p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-[#7f1d1d]">Capacity band and quality rubric</p>
              <h4 className="mt-2 font-serif text-2xl">Workforce Management Agent</h4>
              <p className="mt-3 text-sm leading-6">{desk.staffing.summary}</p>
              <p className="mt-3 text-sm leading-6 text-[#6f675c]">
                {owner === "accepted" ? desk.staffing.reviewIfAccepted : desk.staffing.reviewIfWaiting}
              </p>
              <ul className="mt-4 space-y-3">
                {desk.staffing.items.map((item) => (
                  <li key={item.text} className="text-sm leading-6">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-[#6f675c]">
                      {owner === "accepted" ? item.afterAccept : item.beforeAccept}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </article>
          </section>
        ) : null}

        <section className="rounded-2xl border border-[#ddd6c8] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[#6f675c]">Cursor SDK</p>
          <h3 className="mt-2 font-serif text-2xl">The agent that calls these tools</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6f675c]">
            Model {sdk.model}. The desk runs the same procedures on the files above. A live model turn uses the agent in bot/agent.ts, the three skills, and the four tools.
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium">Skills</h4>
              <ul className="mt-2 space-y-2">
                {sdk.skills.map((skill) => (
                  <li key={skill.path}>
                    <a href={skill.href} className="text-sm text-[#7f1d1d] underline">
                      {skill.label}
                    </a>
                    <span className="mt-0.5 block text-xs text-[#6f675c]">{skill.path}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium">Tools</h4>
              <ul className="mt-2 space-y-2">
                {sdk.tools.map((tool) => (
                  <li key={tool.path}>
                    <a href={tool.href} className="text-sm text-[#7f1d1d] underline">
                      {tool.label}
                    </a>
                    <span className="mt-0.5 block text-xs text-[#6f675c]">{tool.path}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
