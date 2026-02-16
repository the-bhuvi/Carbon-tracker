-- Fix ambiguous column references in analytics functions

DROP FUNCTION IF EXISTS get_department_summary();
DROP FUNCTION IF EXISTS get_monthly_trends(UUID);

-- Recreate get_department_summary with fixed column aliasing
CREATE OR REPLACE FUNCTION get_department_summary()
RETURNS TABLE (
  department_id UUID,
  department_name TEXT,
  total_submissions BIGINT,
  avg_carbon DECIMAL,
  total_carbon DECIMAL,
  carbon_trend TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id AS department_id,
    d.name AS department_name,
    COUNT(cs.id)::BIGINT AS total_submissions,
    ROUND(COALESCE(AVG(cs.total_carbon), 0)::DECIMAL, 2) AS avg_carbon,
    ROUND(COALESCE(SUM(cs.total_carbon), 0)::DECIMAL, 2) AS total_carbon,
    CASE 
      WHEN COALESCE(AVG(cs.total_carbon), 0) < 100 THEN 'Excellent'
      WHEN COALESCE(AVG(cs.total_carbon), 0) < 300 THEN 'Good'
      ELSE 'Needs Improvement'
    END AS carbon_trend
  FROM departments d
  LEFT JOIN carbon_submissions cs ON d.id = cs.department_id
  GROUP BY d.id, d.name
  ORDER BY ROUND(COALESCE(SUM(cs.total_carbon), 0)::DECIMAL, 2) DESC NULLS LAST;
END;
$$;

-- Recreate get_monthly_trends with fixed column aliasing
CREATE OR REPLACE FUNCTION get_monthly_trends(dept_id UUID DEFAULT NULL)
RETURNS TABLE (
  month_year TEXT,
  submission_count BIGINT,
  avg_carbon DECIMAL,
  total_carbon DECIMAL
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(cs.submission_date, 'YYYY-MM') AS month_year,
    COUNT(*)::BIGINT AS submission_count,
    ROUND(COALESCE(AVG(cs.total_carbon), 0)::DECIMAL, 2) AS avg_carbon,
    ROUND(COALESCE(SUM(cs.total_carbon), 0)::DECIMAL, 2) AS total_carbon
  FROM carbon_submissions cs
  WHERE dept_id IS NULL OR cs.department_id = dept_id
  GROUP BY TO_CHAR(cs.submission_date, 'YYYY-MM')
  ORDER BY TO_CHAR(cs.submission_date, 'YYYY-MM') DESC
  LIMIT 12;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_department_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_trends(UUID) TO authenticated;
