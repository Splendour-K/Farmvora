/*
  # Add Investment Approval Trigger

  1. New Functions
    - `update_project_funding_on_approval` - Updates project funding when investment is approved
    - Automatically adds/removes from current_funding based on status changes
    
  2. Changes
    - Creates trigger on investments table for status updates
    - Only approved investments count toward project funding
*/

-- Function to update project funding on investment approval/rejection
CREATE OR REPLACE FUNCTION public.update_project_funding_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When investment is approved, add to current_funding
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
    UPDATE projects
    SET current_funding = current_funding + NEW.amount
    WHERE id = NEW.project_id;
  
  -- When previously approved investment is rejected, subtract from current_funding
  ELSIF NEW.status = 'rejected' AND OLD.status = 'approved' THEN
    UPDATE projects
    SET current_funding = GREATEST(current_funding - NEW.amount, 0)
    WHERE id = NEW.project_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for investment approval
DROP TRIGGER IF EXISTS on_investment_approval ON investments;
CREATE TRIGGER on_investment_approval
  AFTER UPDATE ON investments
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_project_funding_on_approval();
