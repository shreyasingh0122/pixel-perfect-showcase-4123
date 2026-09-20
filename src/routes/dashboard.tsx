import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Clock, CircleCheck as CheckCircle2, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useSimulationStore } from "@/store/simulation";
import type { Simulation } from "@/types";
import { formatDate } from "@/utils/formatting";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — FutureLens" },
      { name: "description", content: "Your FutureLens dashboard — simulations, strategy and progress." },
    ],
  }),
  component: DashboardPage,
});

interface SavedSim {
  id: string;
  decision_label: string;
  horizon: string;
  created_at: string;
  simulation_data: Record<string, unknown>;
}

function DashboardPage() {
  const { user, displayName, loading: authLoading } = useAuth();
  const { active, simulations, completedActions } = useSimulationStore();
  const navigate = useNavigate();
  const [savedSims, setSavedSims] = useState<SavedSim[]>([]);
  const [loadingSims, setLoadingSims] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/signin" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoadingSims(true);
    supabase
      .from("simulations")
      .select("id, decision_label, horizon, created_at, simulation_data")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setSavedSims((data ?? []) as SavedSim[]);
        setLoadingSims(false);
      });
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6" role="status" aria-live="polite">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-secondary" />
        <p className="sr-only">Loading dashboard…</p>
      </div>
    );
  }

  const name = displayName || user.email?.split("@")[0] || "there";
  const localSims = simulations;
  const totalSims = savedSims.length + localSims.length;
  const doneCount = completedActions.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
          Good to see you, {name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {totalSims > 0
            ? `You have ${totalSims} simulation${totalSims > 1 ? "s" : ""} and ${doneCount} completed action${doneCount !== 1 ? "s" : ""}.`
            : "Start by creating your first simulation."}
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Simulations" value={totalSims} icon={Compass} />
        <StatCard label="Completed actions" value={doneCount} icon={CheckCircle2} />
        <StatCard label="Scenarios modelled" value={totalSims * 3} icon={Sparkles} />
        <StatCard label="Latest horizon" value={active?.decision.horizon ?? "—"} icon={Clock} small />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Button asChild variant="hero" className="h-auto py-6">
          <Link to="/simulator">
            <div className="flex flex-col items-center gap-1">
              <Sparkles size={20} />
              New Simulation
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-6">
          <Link to="/strategy">
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 size={20} />
              Continue Strategy
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-6">
          <Link to="/history">
            <div className="flex flex-col items-center gap-1">
              <Clock size={20} />
              View History
            </div>
          </Link>
        </Button>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Recent simulations</h2>
        {loadingSims ? (
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary" />
            ))}
          </div>
        ) : savedSims.length === 0 && localSims.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No simulations yet.</p>
            <Button asChild variant="hero" className="mt-4">
              <Link to="/simulator">
                Create your first simulation <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {savedSims.map((sim) => (
              <div
                key={sim.id}
                className="glass flex items-center justify-between rounded-xl border border-border p-4"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {sim.decision_label || "Untitled decision"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {sim.horizon} · {formatDate(sim.created_at)}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/scenarios">Open</Link>
                </Button>
              </div>
            ))}
            {localSims.slice(0, 3).map((sim: Simulation) => (
              <div
                key={sim.id}
                className="glass flex items-center justify-between rounded-xl border border-border p-4"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {sim.decision.label || "Untitled decision"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {sim.decision.horizon} · {formatDate(sim.createdAt)} · Local
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/scenarios">Open</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  small,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ size?: number }>;
  small?: boolean;
}) {
  return (
    <div className="glass rounded-xl border border-border p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <Icon size={16} />
      </div>
      <p className={`mt-3 font-bold text-foreground ${small ? "text-base" : "text-2xl"}`}>
        {value}
      </p>
    </div>
  );
}
