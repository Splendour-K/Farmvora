-- Make skalu@farmvora.com an admin
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/jqxpyaixoqtbpxslqfdc/editor

-- Update the role in the profiles table
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'skalu@farmvora.com'
);

-- Verify the change
SELECT 
  u.email,
  p.role,
  p.full_name
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'skalu@farmvora.com';
