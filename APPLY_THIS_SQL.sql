-- RUN THIS SQL IN SUPABASE SQL EDITOR
-- This creates a function that allows admins to delete pending investments

-- Function to allow admins to delete pending investments
CREATE OR REPLACE FUNCTION public.admin_delete_investment(investment_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role TEXT;
  v_investment_status TEXT;
  v_deleted_count INTEGER;
BEGIN
  -- Get the current user's role
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = auth.uid();
  
  -- Check if user is admin
  IF v_user_role != 'admin' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Only admins can delete investments'
    );
  END IF;
  
  -- Get investment status
  SELECT status INTO v_investment_status
  FROM investments
  WHERE id = investment_id;
  
  -- Check if investment exists
  IF v_investment_status IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Investment not found'
    );
  END IF;
  
  -- Only allow deletion of pending investments
  IF v_investment_status != 'pending' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Can only delete pending investments'
    );
  END IF;
  
  -- Delete the investment
  DELETE FROM investments
  WHERE id = investment_id;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  IF v_deleted_count > 0 THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Investment deleted successfully'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to delete investment'
    );
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.admin_delete_investment(UUID) TO authenticated;

-- VERIFICATION: Test the function (optional - comment out if not needed)
-- SELECT admin_delete_investment('test-uuid-here');
