-- First, drop the existing functions to ensure clean recreation
DROP FUNCTION IF EXISTS get_department_summary();
DROP FUNCTION IF EXISTS get_monthly_trends(UUID);
DROP FUNCTION IF EXISTS get_per_capita_emissions();

-- Recreate get_department_summary with SECURITY DEFINER
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
    d.id,
    d.name,
    COUNT(cs.id)::BIGINT,
    ROUND(COALESCE(AVG(cs.total_carbon), 0)::DECIMAL, 2),
    ROUND(COALESCE(SUM(cs.total_carbon), 0)::DECIMAL, 2),
    CASE 
      WHEN COALESCE(AVG(cs.total_carbon), 0) < 100 THEN 'Excellent'
      WHEN COALESCE(AVG(cs.total_carbon), 0) < 300 THEN 'Good'
      ELSE 'Needs Improvement'
    END
  FROM departments d
  LEFT JOIN carbon_submissions cs ON d.id = cs.department_id
  GROUP BY d.id, d.name
  ORDER BY total_carbon DESC NULLS LAST;
END;
$$;

-- Recreate get_monthly_trends with SECURITY DEFINER
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
    TO_CHAR(submission_date, 'YYYY-MM') AS month_year,
    COUNT(*)::BIGINT,
    ROUND(COALESCE(AVG(total_carbon), 0)::DECIMAL, 2),
    ROUND(COALESCE(SUM(total_carbon), 0)::DECIMAL, 2)
  FROM carbon_submissions
  WHERE dept_id IS NULL OR department_id = dept_id
  GROUP BY TO_CHAR(submission_date, 'YYYY-MM')
  ORDER BY month_year DESC
  LIMIT 12;
END;
$$;

-- Recreate get_per_capita_emissions with SECURITY DEFINER
CREATE OR REPLACE FUNCTION get_per_capita_emissions()
RETURNS TABLE (
  department_id UUID,
  department_name TEXT,
  total_carbon DECIMAL,
  student_count INTEGER,
  per_capita_carbon DECIMAL
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    ROUND(COALESCE(SUM(cs.total_carbon), 0)::DECIMAL, 2),
    d.student_count,
    CASE 
      WHEN d.student_count > 0 THEN ROUND((COALESCE(SUM(cs.total_carbon), 0) / d.student_count)::DECIMAL, 2)
      ELSE 0::DECIMAL
    END
  FROM departments d
  LEFT JOIN carbon_submissions cs ON d.id = cs.department_id
  GROUP BY d.id, d.name, d.student_count
  ORDER BY per_capita_carbon DESC NULLS LAST;
END;
$$;
