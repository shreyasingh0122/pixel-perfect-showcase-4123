import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSimulationStore } from "@/store/simulation";
import {
  CONSTRAINTS,
  EXPERIENCE_LEVELS,
  GOALS,
  PRIORITIES,
  RISK_OPTIONS,
  SKILLS,
  STAGES,
  TIMELINES,
  TRADEOFFS,
  consistencyLabel,
  skillLabel,
} from "@/data/goals";
import type { SkillKey, Skills, UserProfile } from "@/types";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "Simulator — FutureLens" },
      {
        name: "description",
        content:
          "Describe your goal, current state, skills and preferences — FutureLens models three scenario paths with trajectories, uncertainty and next moves.",
      },
      { property: "og:title", content: "Simulator — FutureLens" },
      {
        property: "og:description",
        content:
          "A four-step guided flow that turns your inputs into three model-based future scenarios.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SimulatorPage,
});

const STEP_TITLES = ["Goal", "Current State", "Skills", "Preferences"];

const DEFAULT_SKILLS: Skills = {
  dsa: 40,
  programming: 50,
  ml: 30,
  development: 45,
  communication: 55,
  research: 40,
  leadership: 35,
  business: 30,
};

function defaultProfile(): UserProfile {
  return {
    goal: "career",
    specificGoal: "",
    timeline: "1 year",
    currentState: {
      stage: "2nd year",
      academic: "",
      projects: 2,
      experience: "Personal projects only",
      hoursPerWeek: 12,
    },
    skills: { ...DEFAULT_SKILLS },
    priorities: [],
    tradeoffs: [],
    consistency: 60,
    riskPreference: "balanced",
    constraints: [],
    notes: "",
  };
}

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-violet/60 bg-accent text-foreground"
                : "border-border bg-transparent text-muted-foreground hover:border-input hover:text-foreground",
            )}
          >
            {active && <Check className="mr-1 inline" size={12} />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

const LOADING_STEPS = [
  "Reading your inputs…",
  "Mapping skills to scenario weights…",
  "Modelling three trajectories…",
  "Estimating uncertainty ranges…",
  "Composing next moves…",
];

function SimulatorPage() {
  const { draft, setDraft, generate } = useSimulationStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const profile = useMemo<UserProfile>(() => {
    return { ...defaultProfile(), ...(draft as Partial<UserProfile> | null) } as UserProfile;
  }, [draft]);

  const update = (patch: Partial<UserProfile>) => setDraft({ ...profile, ...patch });
  const updateState = (patch: Partial<UserProfile["currentState"]>) =>
    update({ currentState: { ...profile.currentState, ...patch } });

  const canContinue =
    step === 0
      ? Boolean(profile.goal && profile.timeline)
      : step === 1
        ? Boolean(profile.currentState.stage && profile.currentState.experience)
        : true;

  useEffect(() => {
    if (!loading) return;
    const id = window.setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 650);
    return () => window.clearInterval(id);
  }, [loading]);

  const finish = () => {
    setLoading(true);
    setLoadingStep(0);
    window.setTimeout(() => {
      generate(profile);
      navigate({ to: "/scenarios" });
    }, 3400);
  };

  if (loading) {
    return (
      <div className="bg-aurora flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <span className="glass-strong mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl text-violet">
            <Sparkles className="animate-pulse" size={28} />
          </span>
          <h1 className="mt-6 text-2xl font-bold">Modelling your futures</h1>
          <div className="mt-8 space-y-3 text-left">
            {LOADING_STEPS.map((label, i) => (
              <div
                key={label}
                className={cn(
                  "glass flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-opacity",
                  i > loadingStep && "opacity-35",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border text-[10px]",
                    i < loadingStep
                      ? "border-cyan/60 bg-cyan/15 text-cyan"
                      : i === loadingStep
                        ? "border-violet/60 text-violet"
                        : "border-border text-muted-foreground",
                  )}
                >
                  {i < loadingStep ? <Check size={11} /> : i + 1}
                </span>
                <span className={i === loadingStep ? "text-foreground" : "text-muted-foreground"}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-aurora">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">Simulator</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Describe your decision</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Honest inputs make useful scenarios. You can adjust everything and re-run later.
        </p>

        {/* Progress */}
        <ol className="mt-8 flex items-center gap-2" aria-label="Progress">
          {STEP_TITLES.map((t, i) => (
            <li key={t} className="flex flex-1 flex-col gap-2">
              <span
                className={cn(
                  "h-1 rounded-full transition-colors",
                  i <= step ? "bg-violet" : "bg-secondary",
                )}
              />
              <span
                className={cn(
                  "text-[11px] font-medium sm:text-xs",
                  i === step ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {t}
              </span>
            </li>
          ))}
        </ol>

        <div className="glass mt-8 rounded-2xl p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-7">
              <Field label="What kind of decision is this?">
                <div className="grid gap-3 sm:grid-cols-2">
                  {GOALS.map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => update({ goal: g.key, specificGoal: "" })}
                      aria-pressed={profile.goal === g.key}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors",
                        profile.goal === g.key
                          ? "border-violet/60 bg-accent"
                          : "border-border hover:border-input",
                      )}
                    >
                      <p className="text-sm font-semibold">{g.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{g.blurb}</p>
                    </button>
                  ))}
                </div>
              </Field>

              <Field
                label="What's the specific goal?"
                hint={`e.g. ${GOALS.find((g) => g.key === profile.goal)?.examples.slice(0, 2).join(" or ")}`}
              >
                <Input
                  value={profile.specificGoal}
                  onChange={(e) => update({ specificGoal: e.target.value })}
                  placeholder="Describe it in a few words"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {GOALS.find((g) => g.key === profile.goal)?.examples.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => update({ specificGoal: ex })}
                      className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground hover:border-input hover:text-foreground"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Timeline">
                <div className="flex flex-wrap gap-2">
                  {TIMELINES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => update({ timeline: t })}
                      aria-pressed={profile.timeline === t}
                      className={cn(
                        "rounded-lg border px-4 py-2 text-sm transition-colors",
                        profile.timeline === t
                          ? "border-violet/60 bg-accent text-foreground"
                          : "border-border text-muted-foreground hover:border-input hover:text-foreground",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-7">
              <Field label="Where are you right now?">
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateState({ stage: s })}
                      aria-pressed={profile.currentState.stage === s}
                      className={cn(
                        "rounded-lg border px-3.5 py-2 text-sm transition-colors",
                        profile.currentState.stage === s
                          ? "border-violet/60 bg-accent text-foreground"
                          : "border-border text-muted-foreground hover:border-input hover:text-foreground",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Experience level">
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => updateState({ experience: e })}
                      aria-pressed={profile.currentState.experience === e}
                      className={cn(
                        "rounded-lg border px-3.5 py-2 text-sm transition-colors",
                        profile.currentState.experience === e
                          ? "border-violet/60 bg-accent text-foreground"
                          : "border-border text-muted-foreground hover:border-input hover:text-foreground",
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid gap-7 sm:grid-cols-2">
                <Field label={`Projects shipped: ${profile.currentState.projects}`}>
                  <Slider
                    value={[profile.currentState.projects]}
                    onValueChange={([v]) => updateState({ projects: v })}
                    min={0}
                    max={10}
                    step={1}
                  />
                </Field>
                <Field
                  label={`Focused hours per week: ${profile.currentState.hoursPerWeek}h`}
                  hint="Be realistic — this drives every trajectory."
                >
                  <Slider
                    value={[profile.currentState.hoursPerWeek]}
                    onValueChange={([v]) => updateState({ hoursPerWeek: v })}
                    min={2}
                    max={40}
                    step={1}
                  />
                </Field>
              </div>

              <Field label="Academic / work context (optional)">
                <Input
                  value={profile.currentState.academic}
                  onChange={(e) => updateState({ academic: e.target.value })}
                  placeholder="e.g. B.Tech CS, working full-time, gap year"
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Rate each skill honestly — the model uses these as starting points, not
                judgements.
              </p>
              {SKILLS.map((s) => {
                const value = profile.skills[s.key as SkillKey];
                return (
                  <div key={s.key} className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm font-medium">{s.label}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {value} · {skillLabel(value)}
                      </p>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={([v]) =>
                        update({ skills: { ...profile.skills, [s.key]: v } })
                      }
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-7">
              <Field label="What matters most?" hint="Pick any that apply.">
                <ChipGroup
                  options={PRIORITIES}
                  selected={profile.priorities}
                  onToggle={(p) => update({ priorities: toggle(profile.priorities, p) })}
                />
              </Field>

              <Field label="What could you trade off?">
                <ChipGroup
                  options={TRADEOFFS}
                  selected={profile.tradeoffs}
                  onToggle={(t) => update({ tradeoffs: toggle(profile.tradeoffs, t) })}
                />
              </Field>

              <Field label="What's working against you?">
                <ChipGroup
                  options={CONSTRAINTS}
                  selected={profile.constraints}
                  onToggle={(c) => update({ constraints: toggle(profile.constraints, c) })}
                />
              </Field>

              <Field
                label={`Consistency: ${profile.consistency}/100`}
                hint={consistencyLabel(profile.consistency)}
              >
                <Slider
                  value={[profile.consistency]}
                  onValueChange={([v]) => update({ consistency: v })}
                  min={0}
                  max={100}
                  step={5}
                />
              </Field>

              <Field label="Risk preference">
                <div className="grid gap-3 sm:grid-cols-3">
                  {RISK_OPTIONS.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => update({ riskPreference: r.key })}
                      aria-pressed={profile.riskPreference === r.key}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors",
                        profile.riskPreference === r.key
                          ? "border-violet/60 bg-accent"
                          : "border-border hover:border-input",
                      )}
                    >
                      <p className="text-sm font-semibold">{r.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{r.blurb}</p>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Anything else the model should know? (optional)">
                <Textarea
                  value={profile.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                  placeholder="Context, deadlines, constraints in your own words…"
                  rows={3}
                />
              </Field>
            </div>
          )}

          <div className="mt-9 flex items-center justify-between border-t border-border pt-6">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft /> Back
            </Button>
            {step < 3 ? (
              <Button variant="hero" onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
                Continue <ArrowRight />
              </Button>
            ) : (
              <Button variant="hero" onClick={finish}>
                <Sparkles /> Generate my futures
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
