/*
  # Grant Full Admin Access - Simplified
  
  Grants admins full CRUD access to all core tables:
  - projects (delete)
  - investments (update, delete)
  - weekly_updates (delete)
  - profiles (update, delete - manage users)
  - project_questions (update, delete)
  - notifications (all operations)
*/

-- ============================================================================
-- PROJECTS: Grant admins delete access
-- ============================================================================

DROP POLICY IF EXISTS "Admins can delete projects" ON projects;
CREATE POLICY "Admins can delete projects"
  ON projects
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- INVESTMENTS: Grant admins full access
-- ============================================================================

DROP POLICY IF EXISTS "Admins can update investments" ON investments;
CREATE POLICY "Admins can update investments"
  ON investments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete investments" ON investments;
CREATE POLICY "Admins can delete investments"
  ON investments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- WEEKLY UPDATES: Grant admins delete access
-- ============================================================================

DROP POLICY IF EXISTS "Admins can delete updates" ON weekly_updates;
CREATE POLICY "Admins can delete updates"
  ON weekly_updates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- PROFILES: Grant admins full access to manage users
-- ============================================================================

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles"
  ON profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- ============================================================================
-- PROJECT QUESTIONS: Grant admins full access
-- ============================================================================

DROP POLICY IF EXISTS "Admins can delete questions" ON project_questions;
CREATE POLICY "Admins can delete questions"
  ON project_questions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update questions" ON project_questions;
CREATE POLICY "Admins can update questions"
  ON project_questions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- NOTIFICATIONS: Grant admins full access
-- ============================================================================

DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;
CREATE POLICY "Admins can create notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can read all notifications" ON notifications;
CREATE POLICY "Admins can read all notifications"
  ON notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete notifications" ON notifications;
CREATE POLICY "Admins can delete notifications"
  ON notifications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
