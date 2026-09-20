import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Check .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          onboarded: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          onboarded?: boolean;
        };
        Update: {
          display_name?: string;
          onboarded?: boolean;
        };
      };
      simulations: {
        Row: {
          id: string;
          user_id: string;
          decision_label: string;
          horizon: string;
          profile_data: Record<string, unknown>;
          simulation_data: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          decision_label: string;
          horizon: string;
          profile_data: Record<string, unknown>;
          simulation_data: Record<string, unknown>;
        };
        Update: {
          decision_label?: string;
          horizon?: string;
          profile_data?: Record<string, unknown>;
          simulation_data?: Record<string, unknown>;
        };
      };
      strategy_actions: {
        Row: {
          id: string;
          user_id: string;
          simulation_id: string;
          horizon: string;
          title: string;
          description: string;
          priority: string;
          effort: string;
          completed: boolean;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          simulation_id: string;
          horizon: string;
          title: string;
          description?: string;
          priority?: string;
          effort?: string;
          completed?: boolean;
          source?: string;
        };
        Update: {
          title?: string;
          description?: string;
          priority?: string;
          effort?: string;
          completed?: boolean;
        };
      };
    };
  };
};
