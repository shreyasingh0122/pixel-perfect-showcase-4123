import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  displayName: string;
  isOnboarded: boolean;
  refreshProfile: () => Promise<void>;
  setOnboarded: (v: boolean) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [isOnboarded, setIsOnboarded] = useState(false);

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, onboarded")
      .eq("id", userId)
      .maybeSingle();
    if (data) {
      setDisplayName(data.display_name ?? "");
      setIsOnboarded(data.onboarded ?? false);
    } else {
      setDisplayName("");
      setIsOnboarded(false);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        loadProfile(data.session.user.id);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        setSession(newSession);
        if (newSession?.user) {
          await loadProfile(newSession.user.id);
        } else {
          setDisplayName("");
          setIsOnboarded(false);
        }
      })();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (session?.user) await loadProfile(session.user.id);
  };

  const setOnboarded = async (v: boolean) => {
    if (!session?.user) return;
    await supabase
      .from("profiles")
      .upsert({ id: session.user.id, onboarded: v })
      .eq("id", session.user.id);
    setIsOnboarded(v);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setDisplayName("");
    setIsOnboarded(false);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        displayName,
        isOnboarded,
        refreshProfile,
        setOnboarded,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
