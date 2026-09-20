import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { knobsFromProfile, resimulate } from "@/services/simulation";
import { RISK_OPTIONS } from "@/data/goals";
import type { RiskPreference, Simulation } from "@/types";
import { cn } from "@/lib/utils";

/** Re-runs the deterministic engine with adjusted knobs — no faked animation. */
export function SensitivityExplorer({
  simulation,
  scenarioId,
}: {
  simulation: Simulation;
  scenarioId: string;
}) {
  const baseKnobs = useMemo(() => knobsFromProfile(simulation.profile), [simulation.profile]);
  const [knobs, setKnobs] = useState(baseKnobs);

  const adjusted = useMemo(
    () => resimulate(simulation.profile, knobs),
    [simulation.profile, knobs],
  );

  const before = simulation.scenarios.find((s) => s.id === scenarioId) ?? simulation.scenarios[0];
  const after = adjusted.scenarios.find((s) => s.id === before.id) ?? adjusted.scenarios[0];
  const changed = JSON.stringify(knobs) !== JSON.stringify(baseKnobs);

  const rows = [
    { label: "Modelled readiness", a: before.metrics.readiness, b: after.metrics.readiness },
    { label: "Technical depth", a: before.metrics.depth, b: after.metrics.depth },
    { label: "Breadth", a: before.metrics.breadth, b: after.metrics.breadth },
    { label: "Time demand", a: before.metrics.timeDemand, b: after.metrics.timeDemand },
    { label: "Flexibility", a: before.metrics.flexibility, b: after.metrics.flexibility },
    { label: "Uncertainty score", a: before.uncertainty.score, b: after.uncertainty.score },
  ];

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="glass rounded-2xl border border-border p-5">
        <h3 className="text-base font-semibold text-foreground">What if?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust an assumption and the model recalculates. Nothing here is saved to your simulation.
        </p>

        <div className="mt-5 space-y-6">
          <Knob
            id="knob-hours"
            label="Hours available per week"
            value={knobs.hoursPerWeek}
            display={`${knobs.hoursPerWeek} h`}
            min={2}
            max={60}
            step={1}
            onChange={(v) => setKnobs((k) => ({ ...k, hoursPerWeek: v }))}
          />
          <Knob
            id="knob-consistency"
            label="Consistency"
            value={knobs.consistency}
            display={`${knobs.consistency}/100`}
            min={0}
            max={100}
            step={5}
            onChange={(v) => setKnobs((k) => ({ ...k, consistency: v }))}
          />
          <Knob
            id="knob-quality"
            label="Project quality"
            value={knobs.projectQuality}
            display={`${knobs.projectQuality}/100`}
            min={0}
            max={100}
            step={5}
            onChange={(v) => setKnobs((k) => ({ ...k, projectQuality: v }))}
          />
          <Knob
            id="knob-focus"
            label="Learning focus (narrow ↔ wide)"
            value={knobs.learningFocus}
            display={`${knobs.learningFocus}/100`}
            min={0}
            max={100}
            step={5}
            onChange={(v) => setKnobs((k) => ({ ...k, learningFocus: v }))}
          />

          <fieldset>
            <legend className="text-sm font-medium text-foreground">Risk preference</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {RISK_OPTIONS.map((opt) => {
                const active = knobs.riskPreference === (opt.key as RiskPreference);
                return (
                  <button
                    key={opt.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setKnobs((k) => ({ ...k, riskPreference: opt.key as RiskPreference }))
                    }
                    className={cn(
                      "min-h-11 rounded-lg border px-3 text-sm",
                      active
                        ? "border-primary bg-secondary text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Button variant="outline" onClick={() => setKnobs(baseKnobs)} disabled={!changed}>
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
            Reset to your inputs
          </Button>
        </div>
      </div>

      <div className="glass rounded-2xl border border-border p-5">
        <h3 className="text-base font-semibold text-foreground">
          {before.label}: current vs adjusted model
        </h3>
        <p className="mt-1 text-sm text-muted-foreground" role="status">
          {changed
            ? "Values below are recalculated from the adjusted assumptions."
            : "No assumptions changed yet — both columns show your current model."}
        </p>

        <table className="mt-4 w-full text-sm">
          <caption className="sr-only">
            Comparison of modelled metrics before and after adjusting assumptions
          </caption>
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="py-2 font-medium">
                Metric
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Current
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Adjusted
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const delta = r.b - r.a;
              return (
                <tr key={r.label} className="border-t border-border/60">
                  <th scope="row" className="py-2.5 text-left font-normal text-muted-foreground">
                    {r.label}
                  </th>
                  <td className="py-2.5 text-right font-mono text-muted-foreground">{r.a}</td>
                  <td className="py-2.5 text-right font-mono text-foreground">{r.b}</td>
                  <td className="py-2.5 text-right font-mono">
                    {delta === 0 ? (
                      <span className="text-muted-foreground">no change</span>
                    ) : (
                      <span className={delta > 0 ? "text-primary" : "text-muted-foreground"}>
                        {delta > 0 ? "▲ +" : "▼ "}
                        {delta}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Why these moved
          </h4>
          <ul className="mt-2 space-y-1.5">
            {after.sensitivity.map((f) => (
              <li key={f.factor} className="text-sm text-muted-foreground">
                <span className="text-foreground">{f.factor}</span> — weight {f.impact}/100.{" "}
                {f.note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Knob({
  id,
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <span className="font-mono text-sm text-muted-foreground">{display}</span>
      </div>
      <Slider
        id={id}
        className="mt-3"
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        aria-label={label}
      />
    </div>
  );
}
