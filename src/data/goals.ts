import type { GoalKey, SkillKey } from "@/types";

export const GOALS: {
  key: GoalKey;
  label: string;
  blurb: string;
  examples: string[];
}[] = [
  {
    key: "career",
    label: "Career",
    blurb: "Internships, roles, specialisation and skill direction.",
    examples: [
      "Internship preparation",
      "Software engineering",
      "Data science",
      "AI / ML",
      "Higher studies",
      "Competitive programming",
    ],
  },
  {
    key: "startup",
    label: "Startup",
    blurb: "Validating, launching or scaling something of your own.",
    examples: [
      "Validate idea",
      "Launch product",
      "Grow existing startup",
      "Raise funding",
      "Market expansion",
    ],
  },
  {
    key: "sustainability",
    label: "Sustainability",
    blurb: "Lower-impact choices for a life, product or organisation.",
    examples: [
      "Reduce emissions",
      "Sustainable lifestyle",
      "Business sustainability",
      "Energy transition",
    ],
  },
  {
    key: "education",
    label: "Education",
    blurb: "Study paths, specialisations and structured learning.",
    examples: [
      "Choose specialisation",
      "Postgraduate studies",
      "Skill development",
      "Certification",
    ],
  },
  {
    key: "other",
    label: "Other",
    blurb: "Any decision with several plausible paths ahead.",
    examples: ["Relocation", "Career switch", "Side project vs. job", "Long-term saving"],
  },
];

export const TIMELINES = ["3 months", "6 months", "1 year", "2 years", "3+ years"];

export const SKILLS: { key: SkillKey; label: string }[] = [
  { key: "dsa", label: "DSA" },
  { key: "programming", label: "Programming" },
  { key: "ml", label: "Machine Learning" },
  { key: "development", label: "Development" },
  { key: "communication", label: "Communication" },
  { key: "research", label: "Research" },
  { key: "leadership", label: "Leadership" },
  { key: "business", label: "Business" },
];

export const PRIORITIES = [
  "Internship",
  "Technical Skills",
  "Projects",
  "Research",
  "Higher Studies",
  "Competitive Programming",
  "Entrepreneurship",
  "Income",
  "Work-Life Balance",
  "Impact",
  "Learning",
];

export const TRADEOFFS = [
  "Social time",
  "Entertainment",
  "Coursework",
  "Sleep / free time",
  "Other goals",
  "Nothing",
];

export const CONSTRAINTS = [
  "Limited time",
  "College workload",
  "Exams",
  "Limited budget",
  "Weak foundation",
  "No experience",
  "Health / family commitments",
  "Other",
];

export const STAGES = [
  "School student",
  "1st year",
  "2nd year",
  "3rd year",
  "Final year",
  "Graduate",
  "Working professional",
  "Founder",
];

export const EXPERIENCE_LEVELS = [
  "No experience yet",
  "Personal projects only",
  "One internship",
  "Multiple internships",
  "1–3 years professional",
  "3+ years professional",
];

export const RISK_OPTIONS = [
  {
    key: "conservative" as const,
    label: "Conservative",
    blurb: "Prefer steady, lower-variance paths.",
  },
  {
    key: "balanced" as const,
    label: "Balanced",
    blurb: "Accept some variance for more upside.",
  },
  {
    key: "high-growth" as const,
    label: "High Growth",
    blurb: "Comfortable with wide outcome ranges.",
  },
];

export function skillLabel(value: number): string {
  if (value >= 85) return "Advanced";
  if (value >= 70) return "Strong foundation";
  if (value >= 50) return "Working knowledge";
  if (value >= 30) return "Early stage";
  return "Just starting";
}

export function consistencyLabel(value: number): string {
  if (value >= 85) return "Very consistent — plans usually hold";
  if (value >= 65) return "Mostly consistent with occasional gaps";
  if (value >= 45) return "Variable — depends on the week";
  if (value >= 25) return "Often interrupted by other commitments";
  return "Rarely able to follow a fixed plan";
}
