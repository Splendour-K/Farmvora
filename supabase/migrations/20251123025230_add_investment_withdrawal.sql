/*
  # Add Investment Withdrawal Functionality

  1. New Function
    - `withdraw_investment` - Allows investors to withdraw pending investments
    - Only works for investments with status 'pending' (not yet approved)
    - Automatically cleans up related data
  
  2. Security
    - Users can only withdraw their own pending investments
    - Cannot withdraw approved investments (must contact admin)
*/

-- Create function to withdraw/delete pending investment
CREATE OR REPLACE FUNCTION withdraw_investment(investment_id uuid)
RETURNS jsonb AS $$
DECLARE
  investment_record RECORD;
BEGIN
  -- Get investment details
  SELECT * INTO investment_record 
  FROM investments 
  WHERE id = investment_id 
  AND investor_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Investment not found or unauthorized'
    );
  END IF;

  -- Only allow withdrawal of pending investments
  IF investment_record.status != 'pending' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Can only withdraw pending investments. Please contact admin for approved investments.'
    );
  END IF;

  -- Delete the investment
  DELETE FROM investments WHERE id = investment_id AND investor_id = auth.uid();

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Investment withdrawn successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION withdraw_investment TO authenticated;

COMMENT ON FUNCTION withdraw_investment IS 'Allows investors to withdraw their own pending investment requests';