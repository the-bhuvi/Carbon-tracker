-- Grant execute permissions on the analytics functions to authenticated users
GRANT EXECUTE ON FUNCTION get_department_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_trends(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_per_capita_emissions() TO authenticated;
