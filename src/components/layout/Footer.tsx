import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/70">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm leading-relaxed text-muted-foreground">
            FutureLens builds model-based scenarios from your own inputs. Scenarios are
            explorations of possible outcomes, never predictions or guarantees.
          </p>
        </div>
        <nav aria-label="Footer" className="flex gap-12 text-sm">
          <ul className="space-y-2">
            <li className="font-medium text-foreground">Product</li>
            <li>
              <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground">
                How It Works
              </Link>
            </li>
            <li>
              <Link to="/simulator" className="text-muted-foreground hover:text-foreground">
                Simulator
              </Link>
            </li>
            <li>
              <Link to="/scenarios" className="text-muted-foreground hover:text-foreground">
                Scenarios
              </Link>
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="font-medium text-foreground">Explore</li>
            <li>
              <Link to="/insights" className="text-muted-foreground hover:text-foreground">
                Insights
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border/70 px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">
        Demo simulation — connect your simulation engine for personalised modelling.
      </div>
    </footer>
  );
}
