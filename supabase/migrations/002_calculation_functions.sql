-- Carbon Calculation Function
CREATE OR REPLACE FUNCTION calculate_carbon_metrics()
RETURNS TRIGGER AS $$
DECLARE
  factors RECORD;
  total DECIMAL(12, 4);
  score TEXT;
  trees DECIMAL(10, 2);
  suggestion_list TEXT[];
BEGIN
  -- Get emission factors
  SELECT * INTO factors FROM emission_factors LIMIT 1;
  
  -- Calculate total carbon emissions
  total := 
    (COALESCE(NEW.electricity_kwh, 0) * factors.electricity_factor) +
    (COALESCE(NEW.diesel_liters, 0) * factors.diesel_factor) +
    (COALESCE(NEW.petrol_liters, 0) * factors.petrol_factor) +
    (COALESCE(NEW.lpg_kg, 0) * factors.lpg_factor) +
    (COALESCE(NEW.png_m3, 0) * factors.png_factor) +
    (COALESCE(NEW.travel_km, 0) * factors.travel_factor) +
    (COALESCE(NEW.water_liters, 0) * factors.water_factor) +
    (COALESCE(NEW.ewaste_kg, 0) * factors.ewaste_factor);
  
  -- Determine carbon score
  IF total < 100 THEN
    score := 'Green';
  ELSIF total < 500 THEN
    score := 'Moderate';
  ELSE
    score := 'High';
  END IF;
  
  -- Calculate tree equivalent (21kg CO2 per tree per year)
  trees := total / 21.0;
  
  -- Generate suggestions based on consumption
  suggestion_list := ARRAY[]::TEXT[];
  
  IF NEW.electricity_kwh > 500 THEN
    suggestion_list := array_append(suggestion_list, 'Consider switching to LED bulbs and energy-efficient appliances');
  END IF;
  
  IF NEW.diesel_liters > 50 OR NEW.petrol_liters > 50 THEN
    suggestion_list := array_append(suggestion_list, 'Explore renewable fuel alternatives or reduce vehicle usage');
  END IF;
  
  IF NEW.travel_km > 100 THEN
    suggestion_list := array_append(suggestion_list, 'Use public transport or carpool to reduce travel emissions');
  END IF;
  
  IF NEW.water_liters > 10000 THEN
    suggestion_list := array_append(suggestion_list, 'Install water-saving fixtures and fix leaks promptly');
  END IF;
  
  IF NEW.ewaste_kg > 10 THEN
    suggestion_list := array_append(suggestion_list, 'Properly recycle e-waste through certified facilities');
  END IF;
  
  IF NEW.paper_kg > 20 THEN
    suggestion_list := array_append(suggestion_list, 'Go digital to reduce paper consumption');
  END IF;
  
  -- Set calculated values
  NEW.total_carbon := total;
  NEW.carbon_score := score;
  NEW.tree_equivalent := trees;
  NEW.suggestions := suggestion_list;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger for Automatic Calculation
CREATE TRIGGER calculate_carbon_on_insert
BEFORE INSERT OR UPDATE ON carbon_submissions
FOR EACH ROW EXECUTE FUNCTION calculate_carbon_metrics();

-- Function to get department summary
CREATE OR REPLACE FUNCTION get_department_summary()
RETURNS TABLE (
  department_id UUID,
  department_name TEXT,
  total_submissions BIGINT,
  avg_carbon DECIMAL,
  total_carbon DECIMAL,
  carbon_trend TEXT
) AS $$
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
  ORDER BY total_carbon DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get monthly trends
CREATE OR REPLACE FUNCTION get_monthly_trends(dept_id UUID DEFAULT NULL)
RETURNS TABLE (
  month_year TEXT,
  submission_count BIGINT,
  avg_carbon DECIMAL,
  total_carbon DECIMAL
) AS $$
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
) AS $$
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
  ORDER BY per_capita_carbon DESC;
END;
$$ LANGUAGE plpgsql;
