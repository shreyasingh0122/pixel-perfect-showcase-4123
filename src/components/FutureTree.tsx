import { useId } from "react";
import type { Scenario } from "@/types";
import { cn } from "@/lib/utils";

const COLORS: Record<Scenario["type"], string> = {
  depth: "var(--chart-1)",
  balanced: "var(--chart-2)",
  exploration: "var(--chart-3)",
};

interface Props {
  scenarios: Scenario[];
  selectedId: string;
  onSelect: (id: string) => void;
  stageIndex: number;
  onStageChange: (index: number) => void;
  decisionLabel: string;
}

/**
 * Interactive future tree. Desktop renders a horizontal SVG branch map,
 * mobile renders the same simulation data as a vertical stack.
 */
export function FutureTree({
  scenarios,
  selectedId,
  onSelect,
  stageIndex,
  onStageChange,
  decisionLabel,
}: Props) {
  const gradId = useId().replace(/:/g, "");
  const steps = scenarios[0]?.trajectory ?? [];

  return (
    <div>
      {/* Desktop / tablet */}
      <div className="hidden md:block">
        <svg
          viewBox="0 0 1000 380"
          className="h-auto w-full"
          role="img"
          aria-label={`Future tree for ${decisionLabel}: current state branches into ${scenarios.length} modelled scenarios across ${steps.length} timeline stages.`}
        >
          <defs>
            <linearGradient id={`trunk-${gradId}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--chart-2)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--chart-2)" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* trunk */}
          <line
            x1="70"
            y1="190"
            x2="230"
            y2="190"
            stroke={`url(#trunk-${gradId})`}
            strokeWidth="4"
          />
          <circle cx="70" cy="190" r="9" fill="var(--chart-2)" />
          <text x="70" y="220" textAnchor="middle" className="fill-muted-foreground text-[13px]">
            Current state
          </text>
          <circle cx="230" cy="190" r="7" fill="var(--chart-2)" />
          <text x="230" y="220" textAnchor="middle" className="fill-muted-foreground text-[13px]">
            Decision
          </text>

          {/* branches */}
          {scenarios.map((s, i) => {
            const targetY = 80 + i * 110;
            const active = s.id === selectedId;
            const color = COLORS[s.type];
            const xs = steps.map((_, k) => 330 + k * ((940 - 330) / Math.max(1, steps.length - 1)));
            return (
              <g key={s.id} opacity={active ? 1 : 0.45}>
                <path
                  d={`M 230 190 C 280 190, 290 ${targetY}, 330 ${targetY}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={active ? 3.5 : 2}
                />
                <polyline
                  points={steps
                    .map(
                      (pt, k) =>
                        `${xs[k]},${targetY - (pt.readiness - (steps[0]?.readiness ?? 0)) * 0.35}`,
                    )
                    .join(" ")}
                  fill="none"
                  stroke={color}
                  strokeWidth={active ? 3 : 1.8}
                />
                {steps.map((pt, k) => {
                  const cy = targetY - (pt.readiness - (steps[0]?.readiness ?? 0)) * 0.35;
                  const isStage = k === stageIndex;
                  return (
                    <g
                      key={pt.label}
                      role="button"
                      tabIndex={0}
                      aria-label={`${s.label}, ${pt.label}: modelled readiness ${pt.readiness} of 100, range ${pt.low} to ${pt.high}`}
                      className="cursor-pointer focus:outline-none"
                      onClick={() => {
                        onSelect(s.id);
                        onStageChange(k);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelect(s.id);
                          onStageChange(k);
                        }
                      }}
                    >
                      <circle
                        cx={xs[k]}
                        cy={cy}
                        r={isStage && active ? 8 : 5}
                        fill={isStage && active ? color : "var(--background)"}
                        stroke={color}
                        strokeWidth="2"
                      />
                      {active && (
                        <text
                          x={xs[k]}
                          y={cy - 14}
                          textAnchor="middle"
                          className="fill-foreground text-[12px]"
                        >
                          {pt.readiness}
                        </text>
                      )}
                    </g>
                  );
                })}
                <text
                  x="330"
                  y={targetY - 18}
                  className={cn("text-[13px]", active ? "fill-foreground" : "fill-muted-foreground")}
                  onClick={() => onSelect(s.id)}
                >
                  {s.label}
                </text>
              </g>
            );
          })}

          {steps.map((pt, k) => {
            const x = 330 + k * ((940 - 330) / Math.max(1, steps.length - 1));
            return (
              <text
                key={pt.label}
                x={x}
                y="360"
                textAnchor="middle"
                className="fill-muted-foreground text-[12px]"
              >
                {pt.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Mobile: same data, stacked */}
      <ul className="space-y-3 md:hidden">
        {scenarios.map((s) => {
          const active = s.id === selectedId;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                aria-pressed={active}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-colors",
                  active ? "border-primary bg-secondary" : "border-border",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-foreground">{s.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {s.metrics.readiness}/100 modelled
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{s.focus}</p>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {s.trajectory.map((pt, k) => (
                    <button
                      key={pt.label}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(s.id);
                        onStageChange(k);
                      }}
                      className={cn(
                        "min-h-11 min-w-20 shrink-0 rounded-lg border px-3 py-2 text-left text-xs",
                        active && k === stageIndex
                          ? "border-primary text-foreground"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      <span className="block">{pt.label}</span>
                      <span className="font-mono">{pt.readiness}</span>
                    </button>
                  ))}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
