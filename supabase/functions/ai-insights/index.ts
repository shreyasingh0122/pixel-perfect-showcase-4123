const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ScenarioInput {
  id: string;
  label: string;
  type: string;
  description: string;
  metrics: {
    depth: number;
    breadth: number;
    timeDemand: number;
    flexibility: number;
    readiness: number;
  };
  uncertainty: { level: string; score: number; range: [number, number] };
  tradeoffs: string[];
  assumptions: string[];
}

interface SimulationInput {
  decision: { label: string; horizon: string };
  scenarios: ScenarioInput[];
  insights: {
    summary: string;
    whyTheyDiffer: string[];
    keyTradeoffs: string[];
    risks: string[];
    opportunities: string[];
    assumptions: string[];
    whatCouldChange: string[];
  };
  profile: {
    goal: string;
    specificGoal: string;
    timeline: string;
    currentState: { hoursPerWeek: number };
    consistency: number;
    riskPreference: string;
    priorities: string[];
    tradeoffs: string[];
    constraints: string[];
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const simulation = (await req.json()) as SimulationInput;

    const analysis = simulation.scenarios.map((s) => {
      const dominantFactor =
        s.uncertainty.score > 50
          ? "uncertainty"
          : s.metrics.timeDemand > 65
            ? "time demand"
            : "skill concentration";

      return {
        id: s.id,
        explanation: `${s.label} concentrates effort ${s.type === "depth" ? "deeply in one track" : s.type === "balanced" ? "across two or three areas" : "broadly before committing"}. Under the stated assumptions, modelled readiness reaches ${s.metrics.readiness}/100 with ${s.uncertainty.level.toLowerCase()} uncertainty (range ${s.uncertainty.range[0]}–${s.uncertainty.range[1]}). The dominant driver is ${dominantFactor}.`,
        strengths: s.tradeoffs.length > 0 ? [s.tradeoffs[0]] : [],
        risks:
          s.metrics.timeDemand > 65
            ? ["High weekly time demand makes this path sensitive to consistency drops."]
            : ["Outcome depends on sustained split attention."],
        tradeoffs: s.tradeoffs.slice(0, 2),
      };
    });

    const result = {
      summary: `For ${simulation.decision.label} over ${simulation.decision.horizon}, the three modelled paths differ mainly in how concentrated your attention is. ${simulation.insights.summary}`,
      scenarioAnalysis: analysis,
      keyTradeoffs: simulation.insights.keyTradeoffs.slice(0, 3),
      risks: simulation.insights.risks.slice(0, 3),
      opportunities: simulation.insights.opportunities.slice(0, 3),
      assumptions: simulation.insights.assumptions.slice(0, 4),
      sensitivityFactors: simulation.insights.whatCouldChange.slice(0, 3),
      nextActions: simulation.scenarios.flatMap((s) =>
        s.assumptions.slice(0, 1).map((a) => `Verify: ${a}`),
      ),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
// force redeploy
