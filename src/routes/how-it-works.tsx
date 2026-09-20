import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, SlidersHorizontal, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — FutureLens" },
      {
        name: "description",
        content:
          "How FutureLens turns your goals, skills, constraints and risk preference into three model-based scenario paths with trajectories and uncertainty ranges.",
      },
      { property: "og:title", content: "How It Works — FutureLens" },
      {
        property: "og:description",
        content:
          "The model behind FutureLens: inputs, three scenario paths, trajectories, uncertainty and sensitivity — explorations, never predictions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorksPage,
});

const SECTIONS = [
  {
    icon: Compass,
    step: "Step 1",
    title: "You describe the decision",
    body: [
      "Every simulation starts with a goal — a career move, a startup idea, a sustainability shift, an education path — plus a timeline ranging from three months to three-plus years.",
      "You then sketch your current state: where you are in your journey, how many projects you've shipped, your experience level and how many focused hours per week you can realistically give.",
    ],
  },
  {
    icon: SlidersHorizontal,
    step: "Step 2",
    title: "You map skills, priorities and constraints",
    body: [
      "Eight skill sliders capture your self-assessed starting point. Priorities, trade-offs and constraints shape what the model treats as feasible — a path that requires 25 focused hours a week is not a path for someone with 8.",
      "Your consistency estimate and risk preference set the width of the modelled outcome ranges. Lower consistency or a higher-growth appetite widens the band; steady inputs narrow it.",
    ],
  },
  {
    icon: GitBranch,
    step: "Step 3",
    title: "We model three scenario paths",
    body: [
      "Technical Depth concentrates most available time in one track. Balanced Growth splits it across two or three areas. Exploration samples several directions before committing.",
      "Each path gets a readiness trajectory across your horizon, an uncertainty range, sensitivity factors, a weekly time allocation, milestones and concrete next moves. The model never ranks the paths or picks a winner — that judgement is yours.",
    ],
  },
];

function HowItWorksPage() {
  return (
    <div className="bg-aurora">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">
          How it works
        </p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
          Scenarios built on <span className="text-gradient">explicit assumptions</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          FutureLens is a deterministic model — the same inputs always produce the same scenarios.
          Nothing is random, nothing is scraped, and nothing is presented as a prediction. Here is
          exactly how a simulation is built.
        </p>

        <div className="mt-14 space-y-6">
          {SECTIONS.map((s) => (
            <section key={s.title} className="glass rounded-2xl p-7 sm:p-9">
              <div className="flex items-center gap-4">
                <span className="glass-strong inline-flex h-12 w-12 items-center justify-center rounded-xl text-electric">
                  <s.icon size={22} />
                </span>
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {s.step}
                  </p>
                  <h2 className="mt-0.5 text-xl font-semibold sm:text-2xl">{s.title}</h2>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {s.body.map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="glass-strong mt-6 rounded-2xl border border-warm/30 p-7 sm:p-9">
          <h2 className="text-xl font-semibold sm:text-2xl">What FutureLens is not</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>Not a prediction, promise or probability of success.</li>
            <li>Not personalised advice from a counsellor, investor or employer.</li>
            <li>Not a ranking — the model deliberately never declares a winning path.</li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Scenarios are structured explorations of what each path tends to involve. Use them to
            ask better questions, not to skip making the decision.
          </p>
        </section>

        <div className="mt-12 text-center">
          <Button asChild variant="hero" size="lg" className="px-8">
            <Link to="/simulator">
              Try the simulator <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
