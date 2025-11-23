/*
  # Add Notifications, Favorites, and Q&A Features

  ## Overview
  Adds essential user engagement features: notifications, project favorites, and Q&A system.

  ## New Tables
  
  ### 1. notifications
  - `id` (uuid, primary key) - Unique notification identifier
  - `user_id` (uuid) - Reference to user receiving notification
  - `type` (text) - Type of notification (investment_update, project_funded, etc.)
  - `title` (text) - Notification title
  - `message` (text) - Notification message
  - `link` (text) - Optional link to related resource
  - `read` (boolean) - Whether notification has been read
  - `created_at` (timestamptz) - When notification was created
  
  ### 2. project_favorites
  - `id` (uuid, primary key) - Unique favorite identifier
  - `user_id` (uuid) - Reference to user
  - `project_id` (uuid) - Reference to project
  - `created_at` (timestamptz) - When project was favorited
  
  ### 3. project_questions
  - `id` (uuid, primary key) - Unique question identifier
  - `project_id` (uuid) - Reference to project
  - `user_id` (uuid) - User who asked the question
  - `question` (text) - Question content
  - `answer` (text) - Answer content (nullable)
  - `answered_by` (uuid) - Admin who answered (nullable)
  - `answered_at` (timestamptz) - When question was answered (nullable)
  - `created_at` (timestamptz) - When question was asked

  ## Security
  
  All tables have RLS enabled:
  - **Notifications**: Users can only see their own notifications
  - **Favorites**: Users can only manage their own favorites
  - **Questions**: All authenticated users can view; users can create their own; admins can answer

  ## Indexes
  
  Performance indexes on frequently queried columns
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create project_favorites table
CREATE TABLE IF NOT EXISTS project_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, project_id)
);

ALTER TABLE project_favorites ENABLE ROW LEVEL SECURITY;

-- Favorites policies
DROP POLICY IF EXISTS "Users can read own favorites" ON project_favorites;
CREATE POLICY "Users can read own favorites"
  ON project_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own favorites" ON project_favorites;
CREATE POLICY "Users can create own favorites"
  ON project_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON project_favorites;
CREATE POLICY "Users can delete own favorites"
  ON project_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create project_questions table
CREATE TABLE IF NOT EXISTS project_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text,
  answered_by uuid REFERENCES profiles(id),
  answered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_questions ENABLE ROW LEVEL SECURITY;

-- Questions policies
DROP POLICY IF EXISTS "Anyone can read questions" ON project_questions;
CREATE POLICY "Anyone can read questions"
  ON project_questions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create questions" ON project_questions;
CREATE POLICY "Users can create questions"
  ON project_questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can answer questions" ON project_questions;
CREATE POLICY "Admins can answer questions"
  ON project_questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON project_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_project_id ON project_favorites(project_id);
CREATE INDEX IF NOT EXISTS idx_questions_project_id ON project_questions(project_id);
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON project_questions(user_id);