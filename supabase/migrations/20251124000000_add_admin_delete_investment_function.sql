/*
  # Add Admin Delete Investment Function

  1. New Functions
    - `admin_delete_investment` - Allows admins to delete pending investments
    
  2. Changes
    - Creates function with SECURITY DEFINER to bypass RLS
    - Validates admin role before deletion
    - Only allows deletion of pending investments
*/

-- Drop existing function if it exists with any signature
DROP FUNCTION IF EXISTS public.admin_delete_investment(UUID);

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
