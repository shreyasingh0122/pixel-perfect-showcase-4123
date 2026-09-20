import { useState } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";
import type { Simulation, Scenario } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSimulationStore } from "@/store/simulation";
import { cn } from "@/lib/utils";

interface Props {
  simulation: Simulation;
  scenario: Scenario;
}

interface StrategyAction {
  key: string;
  horizon: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  effort: string;
  fromModel: boolean;
}

const HORIZONS = ["Next 7 Days", "Next 30 Days", "Next 90 Days"] as const;
const PRIORITIES = ["High", "Medium", "Low"] as const;
const EFFORTS = ["< 1h", "1–2h", "Half day", "1+ day"] as const;

function actionKey(simId: string, horizon: string, idx: number): string {
  return `${simId}:${horizon}:${idx}`;
}

function horizonMatches(modelHorizon: string, uiHorizon: string): boolean {
  if (uiHorizon === "Next 7 Days") return modelHorizon === "This Week";
  if (uiHorizon === "Next 30 Days") return modelHorizon === "Next 30 Days";
  if (uiHorizon === "Next 90 Days") return modelHorizon === "Next 90 Days";
  return false;
}

/**
 * Strategy plan — renders the deterministic next-actions from the simulation,
 * lets the user check them off, add custom actions, and delete custom actions.
 * Completion state persists via the simulation store (localStorage).
 */
export function StrategyPlan({ simulation, scenario }: Props) {
  const { completedActions, toggleAction } = useSimulationStore();
  const [draft, setDraft] = useState<Partial<StrategyAction>>({});
  const [adding, setAdding] = useState<string | null>(null);
  const [customByHorizon, setCustomByHorizon] = useState<
    Record<string, StrategyAction[]>
  >({});

  const isDone = (key: string) => completedActions.includes(key);

  const groups = HORIZONS.map((horizon) => {
    const scenarioActions: StrategyAction[] = scenario.nextActions
      .filter((a) => horizonMatches(a.horizon, horizon))
      .flatMap((a, ai) =>
        a.items.map((title, ii) => {
          const key = actionKey(simulation.id, horizon, ai * 100 + ii);
          return {
            key,
            horizon,
            title,
            description: "",
            priority: "Medium" as const,
            effort: "1–2h",
            fromModel: true,
          };
        }),
      );

    const customActions = (customByHorizon[horizon] ?? []).map((a) => ({ ...a }));

    return { horizon, actions: [...scenarioActions, ...customActions] };
  });

  function addCustom(horizon: string) {
    if (!draft.title) return;
    const key = `custom:${simulation.id}:${horizon}:${Date.now().toString(36)}`;
    const action: StrategyAction = {
      key,
      horizon,
      title: draft.title,
      description: draft.description ?? "",
      priority: (draft.priority as StrategyAction["priority"]) ?? "Medium",
      effort: draft.effort ?? "1–2h",
      fromModel: false,
    };
    setCustomByHorizon((m) => ({ ...m, [horizon]: [...(m[horizon] ?? []), action] }));
    setDraft({});
    setAdding(null);
  }

  function deleteCustom(horizon: string, key: string) {
    setCustomByHorizon((m) => ({
      ...m,
      [horizon]: (m[horizon] ?? []).filter((a) => a.key !== key),
    }));
  }

  const totalActions = groups.reduce((sum, g) => sum + g.actions.length, 0);
  const doneActions = groups.reduce(
    (sum, g) => sum + g.actions.filter((a) => isDone(a.key)).length,
    0,
  );
  const progress = totalActions ? Math.round((doneActions / totalActions) * 100) : 0;

  return (
    <section className="space-y-6">
      <div className="glass rounded-2xl border border-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Personal strategy plan</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Actions for {scenario.label}. Check them off as you go — your progress is saved in
              this browser.
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-bold text-foreground">{progress}%</p>
            <p className="text-xs text-muted-foreground">
              {doneActions} of {totalActions} done
            </p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.horizon} className="glass rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">{group.horizon}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAdding(group.horizon);
                setDraft({});
              }}
            >
              <Plus className="mr-1 h-4 w-4" aria-hidden />
              Add action
            </Button>
          </div>

          {adding === group.horizon && (
            <div className="mt-4 rounded-lg border border-border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Title</label>
                  <Input
                    className="mt-1"
                    value={draft.title ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                    placeholder="What will you do?"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Description (optional)
                  </label>
                  <Textarea
                    className="mt-1"
                    rows={2}
                    value={draft.description ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Priority</label>
                  <div className="mt-1 flex gap-1.5">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        aria-pressed={(draft.priority ?? "Medium") === p}
                        onClick={() => setDraft((d) => ({ ...d, priority: p }))}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-xs",
                          (draft.priority ?? "Medium") === p
                            ? "border-primary bg-secondary text-foreground"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Effort</label>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {EFFORTS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        aria-pressed={(draft.effort ?? "1–2h") === e}
                        onClick={() => setDraft((d) => ({ ...d, effort: e }))}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-xs",
                          (draft.effort ?? "1–2h") === e
                            ? "border-primary bg-secondary text-foreground"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setAdding(null)}>
                  <X className="mr-1 h-4 w-4" aria-hidden />
                  Cancel
                </Button>
                <Button variant="hero" size="sm" onClick={() => addCustom(group.horizon)}>
                  <Plus className="mr-1 h-4 w-4" aria-hidden />
                  Add
                </Button>
              </div>
            </div>
          )}

          <ul className="mt-4 space-y-2">
            {group.actions.length === 0 && (
              <li className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                No actions yet. Add one above.
              </li>
            )}
            {group.actions.map((a) => {
              const done = isDone(a.key);
              return (
                <li
                  key={a.key}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                    done ? "border-border bg-secondary/40" : "border-border bg-transparent",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleAction(a.key)}
                    aria-pressed={done}
                    aria-label={
                      done ? `Mark "${a.title}" as not done` : `Mark "${a.title}" as done`
                    }
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary",
                    )}
                  >
                    {done && <Check size={12} />}
                  </button>
                  <div className="flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        done ? "text-muted-foreground line-through" : "text-foreground",
                      )}
                    >
                      {a.title}
                    </p>
                    {a.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
                    )}
                    <div className="mt-1.5 flex gap-2">
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                        {a.priority}
                      </span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                        {a.effort}
                      </span>
                    </div>
                  </div>
                  {!a.fromModel && (
                    <button
                      type="button"
                      onClick={() => deleteCustom(group.horizon, a.key)}
                      aria-label={`Delete action "${a.title}"`}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
