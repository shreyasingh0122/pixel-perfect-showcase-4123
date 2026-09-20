import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/Logo";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — FutureLens" },
      { name: "description", content: "Reset your FutureLens account password." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      if (resetError) throw resetError;
      setSent(true);
      toast("Password reset link sent. Check your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email.");
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
          <h1 className="mt-6 text-2xl font-bold text-foreground">Reset your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {sent ? (
          <div className="glass rounded-2xl border border-border p-6 text-center">
            <Mail className="mx-auto h-10 w-10 text-violet" aria-hidden />
            <p className="mt-4 text-sm text-muted-foreground">
              If an account exists for {email}, a reset link has been sent. Check your email and
              follow the instructions.
            </p>
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link to="/signin">Back to sign in</Link>
            </Button>
          </div>
        ) : (
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send Reset Link"}
              {!loading && <ArrowRight size={16} />}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Link to="/signin" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
