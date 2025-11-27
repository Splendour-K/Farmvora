/*
  # Fix Investment Approval Workflow

  1. New Functions
    - approve_investment() - Approves investment and credits user balance
    
  2. Changes
    - Automatically mark investment as approved
    - Credit user's account balance immediately
    - Update project funding amounts
*/

-- Function to approve investment and credit balance
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
  
  -- Get investment details
  SELECT 
    i.*,
    p.expected_roi,
    p.duration_months,
    p.currency
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
  
  -- Calculate ROI amount
  v_roi_amount := (v_investment.amount * v_investment.expected_roi / 100);
  v_total_return := v_investment.amount + v_roi_amount;
  
  -- Update investment status to approved
  UPDATE investments
  SET 
    status = 'approved',
    approved_at = now(),
    updated_at = now()
  WHERE id = investment_id;
  
  -- Credit user's balance (create or update account_balance record)
  INSERT INTO account_balances (
    user_id,
    currency,
    available_balance,
    pending_balance,
    total_invested,
    total_returns,
    updated_at
  )
  VALUES (
    v_investment.user_id,
    v_investment.currency,
    v_total_return,
    0,
    v_investment.amount,
    v_roi_amount,
    now()
  )
  ON CONFLICT (user_id, currency) 
  DO UPDATE SET
    available_balance = account_balances.available_balance + v_total_return,
    total_invested = account_balances.total_invested + v_investment.amount,
    total_returns = account_balances.total_returns + v_roi_amount,
    updated_at = now();
  
  -- Send notification to investor
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    related_id
  )
  VALUES (
    v_investment.user_id,
    'investment_approved',
    'Investment Approved! 🎉',
    'Your investment of ' || v_investment.currency || ' ' || v_investment.amount::text || 
    ' has been approved. Expected return: ' || v_investment.currency || ' ' || v_total_return::text,
    investment_id
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Investment approved and balance credited',
    'data', json_build_object(
      'investment_id', investment_id,
      'amount', v_investment.amount,
      'roi_amount', v_roi_amount,
      'total_return', v_total_return,
      'currency', v_investment.currency
    )
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.approve_investment(UUID) TO authenticated;
