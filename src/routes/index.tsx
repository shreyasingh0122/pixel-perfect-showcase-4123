import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  GitBranch,
  SlidersHorizontal,
  Compass,
  LineChart,
  ListChecks,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FutureLens — Explore Your Possible Futures" },
      {
        name: "description",
        content:
          "FutureLens turns your goals, skills and constraints into three model-based future scenarios — Technical Depth, Balanced Growth and Exploration — so you can compare paths before you commit.",
      },
      { property: "og:title", content: "FutureLens — Explore Your Possible Futures" },
      {
        property: "og:description",
        content:
          "Model-based scenarios for career, startup, sustainability and education decisions. Explorations, never predictions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const STEPS = [
  {
    icon: Compass,
    title: "Describe your decision",
    text: "Pick a goal — career, startup, sustainability, education — set a timeline and tell us where you stand today.",
  },
  {
    icon: SlidersHorizontal,
    title: "Map skills and constraints",
    text: "Rate your current skills, weekly hours and consistency. Name your priorities, trade-offs and constraints.",
  },
  {
    icon: GitBranch,
    title: "Explore three futures",
    text: "We model three scenario paths — Technical Depth, Balanced Growth and Exploration — with trajectories, uncertainty and trade-offs.",
  },
];

const FEATURES = [
  {
    icon: LineChart,
    title: "Trajectory modelling",
    text: "See how each path's readiness evolves across your horizon, with a modelled range instead of a false point estimate.",
  },
  {
    icon: GitBranch,
    title: "Interactive future tree",
    text: "One decision, three branches. Select any branch to inspect its assumptions, sensitivity and milestones.",
  },
  {
    icon: ListChecks,
    title: "Concrete next moves",
    text: "Every scenario ends with actions for this week, the next 30 days and the next 90 days — trackable right in the app.",
  },
  {
    icon: ShieldAlert,
    title: "Honest uncertainty",
    text: "Scenarios show assumptions, sensitivity factors and what would change the outcome. Explorations, never predictions.",
  },
];

function LandingPage() {
  return (
    <div className="bg-aurora">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-20 pt-20 text-center sm:px-6 md:pt-28">
          <span className="rise-in glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden="true" />
            Model-based scenario exploration
          </span>
          <h1
            className="rise-in mt-6 max-w-3xl text-4xl font-bold leading-[1.08] sm:text-5xl md:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            See your possible futures <span className="text-gradient">before you commit</span>
          </h1>
          <p
            className="rise-in mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            FutureLens turns your goals, skills and constraints into three modelled scenario
            paths — each with trajectories, uncertainty ranges, trade-offs and concrete next
            moves. Compare the paths, then choose with your eyes open.
          </p>
          <div
            className="rise-in mt-9 flex flex-col items-center gap-3 sm:flex-row"
            style={{ animationDelay: "240ms" }}
          >
            <Button asChild variant="hero" size="lg" className="px-7">
              <Link to="/simulator">
                Start a simulation <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-7">
              <Link to="/how-it-works">How it works</Link>
            </Button>
          </div>

          {/* Scenario preview cards */}
          <div
            className="rise-in mt-16 grid w-full max-w-4xl gap-4 sm:grid-cols-3"
            style={{ animationDelay: "320ms" }}
          >
            {[
              {
                label: "Technical Depth",
                text: "Concentrate most hours in one track. Depth compounds; breadth waits.",
                tint: "border-violet/40",
              },
              {
                label: "Balanced Growth",
                text: "Split time across two or three areas. Steadier, more resilient progress.",
                tint: "border-electric/40",
              },
              {
                label: "Exploration",
                text: "Sample several directions before committing. Buys information, costs time.",
                tint: "border-cyan/40",
              },
            ].map((c) => (
              <div
                key={c.label}
                className={`glass float-slow rounded-2xl border ${c.tint} p-5 text-left`}
              >
                <p className="font-display text-sm font-semibold">{c.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">
            The process
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Three steps to three futures</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="glass rounded-2xl p-6 elevated">
              <div className="flex items-center justify-between">
                <span className="glass-strong inline-flex h-11 w-11 items-center justify-center rounded-xl text-electric">
                  <s.icon size={20} />
                </span>
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="glass-strong rounded-3xl p-8 sm:p-12">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-electric">
              What you get
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Not a prediction. A map of possibilities.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              FutureLens never tells you what will happen. It shows what each path tends to look
              like under explicit assumptions — and what would change the picture.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4">
                <span className="glass inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-violet">
                  <f.icon size={20} />
                </span>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="glow-ring relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 text-center sm:px-12">
          <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative">
            <h2 className="mx-auto max-w-xl text-3xl font-bold sm:text-4xl">
              Your next decision deserves more than a guess
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground sm:text-base">
              Five minutes of honest inputs. Three modelled futures. Zero sign-up required — your
              work stays in this browser.
            </p>
            <Button asChild variant="hero" size="lg" className="mt-8 px-8">
              <Link to="/simulator">
                Explore my futures <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
