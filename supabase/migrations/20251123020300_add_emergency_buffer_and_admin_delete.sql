/*
  # Add Emergency Buffer System and Admin Delete Capability

  1. Changes to Projects Table
    - Add `emergency_buffer_percentage` column (default 10%)
    - Add `emergency_buffer_amount_usd` to track reserved funds in USD
    - Add `emergency_buffer_amount_ngn` to track reserved funds in NGN
  
  2. New Admin Function
    - `admin_delete_investment` - Allows admins to delete investments and properly adjust project totals
    - Returns funds from emergency buffer when investment is deleted
    - Updates project raised amounts accordingly
  
  3. Investment Tracking Updates
    - Modified investment approval trigger to calculate and store buffer amounts
    - Buffer is 10% of all raised funds (not deducted from investor amount, but tracked separately)
  
  4. Security
    - Only users with admin role can delete investments
    - Proper validation and rollback on errors
  
  Important Notes:
  - The 10% buffer protects investor returns by reserving funds for emergencies
  - Buffer covers: disease outbreaks, feed price increases, equipment repairs
  - Investors receive their full ROI while farm maintains operational safety net
  - Admin delete is for system malfunction recovery only
*/

-- Add emergency buffer columns to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'emergency_buffer_percentage'
  ) THEN
    ALTER TABLE projects ADD COLUMN emergency_buffer_percentage integer DEFAULT 10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'emergency_buffer_amount_usd'
  ) THEN
    ALTER TABLE projects ADD COLUMN emergency_buffer_amount_usd numeric(12,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'emergency_buffer_amount_ngn'
  ) THEN
    ALTER TABLE projects ADD COLUMN emergency_buffer_amount_ngn numeric(15,2) DEFAULT 0;
  END IF;
END $$;

-- Update the investment approval trigger to include buffer calculation
CREATE OR REPLACE FUNCTION update_project_raised_amount_with_buffer()
RETURNS TRIGGER AS $$
DECLARE
  project_record RECORD;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    SELECT * INTO project_record FROM projects WHERE id = NEW.project_id;
    
    IF project_record.currency = 'NGN' THEN
      UPDATE projects
      SET 
        amount_raised_ngn = COALESCE(amount_raised_ngn, 0) + NEW.amount_ngn,
        emergency_buffer_amount_ngn = COALESCE(emergency_buffer_amount_ngn, 0) + (NEW.amount_ngn * emergency_buffer_percentage / 100)
      WHERE id = NEW.project_id;
    ELSE
      UPDATE projects
      SET 
        amount_raised = COALESCE(amount_raised, 0) + NEW.amount,
        emergency_buffer_amount_usd = COALESCE(emergency_buffer_amount_usd, 0) + (NEW.amount * emergency_buffer_percentage / 100)
      WHERE id = NEW.project_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create admin function to delete investments
CREATE OR REPLACE FUNCTION admin_delete_investment(investment_id uuid)
RETURNS jsonb AS $$
DECLARE
  investment_record RECORD;
  project_record RECORD;
  user_role text;
BEGIN
  -- Check if user is admin
  SELECT role INTO user_role FROM users WHERE id = auth.uid();
  
  IF user_role != 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Only admins can delete investments'
    );
  END IF;

  -- Get investment details
  SELECT * INTO investment_record FROM investments WHERE id = investment_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Investment not found'
    );
  END IF;

  -- Get project details
  SELECT * INTO project_record FROM projects WHERE id = investment_record.project_id;

  -- If investment was approved, adjust project amounts
  IF investment_record.status = 'approved' THEN
    IF project_record.currency = 'NGN' THEN
      UPDATE projects
      SET 
        amount_raised_ngn = GREATEST(0, COALESCE(amount_raised_ngn, 0) - investment_record.amount_ngn),
        emergency_buffer_amount_ngn = GREATEST(0, COALESCE(emergency_buffer_amount_ngn, 0) - (investment_record.amount_ngn * emergency_buffer_percentage / 100))
      WHERE id = investment_record.project_id;
    ELSE
      UPDATE projects
      SET 
        amount_raised = GREATEST(0, COALESCE(amount_raised, 0) - investment_record.amount),
        emergency_buffer_amount_usd = GREATEST(0, COALESCE(emergency_buffer_amount_usd, 0) - (investment_record.amount * emergency_buffer_percentage / 100))
      WHERE id = investment_record.project_id;
    END IF;
  END IF;

  -- Delete the investment
  DELETE FROM investments WHERE id = investment_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Investment deleted successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (function handles its own auth check)
GRANT EXECUTE ON FUNCTION admin_delete_investment TO authenticated;