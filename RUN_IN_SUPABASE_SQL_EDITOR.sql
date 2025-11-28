-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- https://supabase.com/dashboard/project/jqxpyaixoqtbpxslqfdc/sql/new
-- ============================================

-- PART 1: Grant Admin Full Access
-- ============================================

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

-- PART 2: Fix Investment Approval (Add approved_at column)
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'investments' 
    AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE investments ADD COLUMN approved_at timestamptz;
  END IF;
END $$;

-- Recreate approve_investment function with proper column handling
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
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE id = investment_id;
  
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
    'message', 'Investment approved successfully'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_investment(UUID) TO authenticated;
