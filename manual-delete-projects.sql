-- Manual Project Deletion Script
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/jqxpyaixoqtbpxslqfdc/sql

-- Step 1: Check your profile and role
SELECT id, email, full_name, role 
FROM profiles 
WHERE email = 'YOUR_EMAIL_HERE';  -- Replace with your admin email

-- Step 2: List all projects
SELECT id, title, status, created_at 
FROM projects 
ORDER BY created_at DESC;

-- Step 3: Delete a specific project (replace PROJECT_ID_HERE with actual project ID)
-- This bypasses the function and deletes directly

-- First, delete related data
DELETE FROM project_favorites WHERE project_id = 'PROJECT_ID_HERE';
DELETE FROM project_qa WHERE project_id = 'PROJECT_ID_HERE';
DELETE FROM weekly_updates WHERE project_id = 'PROJECT_ID_HERE';
DELETE FROM investments WHERE project_id = 'PROJECT_ID_HERE';

-- Then delete the project
DELETE FROM projects WHERE id = 'PROJECT_ID_HERE';

-- Step 4: Verify deletion
SELECT id, title FROM projects WHERE id = 'PROJECT_ID_HERE';
-- Should return no rows if deleted successfully
