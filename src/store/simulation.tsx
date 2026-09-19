import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Simulation, UserProfile } from "@/types";
import { runSimulation } from "@/services/simulation";

const STORAGE_KEY = "futurelens.state.v1";

interface PersistedState {
  simulations: Simulation[];
  activeId: string | null;
  draft: Partial<UserProfile> | null;
  completedActions: string[];
}

const EMPTY: PersistedState = {
  simulations: [],
  activeId: null,
  draft: null,
  completedActions: [],
};

interface Store extends PersistedState {
  hydrated: boolean;
  active: Simulation | null;
  setDraft: (draft: Partial<UserProfile> | null) => void;
  generate: (profile: UserProfile) => Simulation;
  setActive: (id: string | null) => void;
  duplicate: (id: string) => Simulation | null;
  remove: (id: string) => void;
  toggleAction: (key: string) => void;
  reset: () => void;
}

const SimulationContext = createContext<Store | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...EMPTY, ...(JSON.parse(raw) as PersistedState) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage may be unavailable */
    }
  }, [state, hydrated]);

  const setDraft = useCallback((draft: Partial<UserProfile> | null) => {
    setState((s) => ({ ...s, draft }));
  }, []);

  const generate = useCallback((profile: UserProfile) => {
    const sim = runSimulation(profile);
    setState((s) => ({
      ...s,
      simulations: [sim, ...s.simulations].slice(0, 12),
      activeId: sim.id,
      draft: null,
    }));
    return sim;
  }, []);

  const setActive = useCallback((id: string | null) => {
    setState((s) => ({ ...s, activeId: id }));
  }, []);

  const duplicate = useCallback((id: string) => {
    let copy: Simulation | null = null;
    setState((s) => {
      const source = s.simulations.find((sim) => sim.id === id);
      if (!source) return s;
      copy = {
        ...source,
        id: `sim_${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
      };
      return { ...s, simulations: [copy, ...s.simulations].slice(0, 12), activeId: copy.id };
    });
    return copy;
  }, []);

  const remove = useCallback((id: string) => {
    setState((s) => {
      const simulations = s.simulations.filter((sim) => sim.id !== id);
      return {
        ...s,
        simulations,
        activeId: s.activeId === id ? (simulations[0]?.id ?? null) : s.activeId,
      };
    });
  }, []);

  const toggleAction = useCallback((key: string) => {
    setState((s) => ({
      ...s,
      completedActions: s.completedActions.includes(key)
        ? s.completedActions.filter((k) => k !== key)
        : [...s.completedActions, key],
    }));
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  const value = useMemo<Store>(() => {
    const active =
      state.simulations.find((sim) => sim.id === state.activeId) ?? state.simulations[0] ?? null;
    return {
      ...state,
      hydrated,
      active,
      setDraft,
      generate,
      setActive,
      duplicate,
      remove,
      toggleAction,
      reset,
    };
  }, [state, hydrated, setDraft, generate, setActive, duplicate, remove, toggleAction, reset]);

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

export function useSimulationStore(): Store {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulationStore must be used inside SimulationProvider");
  return ctx;
}
