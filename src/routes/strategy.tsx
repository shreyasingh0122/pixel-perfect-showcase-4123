import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { CircleCheck as CheckCircle2, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useSimulationStore } from "@/store/simulation";
import { StrategyPlan } from "@/components/StrategyPlan";

export const Route = createFileRoute("/strategy")({
  head: () => ({
    meta: [
      { title: "Strategy — FutureLens" },
      { name: "description", content: "Track your strategy actions across all horizons." },
    ],
  }),
  component: StrategyPage,
});

function StrategyPage() {
  const { user, authLoading } = useAuth();
  const { active, hydrated } = useSimulationStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/signin" });
  }, [user, authLoading, navigate]);

  if (!user) return null;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6" role="status" aria-live="polite">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-secondary" />
        <p className="sr-only">Loading strategy…</p>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border">
          <CheckCircle2 className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">No strategy yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your strategy will appear here after you explore a future. Create a simulation to get
          started.
        </p>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/simulator">
            <Compass className="mr-2 h-4 w-4" aria-hidden />
            Create a simulation
          </Link>
        </Button>
      </div>
    );
  }

  const scenario = active.scenarios[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Strategy</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
          Your action plan
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          For: {active.decision.label} · Horizon {active.decision.horizon}
        </p>
      </header>

      <div className="mt-8">
        <StrategyPlan simulation={active} scenario={scenario} />
      </div>
    </div>
  );
}
