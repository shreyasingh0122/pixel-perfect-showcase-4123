import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useSimulationStore } from "@/store/simulation";
import { formatDate } from "@/utils/formatting";
import { toast } from "sonner";
import type { Simulation } from "@/types";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — FutureLens" },
      { name: "description", content: "View and manage your saved simulations." },
    ],
  }),
  component: HistoryPage,
});

interface SavedSim {
  id: string;
  decision_label: string;
  horizon: string;
  created_at: string;
  simulation_data: Record<string, unknown>;
}

function HistoryPage() {
  const { user, authLoading } = useAuth();
  const { simulations: localSims, remove, setActive } = useSimulationStore();
  const navigate = useNavigate();
  const [savedSims, setSavedSims] = useState<SavedSim[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/signin" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("simulations")
      .select("id, decision_label, horizon, created_at, simulation_data")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setSavedSims((data ?? []) as SavedSim[]);
        setLoading(false);
      });
  }, [user]);

  if (!user) return null;

  const filteredSaved = savedSims.filter((s) =>
    s.decision_label.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredLocal = localSims.filter((s: Simulation) =>
    s.decision.label.toLowerCase().includes(search.toLowerCase()),
  );

  async function deleteSaved(id: string) {
    const { error } = await supabase.from("simulations").delete().eq("id", id);
    if (error) {
      toast("Failed to delete simulation.");
      return;
    }
    setSavedSims((sims) => sims.filter((s) => s.id !== id));
    toast("Simulation deleted.");
    setConfirmDelete(null);
  }

  function openLocal(sim: Simulation) {
    setActive(sim.id);
    navigate({ to: "/scenarios" });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">History</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Your simulations</h1>
        </div>
        <Button asChild variant="hero">
          <Link to="/simulator">New Simulation</Link>
        </Button>
      </header>

      <div className="relative mt-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          className="pl-9"
          placeholder="Search simulations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search simulations"
        />
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      ) : filteredSaved.length === 0 && filteredLocal.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {search ? "No simulations match your search." : "No simulations yet."}
          </p>
          {!search && (
            <Button asChild variant="hero" className="mt-4">
              <Link to="/simulator">Create your first simulation</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filteredSaved.map((sim) => (
            <div
              key={sim.id}
              className="glass flex items-center justify-between gap-4 rounded-xl border border-border p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {sim.decision_label || "Untitled decision"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {sim.horizon} · {formatDate(sim.created_at)} · Saved
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/scenarios">
                    <ExternalLink size={14} />
                    Open
                  </Link>
                </Button>
                {confirmDelete === sim.id ? (
                  <div className="flex gap-1">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteSaved(sim.id)}
                    >
                      Confirm
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-label={`Delete simulation ${sim.decision_label}`}
                    onClick={() => setConfirmDelete(sim.id)}
                    className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredLocal.map((sim) => (
            <div
              key={sim.id}
              className="glass flex items-center justify-between gap-4 rounded-xl border border-border p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {sim.decision.label || "Untitled decision"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {sim.decision.horizon} · {formatDate(sim.createdAt)} · Local (this browser)
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => openLocal(sim)}>
                  <ExternalLink size={14} />
                  Open
                </Button>
                {confirmDelete === sim.id ? (
                  <div className="flex gap-1">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        remove(sim.id);
                        setConfirmDelete(null);
                        toast("Simulation deleted.");
                      }}
                    >
                      Confirm
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-label={`Delete simulation ${sim.decision.label}`}
                    onClick={() => setConfirmDelete(sim.id)}
                    className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
