-- Create a custom RPC function to execute SQL dynamically
-- This allows programmatic execution of migrations via REST API
-- WARNING: This function has security implications - use with service role key only

CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Execute the SQL query dynamically
  EXECUTE query;
  
  -- Return success
  RETURN json_build_object('success', true, 'message', 'Query executed successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users (or service role)
-- Note: In production, restrict this to service role only
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;

