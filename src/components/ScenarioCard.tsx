import { cn } from "@/lib/utils";
import type { Scenario } from "@/types";

function Metric({ label, value, unit }: { label: string; value: number; unit?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">
          {value}
          {unit ?? "/100"}
        </span>
      </div>
      <div
        className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary"
        role="img"
        aria-label={`${label}: modelled ${value} of 100`}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ScenarioCard({
  scenario,
  selected,
  onSelect,
}: {
  scenario: Scenario;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const s = scenario;
  return (
    <article
      className={cn(
        "glass flex h-full flex-col rounded-2xl border p-5 transition-colors",
        selected ? "border-primary/70" : "border-border",
      )}
    >
      <header>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">{s.label}</h3>
          <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
            {s.uncertainty.level} uncertainty
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
      </header>

      <dl className="mt-4 space-y-2.5">
        <Metric label="Modelled readiness" value={s.metrics.readiness} />
        <Metric label="Technical depth" value={s.metrics.depth} />
        <Metric label="Breadth" value={s.metrics.breadth} />
        <Metric label="Time demand" value={s.metrics.timeDemand} />
        <Metric label="Flexibility" value={s.metrics.flexibility} />
      </dl>

      <p className="mt-4 text-xs text-muted-foreground">
        Modelled range at horizon: {s.uncertainty.range[0]}–{s.uncertainty.range[1]} of 100. Model
        output from your inputs — not a prediction.
      </p>

      <div className="mt-4 space-y-3 text-sm">
        <Group title="Strengths" items={s.strengths} />
        <Group title="Risks" items={s.risks} />
        <Group title="Trade-offs" items={s.tradeoffs} />
        <Group title="Assumptions" items={s.assumptions} />
      </div>

      {onSelect && (
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className={cn(
            "mt-5 min-h-11 w-full rounded-lg border px-4 text-sm font-medium transition-colors",
            selected
              ? "border-primary bg-secondary text-foreground"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          {selected ? "Selected scenario" : "Focus this scenario"}
        </button>
      )}
    </article>
  );
}

function Group({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <ul className="mt-1 space-y-1">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-muted-foreground">
            <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
