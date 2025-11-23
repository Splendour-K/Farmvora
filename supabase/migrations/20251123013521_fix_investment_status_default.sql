/*
  # Fix Investment Status Default

  1. Changes
    - Update investments status column default to 'pending'
    - Add check constraint for valid status values
    - Update existing 'active' investments to 'approved'
*/

-- Update existing active investments to approved
UPDATE investments SET status = 'approved' WHERE status = 'active';

-- Drop existing check constraint if exists
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_status_check;

-- Update column default to pending
ALTER TABLE investments ALTER COLUMN status SET DEFAULT 'pending';

-- Add check constraint for valid values
ALTER TABLE investments ADD CONSTRAINT investments_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected'));
