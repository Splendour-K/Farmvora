/*
  # Add Investment and Question Approval System

  1. Changes to investments table
    - Add `status` field with values: 'pending', 'approved', 'rejected'
    - Add `reviewed_by` field to track admin who reviewed
    - Add `reviewed_at` timestamp for review time
    - Add `rejection_reason` text field for rejection notes
    
  2. Changes to project_questions table
    - Add `status` field with values: 'pending', 'approved', 'rejected'
    - Add `reviewed_by` field to track admin who reviewed
    - Add `reviewed_at` timestamp for review time
    - Add `admin_reply` text field for admin responses
    - Add `admin_replied_at` timestamp for reply time
    
  3. Security
    - Update RLS policies for new status fields
    - Only approved questions should be visible to public
    - Investors can see their own pending investments
*/

-- Add status and approval fields to investments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investments' AND column_name = 'status'
  ) THEN
    ALTER TABLE investments ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investments' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE investments ADD COLUMN reviewed_by uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investments' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE investments ADD COLUMN reviewed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investments' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE investments ADD COLUMN rejection_reason text;
  END IF;
END $$;

-- Add status and approval fields to project_questions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_questions' AND column_name = 'status'
  ) THEN
    ALTER TABLE project_questions ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_questions' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE project_questions ADD COLUMN reviewed_by uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_questions' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE project_questions ADD COLUMN reviewed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_questions' AND column_name = 'admin_reply'
  ) THEN
    ALTER TABLE project_questions ADD COLUMN admin_reply text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_questions' AND column_name = 'admin_replied_at'
  ) THEN
    ALTER TABLE project_questions ADD COLUMN admin_replied_at timestamptz;
  END IF;
END $$;

-- Update existing investments to approved status (backward compatibility)
UPDATE investments SET status = 'approved' WHERE status IS NULL OR status = 'pending';

-- Drop existing RLS policies for project_questions
DROP POLICY IF EXISTS "Users can view project questions" ON project_questions;
DROP POLICY IF EXISTS "Users can ask questions" ON project_questions;

-- Create new RLS policies for project_questions
CREATE POLICY "Users can view approved questions"
  ON project_questions FOR SELECT
  TO authenticated
  USING (status = 'approved');

CREATE POLICY "Admins can view all questions"
  ON project_questions FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can ask questions"
  ON project_questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own questions"
  ON project_questions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Update RLS policies for investments to handle pending status
DROP POLICY IF EXISTS "Investors can view own investments" ON investments;

CREATE POLICY "Investors can view own investments"
  ON investments FOR SELECT
  TO authenticated
  USING (auth.uid() = investor_id OR is_admin());
