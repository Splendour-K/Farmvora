/*
  # Remove Duplicate RLS Policies
  
  Consolidate multiple permissive policies into single comprehensive policies.
*/

-- PROJECT QUESTIONS - Remove duplicates, keep one comprehensive policy
DROP POLICY IF EXISTS "Users can create questions" ON project_questions;
DROP POLICY IF EXISTS "Users can ask questions" ON project_questions;
DROP POLICY IF EXISTS "Users can view own questions" ON project_questions;
DROP POLICY IF EXISTS "Admins can answer questions" ON project_questions;

CREATE POLICY "Users can create questions"
  ON project_questions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can view questions"
  ON project_questions FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id OR
    status = 'approved' OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can answer questions"
  ON project_questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- INVESTMENTS - Remove duplicates, consolidate into one policy
DROP POLICY IF EXISTS "Investors can view own investments" ON investments;
DROP POLICY IF EXISTS "Users can read own investments" ON investments;
DROP POLICY IF EXISTS "Admins can read all investments" ON investments;
DROP POLICY IF EXISTS "Users can create investments" ON investments;

CREATE POLICY "Users can view investments"
  ON investments FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = investor_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create investments"
  ON investments FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = investor_id);