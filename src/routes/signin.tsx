import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/Logo";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign In — FutureLens" },
      { name: "description", content: "Sign in to your FutureLens account." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    navigate({ to: "/dashboard" });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      toast("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-aurora flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <Logo />
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your saved simulations and strategy plans.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass space-y-5 rounded-2xl border border-border p-6">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
            {!loading && <ArrowRight size={16} />}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <Link to="/forgot-password" className="hover:text-foreground">
              Forgot your password?
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-foreground hover:underline">
            Create one
          </Link>
        </p>

        <p className="mt-4 text-center">
          <Link to="/simulator" className="text-xs text-muted-foreground hover:text-foreground">
            Or try the demo without an account
          </Link>
        </p>
      </div>
    </div>
  );
}
