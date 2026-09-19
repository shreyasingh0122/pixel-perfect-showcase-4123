export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, digits = 0): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

export function bandLabel(value: number): string {
  if (value >= 75) return "High";
  if (value >= 45) return "Medium";
  return "Low";
}

export function dots(value: number): string {
  const filled = Math.max(1, Math.min(3, Math.round(value / 34) + (value >= 75 ? 1 : 0)));
  return "●".repeat(Math.min(3, filled)) + "○".repeat(Math.max(0, 3 - Math.min(3, filled)));
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function slug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
