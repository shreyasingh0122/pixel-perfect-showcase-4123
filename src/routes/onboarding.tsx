import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
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
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — FutureLens" },
      { name: "description", content: "Set up your profile to start modelling your futures." },
    ],
  }),
  component: OnboardingPage,
});

const STEPS = ["Goal", "Current State", "Skills", "Priorities", "Trade-offs", "Risk", "Review"];

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

function OnboardingPage() {
  const { user, setOnboarded } = useAuth();
  const { setDraft, generate } = useSimulationStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) navigate({ to: "/signin" });
  }, [user, navigate]);

  const update = (patch: Partial<UserProfile>) => setProfile((p) => ({ ...p, ...patch }));
  const updateState = (patch: Partial<UserProfile["currentState"]>) =>
    update({ currentState: { ...profile.currentState, ...patch } });

  const canContinue =
    step === 0
      ? Boolean(profile.goal && profile.timeline)
      : step === 1
        ? Boolean(profile.currentState.stage && profile.currentState.experience)
        : true;

  async function finish() {
    setSaving(true);
    try {
      setDraft(profile);
      await setOnboarded(true);
      const sim = generate(profile);

      if (user) {
        await supabase.from("simulations").insert({
          user_id: user.id,
          decision_label: sim.decision.label,
          horizon: sim.decision.horizon,
          profile_data: profile as unknown as Record<string, unknown>,
          simulation_data: sim as unknown as Record<string, unknown>,
        });
      }

      toast("Profile saved! Generating your futures…");
      navigate({ to: "/scenarios" });
    } catch {
      toast("Profile saved locally. Generating your futures…");
      navigate({ to: "/scenarios" });
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="bg-aurora">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">
          Onboarding
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Let's set up your profile</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          This becomes the starting point for every simulation. You can edit it later from your
          profile page.
        </p>

        <ol className="mt-8 flex items-center gap-1 overflow-x-auto pb-1" aria-label="Progress">
          {STEPS.map((t, i) => (
            <li key={t} className="flex min-w-fit flex-1 flex-col gap-1.5">
              <span
                className={cn(
                  "h-1 rounded-full transition-colors",
                  i <= step ? "bg-violet" : "bg-secondary",
                )}
              />
              <span
                className={cn(
                  "whitespace-nowrap text-[10px] font-medium sm:text-xs",
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
              <Field label="What are you trying to decide?">
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
              <Field label="Specific goal (optional)">
                <Input
                  value={profile.specificGoal}
                  onChange={(e) => update({ specificGoal: e.target.value })}
                  placeholder="Describe it in a few words"
                />
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
            <div className="space-y-5">
              <Field label="What matters most?" hint="Pick any that apply.">
                <ChipGroup
                  options={PRIORITIES}
                  selected={profile.priorities}
                  onToggle={(p) => update({ priorities: toggle(profile.priorities, p) })}
                />
              </Field>
              <Field label="What's working against you?">
                <ChipGroup
                  options={CONSTRAINTS}
                  selected={profile.constraints}
                  onToggle={(c) => update({ constraints: toggle(profile.constraints, c) })}
                />
              </Field>
            </div>
          )}

          {step === 4 && (
            <Field label="What could you trade off?">
              <ChipGroup
                options={TRADEOFFS}
                selected={profile.tradeoffs}
                onToggle={(t) => update({ tradeoffs: toggle(profile.tradeoffs, t) })}
              />
            </Field>
          )}

          {step === 5 && (
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
          )}

          {step === 6 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground">Review your profile</h2>
              <p className="text-sm text-muted-foreground">
                Everything below feeds the simulation. You can edit any section later.
              </p>
              <div className="space-y-4">
                <ReviewItem label="Goal" value={`${GOALS.find((g) => g.key === profile.goal)?.label ?? profile.goal}${profile.specificGoal ? ` — ${profile.specificGoal}` : ""}`} onEdit={() => setStep(0)} />
                <ReviewItem label="Timeline" value={profile.timeline} onEdit={() => setStep(0)} />
                <ReviewItem label="Current state" value={`${profile.currentState.stage} · ${profile.currentState.experience} · ${profile.currentState.hoursPerWeek}h/week`} onEdit={() => setStep(1)} />
                <ReviewItem label="Skills" value={SKILLS.map((s) => `${s.label}: ${profile.skills[s.key as SkillKey]}`).join(", ")} onEdit={() => setStep(2)} />
                <ReviewItem label="Priorities" value={profile.priorities.length ? profile.priorities.join(", ") : "None selected"} onEdit={() => setStep(3)} />
                <ReviewItem label="Trade-offs" value={profile.tradeoffs.length ? profile.tradeoffs.join(", ") : "None selected"} onEdit={() => setStep(4)} />
                <ReviewItem label="Risk preference" value={RISK_OPTIONS.find((r) => r.key === profile.riskPreference)?.label ?? profile.riskPreference} onEdit={() => setStep(5)} />
                <ReviewItem label="Constraints" value={profile.constraints.length ? profile.constraints.join(", ") : "None selected"} onEdit={() => setStep(3)} />
              </div>
              <Field label={`Consistency: ${profile.consistency}/100`} hint={consistencyLabel(profile.consistency)}>
                <Slider
                  value={[profile.consistency]}
                  onValueChange={([v]) => update({ consistency: v })}
                  min={0}
                  max={100}
                  step={5}
                />
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
            {step < STEPS.length - 1 ? (
              <Button variant="hero" onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
                Continue <ArrowRight />
              </Button>
            ) : (
              <Button variant="hero" onClick={finish} disabled={saving}>
                <Sparkles /> {saving ? "Saving…" : "Generate my futures"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewItem({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-4">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm text-foreground break-words">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${label}`}
        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <Pencil size={14} />
      </button>
    </div>
  );
}
