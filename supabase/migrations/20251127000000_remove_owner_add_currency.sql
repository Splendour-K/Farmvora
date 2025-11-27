/*
  # Remove Farm Owner and Add Currency Support

  1. Changes
    - Remove owner_name and owner_bio columns from projects
    - Add currency column to projects (NGN, USD, GHS, etc.)
    - Update existing projects to use NGN as default
    
  2. Purpose
    - All projects are managed by Farm Vora Cause only
    - Enable multi-currency support with flexible currency selection
*/

-- Add currency column to projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'NGN';

-- Remove owner columns (drop constraints first if any)
ALTER TABLE projects 
DROP COLUMN IF EXISTS owner_name CASCADE,
DROP COLUMN IF EXISTS owner_bio CASCADE;

-- Add check constraint for valid currencies
ALTER TABLE projects
DROP CONSTRAINT IF EXISTS valid_currency;

ALTER TABLE projects
ADD CONSTRAINT valid_currency 
CHECK (currency IN ('NGN', 'USD', 'GHS', 'KES', 'ZAR', 'EUR', 'GBP'));

-- Update existing projects to use NGN if they don't have currency set
UPDATE projects 
SET currency = 'NGN' 
WHERE currency IS NULL OR currency = '';
