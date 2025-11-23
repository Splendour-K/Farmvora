/*
  # Add Admin Role Helper Function

  1. New Functions
    - `is_admin()` - Helper function to check if the current user is an admin
    
  2. Changes
    - Creates a function that checks the user's app_metadata for admin role
    - Used for RLS policies and application-level authorization
*/

-- Function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
      false
    )
  );
END;
$$;
