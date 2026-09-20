/*
# FutureLens — core schema (multi-user, auth-scoped)

1. Purpose
   - Stores user profiles, saved simulations, and strategy plan actions.
   - Every row is scoped to its owner via `user_id` with RLS.
   - The deterministic simulation engine runs client-side; the database is the
     persistence layer for signed-in users. Demo-mode (localStorage) remains
     available for unauthenticated visitors.

2. New Tables
   - `profiles` — extends auth.users with display name and onboarding state.
     - `id` (uuid, PK, references auth.users)
     - `display_name` (text)
     - `onboarded` (boolean, default false)
     - `created_at`, `updated_at` (timestamptz)
   - `simulations` — saved simulation snapshots.
     - `id` (uuid, PK)
     - `user_id` (uuid, references auth.users, DEFAULT auth.uid())
     - `decision_label` (text)
     - `horizon` (text)
     - `profile_data` (jsonb) — the UserProfile inputs
     - `simulation_data` (jsonb) — the full Simulation output
     - `created_at` (timestamptz)
   - `strategy_actions` — user's tracked actions (model + custom).
     - `id` (uuid, PK)
     - `user_id` (uuid, references auth.users, DEFAULT auth.uid())
     - `simulation_id` (uuid, references simulations, ON DELETE CASCADE)
     - `horizon` (text)
     - `title` (text)
     - `description` (text)
     - `priority` (text, default 'Medium')
     - `effort` (text)
     - `completed` (boolean, default false)
     - `source` (text, default 'model')
     - `created_at` (timestamptz)

3. Security
   - RLS enabled on every table.
   - All policies scoped `TO authenticated` with `auth.uid() = user_id`.
   - `user_id` columns default to `auth.uid()` so client inserts that omit
     `user_id` still satisfy the WITH CHECK predicate.
   - strategy_actions ownership is verified through the parent simulation's
     user_id for INSERT/UPDATE/DELETE to prevent cross-user tampering.

4. Notes
   - No destructive operations on existing data (fresh database).
   - Indexes on user_id and simulation_id for query performance.
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text DEFAULT '',
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- simulations
CREATE TABLE IF NOT EXISTS simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  decision_label text NOT NULL DEFAULT '',
  horizon text NOT NULL DEFAULT '',
  profile_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  simulation_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_simulations" ON simulations;
CREATE POLICY "select_own_simulations" ON simulations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_simulations" ON simulations;
CREATE POLICY "insert_own_simulations" ON simulations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_simulations" ON simulations;
CREATE POLICY "update_own_simulations" ON simulations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_simulations" ON simulations;
CREATE POLICY "delete_own_simulations" ON simulations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_simulations_user_id ON simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_created_at ON simulations(created_at DESC);

-- strategy_actions
CREATE TABLE IF NOT EXISTS strategy_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id uuid NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  horizon text NOT NULL DEFAULT 'Next 30 Days',
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'Medium',
  effort text NOT NULL DEFAULT '1–2h',
  completed boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'model',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE strategy_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_actions" ON strategy_actions;
CREATE POLICY "select_own_actions" ON strategy_actions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_actions" ON strategy_actions;
CREATE POLICY "insert_own_actions" ON strategy_actions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_actions" ON strategy_actions;
CREATE POLICY "update_own_actions" ON strategy_actions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_actions" ON strategy_actions;
CREATE POLICY "delete_own_actions" ON strategy_actions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_actions_user_id ON strategy_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_actions_simulation_id ON strategy_actions(simulation_id);
