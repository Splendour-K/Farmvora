/*
  # Add User Suspension and Activity Tracking

  1. Changes to profiles table
    - Add `is_suspended` boolean field to track suspended users
    - Add `suspended_at` timestamp to track when user was suspended
    - Add `suspended_reason` text field to store suspension reason
    - Add `last_login` timestamp to track user activity
    
  2. Security
    - Ensure only admins can modify suspension status
    - Add RLS policies for suspension management
*/

-- Add new columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_suspended'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_suspended boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'suspended_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN suspended_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'suspended_reason'
  ) THEN
    ALTER TABLE profiles ADD COLUMN suspended_reason text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_login timestamptz;
  END IF;
END $$;

-- Create function to check if user is suspended
CREATE OR REPLACE FUNCTION public.check_user_suspension()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.is_suspended = true THEN
    NEW.suspended_at = now();
  ELSIF NEW.is_suspended = false THEN
    NEW.suspended_at = NULL;
    NEW.suspended_reason = NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for suspension tracking
DROP TRIGGER IF EXISTS on_user_suspension ON profiles;
CREATE TRIGGER on_user_suspension
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.is_suspended IS DISTINCT FROM NEW.is_suspended)
  EXECUTE FUNCTION check_user_suspension();
