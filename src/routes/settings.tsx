import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { LogOut, Bell, Shield, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — FutureLens" },
      { name: "description", content: "Manage your FutureLens settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/signin" });
  }, [user, authLoading, navigate]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Settings</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Settings</h1>
      </header>

      <div className="glass mt-8 space-y-6 rounded-2xl border border-border p-6">
        <section>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-muted-foreground" aria-hidden />
            <h2 className="text-base font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="strategy-reminders">Strategy reminders</Label>
              <Switch
                id="strategy-reminders"
                defaultChecked
                aria-label="Strategy reminders"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="weekly-digest">Weekly progress digest</Label>
              <Switch id="weekly-digest" aria-label="Weekly progress digest" />
            </div>
          </div>
        </section>

        <hr className="border-border" />

        <section>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" aria-hidden />
            <h2 className="text-base font-semibold text-foreground">Security</h2>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Change password</p>
                <p className="text-xs text-muted-foreground">Update your account password</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/forgot-password">Reset</Link>
              </Button>
            </div>
          </div>
        </section>

        <hr className="border-border" />

        <section>
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-muted-foreground" aria-hidden />
            <h2 className="text-base font-semibold text-foreground">Appearance</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            FutureLens uses a dark premium theme. Light mode is not yet available.
          </p>
        </section>

        <hr className="border-border" />

        <section>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Sign out</p>
              <p className="text-xs text-muted-foreground">End your current session</p>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                toast("Signed out.");
                navigate({ to: "/" });
              }}
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
