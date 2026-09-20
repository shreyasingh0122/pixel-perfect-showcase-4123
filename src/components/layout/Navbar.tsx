import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const PUBLIC_NAV = [
  { to: "/how-it-works", label: "How It Works" },
  { to: "/simulator", label: "Simulator" },
  { to: "/scenarios", label: "Scenarios" },
] as const;

const APP_NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/simulator", label: "New Simulation" },
  { to: "/history", label: "History" },
  { to: "/strategy", label: "Strategy" },
] as const;

export function Navbar() {
  const { user, displayName, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const nav = user ? APP_NAV : PUBLIC_NAV;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "glass-strong border-b" : "border-b border-transparent",
      )}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6"
      >
        <Link to="/" aria-label="FutureLens home" className="rounded-md">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "text-foreground bg-secondary" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <UserIcon size={16} aria-hidden />
                <span className="max-w-24 truncate">{displayName || user.email}</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button asChild variant="hero" size="sm">
                <Link to="/signup">Start Exploring</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {open && (
        <div id="mobile-nav" className="glass-strong border-t px-4 pb-5 pt-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {nav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="block rounded-lg px-3 py-3 text-base text-muted-foreground hover:bg-secondary hover:text-foreground"
                  activeProps={{ className: "text-foreground bg-secondary" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <>
                <Button asChild variant="hero" className="w-full">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="hero" className="w-full">
                  <Link to="/signup">Start Exploring</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/signin">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
