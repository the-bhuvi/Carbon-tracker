-- Fix analytics functions to run with proper security context
-- These functions need SECURITY DEFINER to bypass RLS policies

-- Function to get department summary
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
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    COUNT(cs.id)::BIGINT,
    ROUND(AVG(cs.total_carbon)::DECIMAL, 2),
    ROUND(SUM(cs.total_carbon)::DECIMAL, 2),
    CASE 
      WHEN AVG(cs.total_carbon) < 100 THEN 'Excellent'
      WHEN AVG(cs.total_carbon) < 300 THEN 'Good'
      ELSE 'Needs Improvement'
    END
  FROM departments d
  LEFT JOIN carbon_submissions cs ON d.id = cs.department_id
  GROUP BY d.id, d.name
  ORDER BY total_carbon DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Function to get monthly trends
CREATE OR REPLACE FUNCTION get_monthly_trends(dept_id UUID DEFAULT NULL)
RETURNS TABLE (
  month_year TEXT,
  submission_count BIGINT,
  avg_carbon DECIMAL,
  total_carbon DECIMAL
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(submission_date, 'YYYY-MM') AS month_year,
    COUNT(*)::BIGINT,
    ROUND(AVG(total_carbon)::DECIMAL, 2),
    ROUND(SUM(total_carbon)::DECIMAL, 2)
  FROM carbon_submissions
  WHERE dept_id IS NULL OR department_id = dept_id
  GROUP BY TO_CHAR(submission_date, 'YYYY-MM')
  ORDER BY month_year DESC
  LIMIT 12;
END;
$$ LANGUAGE plpgsql;

-- Function to get per capita emissions
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
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    ROUND(SUM(cs.total_carbon)::DECIMAL, 2),
    d.student_count,
    CASE 
      WHEN d.student_count > 0 THEN ROUND((SUM(cs.total_carbon) / d.student_count)::DECIMAL, 2)
      ELSE 0::DECIMAL
    END
  FROM departments d
  LEFT JOIN carbon_submissions cs ON d.id = cs.department_id
  GROUP BY d.id, d.name, d.student_count
  ORDER BY per_capita_carbon DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;
