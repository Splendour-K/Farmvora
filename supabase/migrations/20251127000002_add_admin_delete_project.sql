/*
  # Add Admin Delete Project Function

  1. New Functions
    - `admin_delete_project` - Allows admins to delete projects with all related data
    
  2. Changes
    - Creates function with SECURITY DEFINER to bypass RLS
    - Validates admin role before deletion
    - Deletes related investments, updates, favorites, and QA
*/

-- Function to allow admins to delete projects
CREATE OR REPLACE FUNCTION public.admin_delete_project(project_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role TEXT;
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
      'error', 'Only admins can delete projects'
    );
  END IF;
  
  -- Check if project exists
  IF NOT EXISTS (SELECT 1 FROM projects WHERE id = project_id_param) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Project not found'
    );
  END IF;
  
  -- Delete related data (cascading deletes should handle this, but being explicit)
  DELETE FROM project_favorites WHERE project_id = project_id_param;
  DELETE FROM project_qa WHERE project_id = project_id_param;
  DELETE FROM weekly_updates WHERE project_id = project_id_param;
  DELETE FROM investments WHERE project_id = project_id_param;
  
  -- Delete the project
  DELETE FROM projects WHERE id = project_id_param;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  IF v_deleted_count > 0 THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Project and all related data deleted successfully'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to delete project'
    );
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.admin_delete_project(UUID) TO authenticated;
