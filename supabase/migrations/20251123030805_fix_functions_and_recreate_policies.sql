/*
  # Fix Functions and Recreate Dropped Policies
*/

-- Fix functions with CASCADE
DROP FUNCTION IF EXISTS update_product_updated_at() CASCADE;
CREATE FUNCTION update_product_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

DROP FUNCTION IF EXISTS update_order_updated_at() CASCADE;
CREATE FUNCTION update_order_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

DROP FUNCTION IF EXISTS check_user_suspension() CASCADE;
CREATE FUNCTION check_user_suspension()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_suspended = true
  ) THEN
    RAISE EXCEPTION 'Your account has been suspended. Please contact support.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

DROP FUNCTION IF EXISTS convert_to_ngn(numeric, text) CASCADE;
CREATE FUNCTION convert_to_ngn(amount numeric, currency text)
RETURNS numeric AS $$
DECLARE
  rate numeric;
BEGIN
  IF currency = 'NGN' THEN
    RETURN amount;
  END IF;

  SELECT ngn_rate INTO rate
  FROM exchange_rates
  WHERE currency_code = currency
  AND is_active = true
  ORDER BY updated_at DESC
  LIMIT 1;

  IF rate IS NULL THEN
    RAISE EXCEPTION 'Exchange rate not found for currency: %', currency;
  END IF;

  RETURN amount * rate;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

DROP FUNCTION IF EXISTS convert_from_ngn(numeric, text) CASCADE;
CREATE FUNCTION convert_from_ngn(ngn_amount numeric, target_currency text)
RETURNS numeric AS $$
DECLARE
  rate numeric;
BEGIN
  IF target_currency = 'NGN' THEN
    RETURN ngn_amount;
  END IF;

  SELECT ngn_rate INTO rate
  FROM exchange_rates
  WHERE currency_code = target_currency
  AND is_active = true
  ORDER BY updated_at DESC
  LIMIT 1;

  IF rate IS NULL THEN
    RAISE EXCEPTION 'Exchange rate not found for currency: %', target_currency;
  END IF;

  RETURN ngn_amount / rate;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

DROP FUNCTION IF EXISTS update_project_funding_on_approval() CASCADE;
CREATE FUNCTION update_project_funding_on_approval()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE projects
    SET current_funding = current_funding + NEW.ngn_amount
    WHERE id = NEW.project_id;
  ELSIF NEW.status = 'rejected' AND OLD.status = 'approved' THEN
    UPDATE projects
    SET current_funding = GREATEST(current_funding - NEW.ngn_amount, 0)
    WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

DROP FUNCTION IF EXISTS update_project_raised_amount_with_buffer() CASCADE;
CREATE FUNCTION update_project_raised_amount_with_buffer()
RETURNS trigger AS $$
DECLARE
  project_record RECORD;
BEGIN
  SELECT emergency_buffer_percentage INTO project_record
  FROM projects
  WHERE id = NEW.project_id;

  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE projects
    SET 
      amount_raised_ngn = COALESCE(amount_raised_ngn, 0) + NEW.amount_ngn,
      emergency_buffer_amount_ngn = COALESCE(emergency_buffer_amount_ngn, 0) + (NEW.amount_ngn * emergency_buffer_percentage / 100)
    WHERE id = NEW.project_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

DROP FUNCTION IF EXISTS withdraw_investment(uuid) CASCADE;
CREATE FUNCTION withdraw_investment(investment_id uuid)
RETURNS jsonb AS $$
DECLARE
  investment_record RECORD;
BEGIN
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

  IF investment_record.status != 'pending' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Can only withdraw pending investments. Please contact admin for approved investments.'
    );
  END IF;

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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

DROP FUNCTION IF EXISTS is_admin() CASCADE;
CREATE FUNCTION is_admin()
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

DROP FUNCTION IF EXISTS admin_delete_investment(uuid) CASCADE;
CREATE FUNCTION admin_delete_investment(investment_id uuid)
RETURNS jsonb AS $$
DECLARE
  investment_record RECORD;
  project_record RECORD;
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Admin access required'
    );
  END IF;

  SELECT * INTO investment_record FROM investments WHERE id = investment_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Investment not found'
    );
  END IF;

  SELECT emergency_buffer_percentage INTO project_record
  FROM projects
  WHERE id = investment_record.project_id;

  IF investment_record.status = 'approved' THEN
    UPDATE projects
    SET 
      amount_raised_ngn = GREATEST(0, COALESCE(amount_raised_ngn, 0) - investment_record.amount_ngn),
      emergency_buffer_amount_ngn = GREATEST(0, COALESCE(emergency_buffer_amount_ngn, 0) - (investment_record.amount_ngn * emergency_buffer_percentage / 100))
    WHERE id = investment_record.project_id;
  END IF;

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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Recreate policies that depend on is_admin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'project_questions' 
    AND policyname = 'Admins can view all questions'
  ) THEN
    CREATE POLICY "Admins can view all questions"
      ON project_questions FOR SELECT
      TO authenticated
      USING (is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'exchange_rates' 
    AND policyname = 'Admins can modify exchange rates'
  ) THEN
    CREATE POLICY "Admins can modify exchange rates"
      ON exchange_rates FOR ALL
      TO authenticated
      USING (is_admin());
  END IF;
END $$;