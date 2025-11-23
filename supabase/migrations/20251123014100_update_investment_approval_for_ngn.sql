/*
  # Update Investment Approval Trigger for NGN

  1. Changes
    - Update trigger to use ngn_amount instead of amount
    - Ensure all funding calculations use NGN
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_investment_approval ON investments;
DROP FUNCTION IF EXISTS public.update_project_funding_on_approval();

-- Recreate function to use ngn_amount
CREATE OR REPLACE FUNCTION public.update_project_funding_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When investment is approved, add NGN amount to current_funding
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
    UPDATE projects
    SET current_funding = current_funding + NEW.ngn_amount
    WHERE id = NEW.project_id;
  
  -- When previously approved investment is rejected, subtract NGN amount from current_funding
  ELSIF NEW.status = 'rejected' AND OLD.status = 'approved' THEN
    UPDATE projects
    SET current_funding = GREATEST(current_funding - NEW.ngn_amount, 0)
    WHERE id = NEW.project_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_investment_approval
  AFTER UPDATE ON investments
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_project_funding_on_approval();
