/*
  # Add User Types and Payment Tracking

  1. Changes to Profiles Table
    - Add `user_type` column (digital_farmer, product_buyer, both)
    - Default to 'digital_farmer' for backward compatibility
  
  2. Changes to Investments Table
    - Add `payment_status` (pending, completed, failed)
    - Add `payment_reference` (Paystack reference)
    - Add `payment_date` (when payment was made)
    - Add `paystack_access_code` (for payment initialization)
  
  3. Changes to Orders Table
    - Add `payment_status` (pending, completed, failed)
    - Add `payment_reference` (Paystack reference)
    - Add `payment_date` (when payment was made)
    - Add `paystack_access_code` (for payment initialization)
  
  4. New Table: payment_transactions
    - Track all payment attempts and statuses
    - For audit and reconciliation
  
  5. Security
    - Maintain existing RLS policies
    - Add policies for payment transactions
*/

-- Add user_type to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_type text DEFAULT 'digital_farmer';
  END IF;
END $$;

-- Add payment tracking to investments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investments' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE investments ADD COLUMN payment_status text DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investments' AND column_name = 'payment_reference'
  ) THEN
    ALTER TABLE investments ADD COLUMN payment_reference text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investments' AND column_name = 'payment_date'
  ) THEN
    ALTER TABLE investments ADD COLUMN payment_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investments' AND column_name = 'paystack_access_code'
  ) THEN
    ALTER TABLE investments ADD COLUMN paystack_access_code text;
  END IF;
END $$;

-- Add payment tracking to orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status text DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_reference'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_reference text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_date'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'paystack_access_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN paystack_access_code text;
  END IF;
END $$;

-- Create payment_transactions table for audit
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reference text NOT NULL UNIQUE,
  amount numeric(15, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  status text NOT NULL DEFAULT 'pending',
  payment_type text NOT NULL,
  related_id uuid,
  paystack_response jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Payment transactions policies
CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create own payment transactions"
  ON payment_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payment transactions"
  ON payment_transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON payment_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_investments_payment_status ON investments(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Add comments
COMMENT ON COLUMN profiles.user_type IS 'Type of user: digital_farmer (investor), product_buyer (store customer), or both';
COMMENT ON COLUMN investments.payment_status IS 'Payment status: pending, completed, failed';
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, completed, failed';
COMMENT ON TABLE payment_transactions IS 'Audit log of all payment transactions through Paystack';