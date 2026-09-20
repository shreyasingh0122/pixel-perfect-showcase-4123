import { useState } from "react";
import { Sparkles, RefreshCw, CircleAlert as AlertCircle } from "lucide-react";
import type { Simulation } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AiInsight {
  summary: string;
  scenarioAnalysis: {
    id: string;
    explanation: string;
    strengths: string[];
    risks: string[];
    tradeoffs: string[];
  }[];
  keyTradeoffs: string[];
  risks: string[];
  opportunities: string[];
  assumptions: string[];
  sensitivityFactors: string[];
  nextActions: string[];
}

interface Props {
  simulation: Simulation;
}

/**
 * Insights panel — shows the deterministic model's built-in insights, and
 * optionally fetches an AI-assisted plain-language explanation from the edge
 * function. AI failure never destroys the simulation; the deterministic
 * insights remain visible and a retry button is shown.
 */
export function InsightsPanel({ simulation }: Props) {
  const [aiInsight, setAiInsight] = useState<AiInsight | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const insights = simulation.insights;

  async function fetchAi() {
    setAiLoading(true);
    setAiError(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ simulation }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      if (!data || typeof data.summary !== "string") {
        throw new Error("Unexpected response shape");
      }
      setAiInsight(data as AiInsight);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "AI explanation unavailable.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="glass rounded-2xl border border-border p-5">
        <h2 className="text-lg font-semibold text-foreground">Model summary</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{insights.summary}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <InsightGroup title="Why the paths differ" items={insights.whyTheyDiffer} />
        <InsightGroup title="Key trade-offs" items={insights.keyTradeoffs} />
        <InsightGroup title="Risks" items={insights.risks} />
        <InsightGroup title="Opportunities" items={insights.opportunities} />
        <InsightGroup title="Assumptions" items={insights.assumptions} />
        <InsightGroup title="What could change this" items={insights.whatCouldChange} />
      </div>

      {/* AI-assisted explanation */}
      <div className="glass-strong rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet" aria-hidden />
            <h2 className="text-lg font-semibold text-foreground">AI-assisted explanation</h2>
          </div>
          {!aiInsight && !aiLoading && (
            <Button variant="outline" size="sm" onClick={fetchAi}>
              <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />
              Explain with AI
            </Button>
          )}
        </div>

        {aiLoading && (
          <div className="mt-4 space-y-2" role="status" aria-live="polite">
            <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-secondary" />
            <p className="sr-only">AI is analysing your scenarios…</p>
          </div>
        )}

        {aiError && !aiLoading && (
          <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
              <div className="flex-1">
                <p className="text-sm text-foreground">AI explanation temporarily unavailable.</p>
                <p className="mt-1 text-xs text-muted-foreground">{aiError}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={fetchAi}>
                  <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {aiInsight && !aiLoading && !aiError && (
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">{aiInsight.summary}</p>

            {aiInsight.scenarioAnalysis?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Per-scenario analysis
                </h3>
                {aiInsight.scenarioAnalysis.map((sa) => {
                  const scenario = simulation.scenarios.find((s) => s.id === sa.id);
                  return (
                    <div key={sa.id} className="rounded-lg border border-border p-4">
                      <p className="text-sm font-semibold text-foreground">
                        {scenario?.label ?? sa.id}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {sa.explanation}
                      </p>
                      {sa.strengths?.length > 0 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Strengths:</span>{" "}
                          {sa.strengths.join(", ")}
                        </p>
                      )}
                      {sa.risks?.length > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Risks:</span>{" "}
                          {sa.risks.join(", ")}
                        </p>
                      )}
                      {sa.tradeoffs?.length > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Trade-offs:</span>{" "}
                          {sa.tradeoffs.join(", ")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {aiInsight.keyTradeoffs?.length > 0 && (
                <MiniList title="Key trade-offs" items={aiInsight.keyTradeoffs} />
              )}
              {aiInsight.risks?.length > 0 && <MiniList title="Risks" items={aiInsight.risks} />}
              {aiInsight.opportunities?.length > 0 && (
                <MiniList title="Opportunities" items={aiInsight.opportunities} />
              )}
              {aiInsight.sensitivityFactors?.length > 0 && (
                <MiniList title="Sensitivity factors" items={aiInsight.sensitivityFactors} />
              )}
              {aiInsight.assumptions?.length > 0 && (
                <MiniList title="Assumptions" items={aiInsight.assumptions} />
              )}
              {aiInsight.nextActions?.length > 0 && (
                <MiniList title="Suggested next actions" items={aiInsight.nextActions} />
              )}
            </div>
          </div>
        )}

        {!aiInsight && !aiLoading && !aiError && (
          <p className="mt-3 text-sm text-muted-foreground">
            Get a plain-language explanation of why your scenarios differ, what's driving the
            trade-offs, and what could change the picture. The AI explains — it never overrides the
            model.
          </p>
        )}
      </div>
    </section>
  );
}

function InsightGroup({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="glass rounded-2xl border border-border p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.slice(0, 40)} className="flex gap-2 text-sm text-muted-foreground">
            <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <ul className="mt-1.5 space-y-1">
        {items.map((item, i) => (
          <li key={i} className={cn("text-sm text-muted-foreground")}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
