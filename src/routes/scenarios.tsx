import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FutureTree } from "@/components/FutureTree";
import { ScenarioCard } from "@/components/ScenarioCard";
import { SensitivityExplorer } from "@/components/SensitivityExplorer";
import { StrategyPlan } from "@/components/StrategyPlan";
import { InsightsPanel } from "@/components/InsightsPanel";
import { useSimulationStore } from "@/store/simulation";
import { formatDate } from "@/utils/formatting";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/scenarios")({
  head: () => ({
    meta: [
      { title: "Your modelled scenarios — FutureLens" },
      {
        name: "description",
        content:
          "Explore your three modelled future scenarios: future tree, side-by-side comparison, uncertainty, sensitivity and a practical strategy plan.",
      },
      { property: "og:title", content: "Your modelled scenarios — FutureLens" },
      {
        property: "og:description",
        content:
          "Future tree, comparison, insights, sensitivity and next moves — all generated from your own inputs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScenariosPage,
});

const TABS = ["Overview", "Comparison", "Insights", "Sensitivity", "Next moves"] as const;
type Tab = (typeof TABS)[number];

function ScenariosPage() {
  const { active, hydrated } = useSimulationStore();
  const [tab, setTab] = useState<Tab>("Overview");
  const [selectedId, setSelectedId] = useState<string>("");
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (active && !active.scenarios.some((s) => s.id === selectedId)) {
      setSelectedId(active.scenarios[0].id);
      setStageIndex(active.scenarios[0].trajectory.length - 1);
    }
  }, [active, selectedId]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6" role="status" aria-live="polite">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-secondary" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-secondary" />
        <p className="sr-only">Loading your simulation…</p>
      </div>
    );
  }

  if (!active) return <EmptyState />;

  const scenario = active.scenarios.find((s) => s.id === selectedId) ?? active.scenarios[0];
  const stage = scenario.trajectory[Math.min(stageIndex, scenario.trajectory.length - 1)];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Modelled scenarios
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            {active.decision.label}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Horizon {active.decision.horizon} · generated {formatDate(active.createdAt)} ·{" "}
            <span className="rounded-full border border-border px-2 py-0.5 text-xs">Demo mode</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/dashboard">Saved simulations</Link>
          </Button>
          <Button asChild variant="hero">
            <Link to="/simulator">Run a new simulation</Link>
          </Button>
        </div>
      </header>

      <p className="mt-6 rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
        These values are model outputs based on your inputs and stated assumptions — not predictions
        of guaranteed outcomes. No scenario is ranked as best; they describe different trade-offs.
      </p>

      <div
        role="tablist"
        aria-label="Scenario views"
        className="mt-8 flex gap-1 overflow-x-auto border-b border-border pb-px"
      >
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            onClick={() => setTab(t)}
            className={cn(
              "min-h-11 shrink-0 rounded-t-lg px-4 text-sm transition-colors",
              tab === t
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="pt-8">
        {tab === "Overview" && (
          <div className="space-y-8">
            <section className="glass rounded-2xl border border-border p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">Future tree</h2>
                <p className="text-sm text-muted-foreground">
                  Selected: {scenario.label} · {stage.label} — modelled readiness{" "}
                  <span className="font-mono">{stage.readiness}</span> (range {stage.low}–
                  {stage.high})
                </p>
              </div>
              <div className="mt-4">
                <FutureTree
                  scenarios={active.scenarios}
                  selectedId={scenario.id}
                  onSelect={setSelectedId}
                  stageIndex={stageIndex}
                  onStageChange={setStageIndex}
                  decisionLabel={active.decision.label}
                />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">Scenario cards</h2>
              <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {active.scenarios.map((s) => (
                  <ScenarioCard
                    key={s.id}
                    scenario={s}
                    selected={s.id === scenario.id}
                    onSelect={() => setSelectedId(s.id)}
                  />
                ))}
              </div>
            </section>

            <section className="glass rounded-2xl border border-border p-5">
              <h2 className="text-lg font-semibold text-foreground">Weekly allocation</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Modelled split for {scenario.label}.
              </p>
              <ul className="mt-4 space-y-3">
                {scenario.weeklyAllocation.map((a) => (
                  <li key={a.area}>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{a.area}</span>
                      <span className="font-mono text-foreground">{a.hours} h/week</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.min(100, (a.hours / Math.max(1, active.profile.currentState.hoursPerWeek)) * 100)}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {tab === "Comparison" && (
          <section>
            <h2 className="text-lg font-semibold text-foreground">Side-by-side comparison</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <caption className="sr-only">
                  Modelled metrics compared across the three scenarios
                </caption>
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th scope="col" className="py-3 font-medium">
                      Dimension
                    </th>
                    {active.scenarios.map((s) => (
                      <th key={s.id} scope="col" className="py-3 text-right font-medium">
                        {s.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {active.comparison.map((row) => (
                    <tr key={row.dimension} className="border-t border-border/60">
                      <th scope="row" className="py-3 text-left font-normal text-muted-foreground">
                        {row.dimension}
                      </th>
                      {row.values.map((v) => (
                        <td
                          key={v.scenarioId}
                          className="py-3 text-right font-mono text-foreground"
                        >
                          {v.display}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="mt-8 text-base font-semibold text-foreground">
              How the paths differ
            </h3>
            <ul className="mt-2 space-y-2">
              {active.differences.map((d) => (
                <li key={d} className="text-sm text-muted-foreground">
                  {d}
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === "Insights" && <InsightsPanel simulation={active} />}

        {tab === "Sensitivity" && (
          <SensitivityExplorer simulation={active} scenarioId={scenario.id} />
        )}

        {tab === "Next moves" && <StrategyPlan simulation={active} scenario={scenario} />}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border">
        <Compass className="h-6 w-6 text-primary" aria-hidden />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-foreground">No simulation yet</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Describe your decision in the simulator and FutureLens will model three possible paths —
        with trade-offs, uncertainty and next moves.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild variant="hero">
          <Link to="/simulator">
            <Sparkles className="mr-2 h-4 w-4" aria-hidden />
            Explore your future
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/how-it-works">See how it works</Link>
        </Button>
      </div>
    </div>
  );
}
