export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="shrink-0"
        fill="none"
      >
        <defs>
          <linearGradient id="fl-logo" x1="0" y1="0" x2="32" y2="32">
            <stop offset="0%" stopColor="oklch(0.66 0.2 295)" />
            <stop offset="60%" stopColor="oklch(0.68 0.17 258)" />
            <stop offset="100%" stopColor="oklch(0.8 0.13 200)" />
          </linearGradient>
        </defs>
        <circle cx="13" cy="16" r="8.5" stroke="url(#fl-logo)" strokeWidth="1.8" />
        <circle cx="13" cy="16" r="3" fill="url(#fl-logo)" opacity="0.85" />
        <path
          d="M21 16h4M25 16l4-5M25 16l4 5"
          stroke="url(#fl-logo)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-display text-[1.05rem] font-semibold tracking-tight">FutureLens</span>
    </span>
  );
}
