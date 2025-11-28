/*
  # Update Project Funding on Investment Approval
  
  1. Changes
    - Modify approve_investment function to update project's current_funding
    - Add validation to prevent over-funding
    - Calculate total approved investments for the project
*/

CREATE OR REPLACE FUNCTION public.approve_investment(investment_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_investment RECORD;
  v_user_role TEXT;
  v_roi_amount NUMERIC;
  v_total_return NUMERIC;
  v_current_funding NUMERIC;
  v_required_capital NUMERIC;
  v_new_total NUMERIC;
BEGIN
  -- Get the current user's role
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = auth.uid();
  
  -- Check if user is admin
  IF v_user_role != 'admin' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Only admins can approve investments'
    );
  END IF;
  
  -- Get investment details with project info
  SELECT 
    i.*,
    p.expected_roi,
    p.duration_months,
    p.currency,
    p.current_funding,
    p.required_capital
  INTO v_investment
  FROM investments i
  JOIN projects p ON i.project_id = p.id
  WHERE i.id = investment_id;
  
  -- Check if investment exists
  IF v_investment.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Investment not found'
    );
  END IF;
  
  -- Check if already approved
  IF v_investment.status = 'approved' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Investment already approved'
    );
  END IF;
  
  -- Check if status is pending
  IF v_investment.status != 'pending' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Can only approve pending investments'
    );
  END IF;
  
  -- Check if approving this investment would exceed funding goal
  v_current_funding := COALESCE(v_investment.current_funding, 0);
  v_required_capital := v_investment.required_capital;
  v_new_total := v_current_funding + v_investment.amount;
  
  IF v_new_total > v_required_capital THEN
    RETURN json_build_object(
      'success', false,
      'error', format('Cannot approve: This would exceed the funding goal. Current: %s, Investment: %s, Goal: %s, Would total: %s',
        v_current_funding, v_investment.amount, v_required_capital, v_new_total)
    );
  END IF;
  
  -- Calculate ROI amount
  v_roi_amount := (v_investment.amount * v_investment.expected_roi / 100);
  v_total_return := v_investment.amount + v_roi_amount;
  
  -- Update investment status to approved
  UPDATE investments
  SET 
    status = 'approved',
    approved_at = now(),
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE id = investment_id;
  
  -- Update project's current funding
  UPDATE projects
  SET 
    current_funding = COALESCE(current_funding, 0) + v_investment.amount,
    updated_at = now()
  WHERE id = v_investment.project_id;
  
  -- Send notification to user
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    created_at
  )
  VALUES (
    v_investment.investor_id,
    'Investment Approved',
    format('Your investment of %s has been approved! Total return at maturity: %s', 
      v_investment.amount::text,
      v_total_return::text
    ),
    'investment',
    now()
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Investment approved successfully',
    'new_funding_total', v_new_total
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_investment(UUID) TO authenticated;
