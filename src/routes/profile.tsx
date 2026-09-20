import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — FutureLens" },
      { name: "description", content: "View and edit your FutureLens profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, displayName, refreshProfile, authLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(displayName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/signin" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    setName(displayName);
  }, [displayName]);

  if (!user) return null;

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user!.id, display_name: name });
      if (error) throw error;
      await refreshProfile();
      toast("Profile updated.");
    } catch {
      toast("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Profile</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Your profile</h1>
      </header>

      <div className="glass mt-8 space-y-6 rounded-2xl border border-border p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Display name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user.email ?? ""} disabled />
          <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="hero" onClick={handleSave} disabled={saving}>
            <Save size={16} />
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <ArrowLeft size={16} />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
