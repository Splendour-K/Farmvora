/*
  # Add Amount Raised Tracking to Projects

  1. Add Columns
    - amount_raised_usd: Tracks total USD raised
    - amount_raised_ngn: Tracks total NGN raised
  
  2. Update existing current_funding
    - Sync current_funding with amount_raised calculations
*/

-- Add amount_raised columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'amount_raised_usd'
  ) THEN
    ALTER TABLE projects ADD COLUMN amount_raised_usd numeric(15, 2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'amount_raised_ngn'
  ) THEN
    ALTER TABLE projects ADD COLUMN amount_raised_ngn numeric(15, 2) DEFAULT 0;
  END IF;
END $$;

-- Update current_funding to match amount_raised_ngn for existing projects
UPDATE projects
SET current_funding = COALESCE(amount_raised_ngn, 0)
WHERE current_funding IS NULL OR current_funding = 0;

-- Create function to sync current_funding with amount_raised_ngn
CREATE OR REPLACE FUNCTION sync_project_funding()
RETURNS trigger AS $$
BEGIN
  NEW.current_funding = NEW.amount_raised_ngn;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

-- Create trigger to keep current_funding in sync
DROP TRIGGER IF EXISTS sync_project_funding_trigger ON projects;
CREATE TRIGGER sync_project_funding_trigger
  BEFORE UPDATE OF amount_raised_ngn ON projects
  FOR EACH ROW
  EXECUTE FUNCTION sync_project_funding();

COMMENT ON COLUMN projects.amount_raised_usd IS 'Total amount raised in USD from approved investments';
COMMENT ON COLUMN projects.amount_raised_ngn IS 'Total amount raised in NGN from approved investments';
COMMENT ON COLUMN projects.current_funding IS 'Current funding amount (synced with amount_raised_ngn)';