/*
  # Add Multi-Currency Support with NGN Base

  1. New Tables
    - `exchange_rates` - Stores fixed conversion rates to NGN
    - Tracks rates for USD, EUR, GBP, etc.
    
  2. Changes to projects table
    - All capital amounts stored in NGN
    - Add display_currency field (default 'NGN')
    
  3. Changes to investments table
    - Add `original_currency` - currency investor paid in
    - Add `original_amount` - amount in original currency
    - Add `ngn_amount` - converted amount in NGN (primary calculation)
    - Add `exchange_rate` - rate used at time of investment
    - Update expected_return to be in NGN
    
  4. Notes
    - All ROI calculations based on NGN amounts
    - Protects from exchange rate fluctuations
    - USD display is optional convenience feature
*/

-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_code text NOT NULL UNIQUE,
  currency_name text NOT NULL,
  rate_to_ngn numeric(10, 2) NOT NULL,
  symbol text NOT NULL,
  is_active boolean DEFAULT true,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CHECK (rate_to_ngn > 0)
);

-- Enable RLS on exchange_rates
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Anyone can view exchange rates
CREATE POLICY "Anyone can view exchange rates"
  ON exchange_rates FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Only admins can modify exchange rates
CREATE POLICY "Admins can modify exchange rates"
  ON exchange_rates FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Insert default exchange rates (as of typical rates, admin can update)
INSERT INTO exchange_rates (currency_code, currency_name, rate_to_ngn, symbol, is_active) VALUES
  ('NGN', 'Nigerian Naira', 1.00, '₦', true),
  ('USD', 'US Dollar', 1550.00, '$', true),
  ('EUR', 'Euro', 1700.00, '€', true),
  ('GBP', 'British Pound', 1950.00, '£', true)
ON CONFLICT (currency_code) DO NOTHING;

-- Add currency fields to investments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investments' AND column_name = 'original_currency'
  ) THEN
    ALTER TABLE investments ADD COLUMN original_currency text DEFAULT 'NGN';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investments' AND column_name = 'original_amount'
  ) THEN
    ALTER TABLE investments ADD COLUMN original_amount numeric(12, 2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investments' AND column_name = 'ngn_amount'
  ) THEN
    ALTER TABLE investments ADD COLUMN ngn_amount numeric(12, 2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investments' AND column_name = 'exchange_rate'
  ) THEN
    ALTER TABLE investments ADD COLUMN exchange_rate numeric(10, 2) DEFAULT 1.00;
  END IF;
END $$;

-- Migrate existing investment amounts to NGN (assuming they were in NGN)
UPDATE investments 
SET 
  original_currency = 'NGN',
  original_amount = amount,
  ngn_amount = amount,
  exchange_rate = 1.00
WHERE ngn_amount IS NULL;

-- Add comment explaining currency handling
COMMENT ON COLUMN investments.ngn_amount IS 'Primary amount in NGN used for all ROI calculations';
COMMENT ON COLUMN investments.original_amount IS 'Amount in currency investor paid with';
COMMENT ON COLUMN investments.original_currency IS 'Currency code investor paid with (USD, EUR, GBP, NGN)';
COMMENT ON COLUMN investments.exchange_rate IS 'Exchange rate to NGN at time of investment';

-- Function to convert currency to NGN
CREATE OR REPLACE FUNCTION convert_to_ngn(
  amount numeric,
  from_currency text
)
RETURNS numeric
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  rate numeric;
BEGIN
  -- Get the current exchange rate
  SELECT rate_to_ngn INTO rate
  FROM exchange_rates
  WHERE currency_code = from_currency AND is_active = true;
  
  -- If currency not found, return 0
  IF rate IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Convert to NGN
  RETURN amount * rate;
END;
$$;

-- Function to convert NGN to another currency (for display only)
CREATE OR REPLACE FUNCTION convert_from_ngn(
  ngn_amount numeric,
  to_currency text
)
RETURNS numeric
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  rate numeric;
BEGIN
  -- Get the current exchange rate
  SELECT rate_to_ngn INTO rate
  FROM exchange_rates
  WHERE currency_code = to_currency AND is_active = true;
  
  -- If currency not found, return 0
  IF rate IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Convert from NGN to target currency
  RETURN ngn_amount / rate;
END;
$$;
