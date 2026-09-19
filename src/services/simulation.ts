import type {
  ComparisonRow,
  Scenario,
  SensitivityKnobs,
  Simulation,
  SimulationInsights,
  UserProfile,
} from "@/types";
import { clamp, round } from "@/utils/formatting";

/**
 * Deterministic demo simulation engine.
 *
 * It contains no randomness and no external data: identical inputs always
 * produce identical model-based scenarios. It intentionally does not rank
 * scenarios or declare a winner.
 */

const HORIZON_STEPS: Record<string, string[]> = {
  "3 months": ["Now", "Week 4", "Week 8", "Week 12"],
  "6 months": ["Now", "Month 2", "Month 4", "Month 6"],
  "1 year": ["Now", "Month 3", "Month 6", "Month 12"],
  "2 years": ["Now", "Month 6", "Year 1", "Year 2"],
  "3+ years": ["Now", "Year 1", "Year 2", "Year 3"],
};

const RISK_VARIANCE = {
  conservative: 0.7,
  balanced: 1,
  "high-growth": 1.35,
} as const;

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function knobsFromProfile(profile: UserProfile): SensitivityKnobs {
  return {
    hoursPerWeek: profile.currentState.hoursPerWeek,
    consistency: profile.consistency,
    projectQuality: clamp(40 + profile.currentState.projects * 12),
    learningFocus: 50,
    riskPreference: profile.riskPreference,
  };
}

interface Base {
  technical: number;
  breadthBase: number;
  capacity: number;
  discipline: number;
  quality: number;
  variance: number;
  focus: number;
}

function baseFrom(profile: UserProfile, knobs: SensitivityKnobs): Base {
  const s = profile.skills;
  const technical = avg([s.dsa, s.programming, s.ml, s.development]);
  const breadthBase = avg([s.communication, s.research, s.leadership, s.business]);
  const capacity = clamp((knobs.hoursPerWeek / 30) * 100);
  const discipline = clamp(knobs.consistency);
  const quality = clamp(knobs.projectQuality);
  const constraintDrag = clamp(profile.constraints.length * 4, 0, 20);
  return {
    technical,
    breadthBase,
    capacity: clamp(capacity - constraintDrag),
    discipline,
    quality,
    variance: RISK_VARIANCE[knobs.riskPreference],
    focus: clamp(knobs.learningFocus),
  };
}

function trajectory(
  profile: UserProfile,
  readiness: number,
  start: number,
  variance: number,
): Scenario["trajectory"] {
  const steps = HORIZON_STEPS[profile.timeline] ?? HORIZON_STEPS["1 year"];
  return steps.map((label, i) => {
    const t = i / (steps.length - 1);
    const value = clamp(start + (readiness - start) * (0.35 * t + 0.65 * t * t));
    const spread = (6 + 14 * t) * variance;
    return {
      label,
      readiness: round(value),
      low: round(clamp(value - spread)),
      high: round(clamp(value + spread)),
    };
  });
}

function uncertaintyOf(
  score: number,
  readiness: number,
  notes: string[],
): Scenario["uncertainty"] {
  const level = score >= 66 ? "High" : score >= 38 ? "Moderate" : "Low";
  const spread = 6 + score * 0.22;
  return {
    level,
    score: round(score),
    range: [round(clamp(readiness - spread)), round(clamp(readiness + spread))],
    notes,
  };
}

function priorityText(profile: UserProfile, fallback: string): string {
  return profile.priorities.length ? profile.priorities.slice(0, 3).join(", ") : fallback;
}

function buildScenarios(profile: UserProfile, knobs: SensitivityKnobs): Scenario[] {
  const b = baseFrom(profile, knobs);
  const goal = profile.specificGoal || "this decision";
  const effective = (weight: number) => clamp(b.capacity * weight * (0.5 + b.discipline / 200));

  // --- Technical Depth -----------------------------------------------------
  const depthReadiness = clamp(
    0.44 * b.technical + 0.3 * effective(1) + 0.18 * b.quality + 0.08 * (b.focus / 1),
  );
  const depth: Scenario = {
    id: "technical-depth",
    label: "Technical Depth",
    type: "depth",
    focus: "Deep specialisation in a narrow area",
    description: `Most available time is concentrated on one technical track for ${goal}. Depth compounds quickly, breadth grows slowly.`,
    metrics: {
      depth: clamp(b.technical * 0.5 + effective(1) * 0.5 + 12),
      breadth: clamp(b.breadthBase * 0.6 - 6),
      timeDemand: clamp(72 + (100 - b.capacity) * 0.2),
      flexibility: clamp(46 - b.variance * 6),
      projectFocus: clamp(b.quality * 0.6 + 34),
      readiness: depthReadiness,
    },
    strengths: [
      "Stronger technical depth in the chosen track",
      "Portfolio reads as specialised rather than scattered",
      "Clearer signal for depth-focused evaluations",
    ],
    risks: [
      "Narrower exploration if interests shift",
      "Higher weekly time commitment to sustain",
      "Progress is sensitive to dips in consistency",
    ],
    opportunities: [
      "One flagship project can carry the whole portfolio",
      "Deeper fundamentals transfer to adjacent tracks later",
    ],
    tradeoffs: [
      `Less time for areas outside ${profile.priorities[0] ?? "the chosen track"}`,
      "Breadth-based options stay comparatively open-ended",
    ],
    assumptions: [
      `Roughly ${knobs.hoursPerWeek} focused hours per week remain available`,
      `Consistency stays near ${knobs.consistency}/100`,
      "The chosen track does not change mid-horizon",
    ],
    uncertainty: uncertaintyOf(
      clamp(34 + (100 - b.discipline) * 0.35 * b.variance),
      depthReadiness,
      [
        "Depth paths are most sensitive to sustained weekly time",
        "A single interrupted month has an outsized effect here",
      ],
    ),
    sensitivity: [],
    trajectory: [],
    weeklyAllocation: [
      { area: "Core technical practice", hours: round(knobs.hoursPerWeek * 0.45) },
      { area: "Flagship project", hours: round(knobs.hoursPerWeek * 0.35) },
      { area: "Review & reflection", hours: round(knobs.hoursPerWeek * 0.2) },
    ],
    milestones: [
      { window: "Week 1–2", title: "Foundation", focus: ["Pick one track", "Fix the weekly rhythm"] },
      { window: "Week 3–6", title: "Execution", focus: ["Daily practice block", "Start flagship project"] },
      { window: "Month 2", title: "Portfolio", focus: ["Ship the project", "Write it up clearly"] },
      { window: "Month 3", title: "Evaluation", focus: ["Apply / present", "Review what held"] },
    ],
    nextActions: [
      {
        horizon: "This Week",
        items: [
          "Choose exactly one technical track and write it down",
          `Block ${Math.max(3, round(knobs.hoursPerWeek * 0.45))} hours of focused practice`,
        ],
      },
      {
        horizon: "Next 30 Days",
        items: ["Start one substantial project in the track", "Complete a structured practice set weekly"],
      },
      {
        horizon: "Next 90 Days",
        items: ["Ship and document the flagship project", "Re-check whether depth still matches your priorities"],
      },
    ],
  };

  // --- Balanced Growth -----------------------------------------------------
  const balancedReadiness = clamp(
    0.3 * b.technical + 0.2 * b.breadthBase + 0.3 * effective(0.9) + 0.2 * b.quality,
  );
  const balanced: Scenario = {
    id: "balanced-growth",
    label: "Balanced Growth",
    type: "balanced",
    description: `Time is split across two or three areas relevant to ${goal}. Progress is steadier and less exposed to a single bet.`,
    focus: "Steady progress across several areas",
    metrics: {
      depth: clamp(b.technical * 0.42 + effective(0.7) * 0.35 + 6),
      breadth: clamp(b.breadthBase * 0.55 + 32),
      timeDemand: clamp(52 + (100 - b.capacity) * 0.15),
      flexibility: clamp(70 + b.variance * 4),
      projectFocus: clamp(b.quality * 0.45 + 22),
      readiness: balancedReadiness,
    },
    strengths: [
      "Lower exposure to one area not working out",
      "Easier to sustain alongside existing commitments",
      `Keeps ${priorityText(profile, "several priorities")} in play at once`,
    ],
    risks: [
      "Depth accumulates more slowly",
      "Can read as unfocused without a clear anchor project",
      "Context switching costs time",
    ],
    opportunities: [
      "More directions stay open as information arrives",
      "Complementary skills reinforce each other",
    ],
    tradeoffs: [
      "Peak depth in any single area is lower",
      "Requires deliberate weekly boundaries between areas",
    ],
    assumptions: [
      "Time is split roughly evenly between two or three areas",
      "No single area demands an urgent deadline",
      `Weekly availability stays near ${knobs.hoursPerWeek} hours`,
    ],
    uncertainty: uncertaintyOf(
      clamp(24 + (100 - b.discipline) * 0.25 * b.variance),
      balancedReadiness,
      [
        "Outcomes are less sensitive to any single variable",
        "Sustained split attention is the main modelling assumption",
      ],
    ),
    sensitivity: [],
    trajectory: [],
    weeklyAllocation: [
      { area: "Primary area", hours: round(knobs.hoursPerWeek * 0.4) },
      { area: "Secondary area", hours: round(knobs.hoursPerWeek * 0.3) },
      { area: "Projects & communication", hours: round(knobs.hoursPerWeek * 0.3) },
    ],
    milestones: [
      { window: "Week 1–2", title: "Foundation", focus: ["Pick two areas", "Set a weekly split"] },
      { window: "Week 3–6", title: "Execution", focus: ["Alternate focus blocks", "One small shipped artefact"] },
      { window: "Month 2", title: "Portfolio", focus: ["Combine areas in one project"] },
      { window: "Month 3", title: "Evaluation", focus: ["Decide where to concentrate next"] },
    ],
    nextActions: [
      {
        horizon: "This Week",
        items: ["Name your two focus areas for the horizon", "Draft a realistic weekly split"],
      },
      {
        horizon: "Next 30 Days",
        items: ["Finish one small project combining both areas", "Keep a short weekly progress note"],
      },
      {
        horizon: "Next 90 Days",
        items: ["Review which area produced more traction", "Rebalance the split once, deliberately"],
      },
    ],
  };

  // --- Exploration ---------------------------------------------------------
  const explorationReadiness = clamp(
    0.24 * b.technical + 0.26 * b.breadthBase + 0.28 * effective(0.75) + 0.22 * b.focus,
  );
  const exploration: Scenario = {
    id: "exploration",
    label: "Exploration",
    type: "exploration",
    description: `Several directions are sampled before committing, gathering information about what actually fits for ${goal}.`,
    focus: "Wide sampling before commitment",
    metrics: {
      depth: clamp(b.technical * 0.3 + 4),
      breadth: clamp(b.breadthBase * 0.5 + 46),
      timeDemand: clamp(58 + (100 - b.capacity) * 0.18),
      flexibility: clamp(84 + b.variance * 3),
      projectFocus: clamp(b.quality * 0.3 + 18),
      readiness: explorationReadiness,
    },
    strengths: [
      "Reduces the chance of committing to a poor fit",
      "Generates information you do not currently have",
      "Comfortable if your interests are still forming",
    ],
    risks: [
      "Visible depth may stay low through the horizon",
      "Widest outcome range of the three scenarios",
      "Risk of sampling without ever committing",
    ],
    opportunities: [
      "An unexpected direction may fit better than the obvious one",
      "Early failures are cheap at this stage",
    ],
    tradeoffs: [
      "Slower measurable progress in any one area",
      "Later commitment leaves less runway inside the horizon",
    ],
    assumptions: [
      "You commit to one direction before the horizon ends",
      "Sampling is time-boxed rather than open-ended",
      `Weekly availability stays near ${knobs.hoursPerWeek} hours`,
    ],
    uncertainty: uncertaintyOf(
      clamp(52 + (100 - b.discipline) * 0.3 * b.variance),
      explorationReadiness,
      [
        "Exploration carries the widest modelled range",
        "Outcome depends strongly on when you commit",
      ],
    ),
    sensitivity: [],
    trajectory: [],
    weeklyAllocation: [
      { area: "Sampling new areas", hours: round(knobs.hoursPerWeek * 0.45) },
      { area: "Small experiments", hours: round(knobs.hoursPerWeek * 0.35) },
      { area: "Conversations & research", hours: round(knobs.hoursPerWeek * 0.2) },
    ],
    milestones: [
      { window: "Week 1–2", title: "Foundation", focus: ["List 3–4 candidate directions"] },
      { window: "Week 3–6", title: "Execution", focus: ["One time-boxed experiment each"] },
      { window: "Month 2", title: "Portfolio", focus: ["Write up what you learned"] },
      { window: "Month 3", title: "Evaluation", focus: ["Commit to one direction"] },
    ],
    nextActions: [
      {
        horizon: "This Week",
        items: ["Write down 3–4 directions worth sampling", "Set an end date for the sampling phase"],
      },
      {
        horizon: "Next 30 Days",
        items: ["Run one small time-boxed experiment per direction", "Talk to one person in each area"],
      },
      {
        horizon: "Next 90 Days",
        items: ["Pick one direction and commit", "Convert learnings into a focused plan"],
      },
    ],
  };

  const start = clamp(0.5 * b.technical + 0.2 * b.breadthBase + 0.3 * b.quality * 0.6);

  return [depth, balanced, exploration].map((sc) => ({
    ...sc,
    metrics: {
      depth: round(sc.metrics.depth),
      breadth: round(sc.metrics.breadth),
      timeDemand: round(sc.metrics.timeDemand),
      flexibility: round(sc.metrics.flexibility),
      projectFocus: round(sc.metrics.projectFocus),
      readiness: round(sc.metrics.readiness),
    },
    trajectory: trajectory(profile, sc.metrics.readiness, start, b.variance),
    sensitivity: sensitivityFor(sc.type, knobs),
  }));
}

function sensitivityFor(
  type: Scenario["type"],
  knobs: SensitivityKnobs,
): Scenario["sensitivity"] {
  const weights = {
    depth: { hours: 34, consistency: 28, quality: 22, focus: 16 },
    balanced: { hours: 24, consistency: 26, quality: 26, focus: 24 },
    exploration: { hours: 22, consistency: 20, quality: 18, focus: 40 },
  }[type];

  return [
    {
      factor: "Hours available per week",
      impact: weights.hours,
      note: `Modelled at ${knobs.hoursPerWeek} h/week. Moving this changes the trajectory more than most inputs.`,
    },
    {
      factor: "Consistency",
      impact: weights.consistency,
      note: `Modelled at ${knobs.consistency}/100. Gaps compound over the horizon.`,
    },
    {
      factor: "Project quality",
      impact: weights.quality,
      note: "Fewer, deeper artefacts move this more than many shallow ones.",
    },
    {
      factor: "Learning focus",
      impact: weights.focus,
      note: "How narrowly attention is concentrated across the horizon.",
    },
  ];
}

function buildComparison(scenarios: Scenario[]): ComparisonRow[] {
  const dims: { dimension: string; key: keyof Scenario["metrics"]; kind: "band" | "score" }[] = [
    { dimension: "Technical depth", key: "depth", kind: "score" },
    { dimension: "Breadth", key: "breadth", kind: "score" },
    { dimension: "Time demand", key: "timeDemand", kind: "band" },
    { dimension: "Flexibility", key: "flexibility", kind: "band" },
    { dimension: "Project focus", key: "projectFocus", kind: "band" },
  ];

  const rows: ComparisonRow[] = dims.map(({ dimension, key, kind }) => ({
    dimension,
    values: scenarios.map((s) => {
      const value = s.metrics[key];
      return {
        scenarioId: s.id,
        value,
        display: kind === "band" ? band(value) : `${value}/100`,
      };
    }),
  }));

  rows.push({
    dimension: "Uncertainty",
    values: scenarios.map((s) => ({
      scenarioId: s.id,
      value: s.uncertainty.score,
      display: s.uncertainty.level,
    })),
  });

  return rows;
}

function band(value: number): string {
  if (value >= 70) return "High";
  if (value >= 45) return "Medium";
  return "Low";
}

function buildInsights(profile: UserProfile, scenarios: Scenario[]): SimulationInsights {
  const [depth, balanced, exploration] = scenarios;
  const hours = profile.currentState.hoursPerWeek;
  const goal = profile.specificGoal || "your decision";

  return {
    summary: `Under the current assumptions — about ${hours} hours a week, consistency at ${profile.consistency}/100 and a ${profile.riskPreference.replace("-", " ")} risk preference — the three modelled paths for ${goal} differ mainly in how concentrated your attention is, not in how hard you work. Depth buys signal in one area; balance buys resilience; exploration buys information.`,
    whyTheyDiffer: [
      `Technical Depth concentrates roughly ${Math.round(hours * 0.8)} of your weekly hours into one track, so modelled depth reaches ${depth.metrics.depth}/100 while breadth stays at ${depth.metrics.breadth}/100.`,
      `Balanced Growth splits the same hours, which lowers peak depth to ${balanced.metrics.depth}/100 but raises flexibility to ${balanced.metrics.flexibility}/100.`,
      `Exploration spends part of the horizon gathering information, which is why its modelled range is the widest (${exploration.uncertainty.range[0]}–${exploration.uncertainty.range[1]}).`,
    ],
    keyTradeoffs: [
      "One important trade-off is depth versus optionality: the paths that show the strongest single-area signal are also the hardest to change direction from.",
      `Another is sustainability: Technical Depth is modelled at ${depth.metrics.timeDemand}/100 time demand against ${balanced.metrics.timeDemand}/100 for Balanced Growth.`,
      profile.tradeoffs.length
        ? `You indicated you are willing to trade off ${profile.tradeoffs.join(", ").toLowerCase()} — the depth-heavy paths rely on that most.`
        : "You did not mark anything as tradeable, which makes the lower-time-demand paths more plausible.",
    ],
    risks: [
      "The model is sensitive to weekly time; a sustained drop makes every trajectory flatten.",
      profile.constraints.length
        ? `Your stated constraints (${profile.constraints.join(", ").toLowerCase()}) reduce effective capacity in all three scenarios.`
        : "No constraints were listed, so capacity is modelled at face value — worth revisiting if that is optimistic.",
      "Exploration only pays off if it ends in a commitment inside the horizon.",
    ],
    opportunities: [
      "A single well-documented artefact raises the modelled project-focus input across every scenario.",
      "Small increases in consistency are usually cheaper than adding more hours.",
      profile.priorities.length
        ? `Your priorities (${profile.priorities.slice(0, 3).join(", ")}) can be pursued in more than one of these paths.`
        : "Naming two or three priorities would sharpen the modelled differences.",
    ],
    assumptions: [
      `Weekly availability of about ${hours} hours holds across the ${profile.timeline} horizon.`,
      `Consistency stays near ${profile.consistency}/100.`,
      "Your current skill self-assessment is approximately accurate.",
      "No major external change (relocation, health, financial shift) occurs mid-horizon.",
    ],
    whatCouldChange: [
      `Moving weekly availability from ${hours} to ${hours + 7} hours meaningfully shifts the modelled trajectories, especially Technical Depth.`,
      "Raising consistency by 15 points changes the outcome range more than raising skill inputs by the same amount.",
      "Choosing to commit earlier narrows the Exploration range considerably.",
      "Any change in your stated priorities changes which trade-offs matter, not the mechanics of the model.",
    ],
  };
}

export function runSimulation(profile: UserProfile, knobs?: SensitivityKnobs): Simulation {
  const effectiveKnobs = knobs ?? knobsFromProfile(profile);
  const scenarios = buildScenarios(profile, effectiveKnobs);

  return {
    id: `sim_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    profile,
    decision: {
      label: profile.specificGoal || "Your decision",
      horizon: profile.timeline,
    },
    scenarios,
    comparison: buildComparison(scenarios),
    differences: [
      "All three paths start from the same current state; they differ in how your available hours are allocated.",
      "None of these is a recommended or optimal path — they are trade-off profiles under stated assumptions.",
      "Each modelled range widens with the horizon because assumptions become less reliable over time.",
    ],
    insights: buildInsights(profile, scenarios),
    mode: "demo",
  };
}

/** Re-run the engine with sensitivity knobs, keeping the same profile. */
export function resimulate(profile: UserProfile, knobs: SensitivityKnobs): Simulation {
  return runSimulation(profile, knobs);
}

export const DEMO_PROFILE: UserProfile = {
  goal: "career",
  specificGoal: "Internship preparation",
  timeline: "6 months",
  currentState: {
    stage: "3rd year",
    academic: "8.1 CGPA",
    projects: 2,
    experience: "Personal projects only",
    hoursPerWeek: 12,
  },
  skills: {
    dsa: 62,
    programming: 70,
    ml: 45,
    development: 58,
    communication: 55,
    research: 40,
    leadership: 42,
    business: 35,
  },
  priorities: ["Internship", "Technical Skills", "Projects"],
  tradeoffs: ["Entertainment", "Social time"],
  consistency: 65,
  riskPreference: "balanced",
  constraints: ["College workload", "Exams"],
  notes: "",
};
