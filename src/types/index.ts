export type GoalKey = "career" | "startup" | "sustainability" | "education" | "other";

export type RiskPreference = "conservative" | "balanced" | "high-growth";

export type SkillKey =
  | "dsa"
  | "programming"
  | "ml"
  | "development"
  | "communication"
  | "research"
  | "leadership"
  | "business";

export type Skills = Record<SkillKey, number>;

export interface CurrentState {
  stage: string;
  academic: string;
  projects: number;
  experience: string;
  hoursPerWeek: number;
}

export interface UserProfile {
  goal: GoalKey;
  specificGoal: string;
  timeline: string;
  currentState: CurrentState;
  skills: Skills;
  priorities: string[];
  tradeoffs: string[];
  consistency: number;
  riskPreference: RiskPreference;
  constraints: string[];
  notes: string;
}

export interface ScenarioMetrics {
  depth: number;
  breadth: number;
  timeDemand: number;
  flexibility: number;
  projectFocus: number;
  readiness: number;
}

export interface TrajectoryPoint {
  label: string;
  readiness: number;
  low: number;
  high: number;
}

export interface Uncertainty {
  level: "Low" | "Moderate" | "High";
  score: number;
  range: [number, number];
  notes: string[];
}

export interface SensitivityFactor {
  factor: string;
  impact: number;
  note: string;
}

export interface MilestonePhase {
  window: string;
  title: string;
  focus: string[];
}

export interface Scenario {
  id: string;
  label: string;
  type: "depth" | "balanced" | "exploration";
  description: string;
  focus: string;
  metrics: ScenarioMetrics;
  strengths: string[];
  risks: string[];
  opportunities: string[];
  tradeoffs: string[];
  assumptions: string[];
  uncertainty: Uncertainty;
  sensitivity: SensitivityFactor[];
  trajectory: TrajectoryPoint[];
  weeklyAllocation: { area: string; hours: number }[];
  milestones: MilestonePhase[];
  nextActions: { horizon: "This Week" | "Next 30 Days" | "Next 90 Days"; items: string[] }[];
}

export interface ComparisonRow {
  dimension: string;
  values: { scenarioId: string; value: number; display: string }[];
}

export interface Simulation {
  id: string;
  createdAt: string;
  profile: UserProfile;
  decision: { label: string; horizon: string };
  scenarios: Scenario[];
  comparison: ComparisonRow[];
  differences: string[];
  insights: SimulationInsights;
  mode: "demo";
}

export interface SimulationInsights {
  summary: string;
  whyTheyDiffer: string[];
  keyTradeoffs: string[];
  risks: string[];
  opportunities: string[];
  assumptions: string[];
  whatCouldChange: string[];
}

export interface SensitivityKnobs {
  hoursPerWeek: number;
  consistency: number;
  projectQuality: number;
  learningFocus: number;
  riskPreference: RiskPreference;
}
