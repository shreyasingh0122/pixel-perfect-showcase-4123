import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/Logo";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — FutureLens" },
      { name: "description", content: "Create your FutureLens account to save simulations and strategy plans." },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name } },
      });
      if (signUpError) throw signUpError;

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          display_name: name,
          onboarded: false,
        });
      }

      toast("Account created! Let's set up your profile.");
      navigate({ to: "/onboarding" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign up failed. Please try again.";
      setError(msg);
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
          <h1 className="mt-6 text-2xl font-bold text-foreground">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Save your simulations, track your strategy, and revisit your futures anytime.
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
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
            {loading ? "Creating account…" : "Create Account"}
            {!loading && <ArrowRight size={16} />}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/signin" className="font-medium text-foreground hover:underline">
            Sign in
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
