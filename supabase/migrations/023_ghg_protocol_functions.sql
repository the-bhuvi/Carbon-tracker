-- GHG Protocol Carbon Inventory - Backend Functions
-- ⚠️ PREREQUISITE: Migration 022 must be applied FIRST
-- Professional calculation, aggregation, and analytics functions

-- Add dependency check
DO $$
BEGIN
  -- Check if GHG Protocol tables exist (from migration 022)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name IN ('emission_categories', 'emission_factors_config', 'emission_records')
  ) THEN
    RAISE EXCEPTION 'Migration 022 must be applied first! GHG Protocol tables do not exist.';
  END IF;
  
  -- Check if categories are seeded
  IF NOT EXISTS (SELECT 1 FROM emission_categories LIMIT 1) THEN
    RAISE EXCEPTION 'Migration 022 must be applied first! No emission categories found. Run migration 022 to seed data.';
  END IF;
END $$;

-- ============================================
-- 1. Function: Get Current Emission Factor
-- ============================================
CREATE OR REPLACE FUNCTION get_current_emission_factor(cat_id UUID, record_date DATE DEFAULT CURRENT_DATE)
RETURNS DECIMAL(10, 6) AS $$
DECLARE
  factor DECIMAL(10, 6);
BEGIN
  SELECT emission_factor INTO factor
  FROM emission_factors_config
  WHERE category_id = cat_id
    AND valid_from <= record_date
    AND (valid_to IS NULL OR valid_to >= record_date)
  ORDER BY valid_from DESC
  LIMIT 1;
  
  IF factor IS NULL THEN
    RAISE EXCEPTION 'No emission factor found for category %', cat_id;
  END IF;
  
  RETURN factor;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. Function: Calculate and Insert Emission Record
-- ============================================
CREATE OR REPLACE FUNCTION insert_emission_record(
  p_month INTEGER,
  p_year INTEGER,
  p_category_id UUID,
  p_activity_value DECIMAL,
  p_user_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS emission_records AS $$
DECLARE
  v_category RECORD;
  v_emission_factor DECIMAL(10, 6);
  v_calculated_emission DECIMAL(12, 2);
  v_record emission_records;
BEGIN
  -- Get category details
  SELECT * INTO v_category FROM emission_categories WHERE id = p_category_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Category not found';
  END IF;
  
  -- Get current emission factor
  v_emission_factor := get_current_emission_factor(p_category_id, 
    make_date(p_year, p_month, 1));
  
  -- Calculate emission (activity × factor)
  v_calculated_emission := p_activity_value * v_emission_factor;
  
  -- Insert record
  INSERT INTO emission_records (
    month,
    year,
    category_id,
    scope,
    category_name,
    activity_value,
    emission_factor,
    calculated_emission_kg,
    created_by,
    notes
  ) VALUES (
    p_month,
    p_year,
    p_category_id,
    v_category.scope,
    v_category.category_name,
    p_activity_value,
    v_emission_factor,
    v_calculated_emission,
    p_user_id,
    p_notes
  )
  ON CONFLICT (month, year, category_id) 
  DO UPDATE SET
    activity_value = EXCLUDED.activity_value,
    emission_factor = EXCLUDED.emission_factor,
    calculated_emission_kg = EXCLUDED.calculated_emission_kg,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING * INTO v_record;
  
  RETURN v_record;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. Function: Get Total Campus Emissions
-- ============================================
CREATE OR REPLACE FUNCTION get_total_campus_emissions(
  p_start_month INTEGER,
  p_start_year INTEGER,
  p_end_month INTEGER,
  p_end_year INTEGER
)
RETURNS TABLE (
  total_scope1_tonnes DECIMAL,
  total_scope2_tonnes DECIMAL,
  total_scope3_tonnes DECIMAL,
  total_emissions_tonnes DECIMAL,
  record_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN scope = 'Scope1' THEN calculated_emission_tonnes ELSE 0 END), 0)::DECIMAL AS total_scope1_tonnes,
    COALESCE(SUM(CASE WHEN scope = 'Scope2' THEN calculated_emission_tonnes ELSE 0 END), 0)::DECIMAL AS total_scope2_tonnes,
    COALESCE(SUM(CASE WHEN scope = 'Scope3' THEN calculated_emission_tonnes ELSE 0 END), 0)::DECIMAL AS total_scope3_tonnes,
    COALESCE(SUM(calculated_emission_tonnes), 0)::DECIMAL AS total_emissions_tonnes,
    COUNT(*)::BIGINT AS record_count
  FROM emission_records
  WHERE (year > p_start_year OR (year = p_start_year AND month >= p_start_month))
    AND (year < p_end_year OR (year = p_end_year AND month <= p_end_month));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. Function: Get Scope Breakdown with Percentages
-- ============================================
CREATE OR REPLACE FUNCTION get_scope_breakdown(
  p_start_month INTEGER,
  p_start_year INTEGER,
  p_end_month INTEGER,
  p_end_year INTEGER
)
RETURNS TABLE (
  scope TEXT,
  total_tonnes DECIMAL,
  percentage DECIMAL,
  category_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH totals AS (
    SELECT SUM(calculated_emission_tonnes) AS grand_total
    FROM emission_records
    WHERE (year > p_start_year OR (year = p_start_year AND month >= p_start_month))
      AND (year < p_end_year OR (year = p_end_year AND month <= p_end_month))
  )
  SELECT 
    er.scope,
    SUM(er.calculated_emission_tonnes)::DECIMAL AS total_tonnes,
    CASE 
      WHEN (SELECT grand_total FROM totals) > 0 
      THEN (SUM(er.calculated_emission_tonnes) / (SELECT grand_total FROM totals) * 100)::DECIMAL
      ELSE 0::DECIMAL
    END AS percentage,
    COUNT(DISTINCT er.category_id)::BIGINT AS category_count
  FROM emission_records er
  WHERE (er.year > p_start_year OR (er.year = p_start_year AND er.month >= p_start_month))
    AND (er.year < p_end_year OR (er.year = p_end_year AND er.month <= p_end_month))
  GROUP BY er.scope
  ORDER BY total_tonnes DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Function: Get Category Breakdown Within Scope
-- ============================================
CREATE OR REPLACE FUNCTION get_category_breakdown(
  p_scope TEXT,
  p_start_month INTEGER,
  p_start_year INTEGER,
  p_end_month INTEGER,
  p_end_year INTEGER
)
RETURNS TABLE (
  category_name TEXT,
  total_tonnes DECIMAL,
  percentage_of_scope DECIMAL,
  total_activity DECIMAL,
  unit TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH scope_total AS (
    SELECT SUM(calculated_emission_tonnes) AS total
    FROM emission_records
    WHERE scope = p_scope
      AND (year > p_start_year OR (year = p_start_year AND month >= p_start_month))
      AND (year < p_end_year OR (year = p_end_year AND month <= p_end_month))
  )
  SELECT 
    er.category_name,
    SUM(er.calculated_emission_tonnes)::DECIMAL AS total_tonnes,
    CASE 
      WHEN (SELECT total FROM scope_total) > 0 
      THEN (SUM(er.calculated_emission_tonnes) / (SELECT total FROM scope_total) * 100)::DECIMAL
      ELSE 0::DECIMAL
    END AS percentage_of_scope,
    SUM(er.activity_value)::DECIMAL AS total_activity,
    ec.unit
  FROM emission_records er
  JOIN emission_categories ec ON er.category_id = ec.id
  WHERE er.scope = p_scope
    AND (er.year > p_start_year OR (er.year = p_start_year AND er.month >= p_start_month))
    AND (er.year < p_end_year OR (er.year = p_end_year AND er.month <= p_end_month))
  GROUP BY er.category_name, ec.unit
  ORDER BY total_tonnes DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Function: Identify Dominant Scope
-- ============================================
CREATE OR REPLACE FUNCTION get_dominant_scope(
  p_start_month INTEGER,
  p_start_year INTEGER,
  p_end_month INTEGER,
  p_end_year INTEGER
)
RETURNS TABLE (
  dominant_scope TEXT,
  emission_tonnes DECIMAL,
  percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH scope_totals AS (
    SELECT * FROM get_scope_breakdown(p_start_month, p_start_year, p_end_month, p_end_year)
  )
  SELECT 
    scope AS dominant_scope,
    total_tonnes AS emission_tonnes,
    percentage
  FROM scope_totals
  ORDER BY total_tonnes DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Function: Monthly Trend
-- ============================================
CREATE OR REPLACE FUNCTION get_monthly_trend(
  p_start_month INTEGER,
  p_start_year INTEGER,
  p_end_month INTEGER,
  p_end_year INTEGER
)
RETURNS TABLE (
  year INTEGER,
  month INTEGER,
  month_name TEXT,
  scope1_tonnes DECIMAL,
  scope2_tonnes DECIMAL,
  scope3_tonnes DECIMAL,
  total_tonnes DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    er.year,
    er.month,
    TO_CHAR(make_date(er.year, er.month, 1), 'Mon YYYY') AS month_name,
    COALESCE(SUM(CASE WHEN er.scope = 'Scope1' THEN er.calculated_emission_tonnes ELSE 0 END), 0)::DECIMAL AS scope1_tonnes,
    COALESCE(SUM(CASE WHEN er.scope = 'Scope2' THEN er.calculated_emission_tonnes ELSE 0 END), 0)::DECIMAL AS scope2_tonnes,
    COALESCE(SUM(CASE WHEN er.scope = 'Scope3' THEN er.calculated_emission_tonnes ELSE 0 END), 0)::DECIMAL AS scope3_tonnes,
    COALESCE(SUM(er.calculated_emission_tonnes), 0)::DECIMAL AS total_tonnes
  FROM emission_records er
  WHERE (er.year > p_start_year OR (er.year = p_start_year AND er.month >= p_start_month))
    AND (er.year < p_end_year OR (er.year = p_end_year AND er.month <= p_end_month))
  GROUP BY er.year, er.month
  ORDER BY er.year, er.month;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. Function: Baseline Comparison
-- ============================================
CREATE OR REPLACE FUNCTION compare_to_baseline(
  p_current_month INTEGER,
  p_current_year INTEGER
)
RETURNS TABLE (
  baseline_year INTEGER,
  baseline_total_tonnes DECIMAL,
  current_total_tonnes DECIMAL,
  change_tonnes DECIMAL,
  change_percentage DECIMAL,
  status TEXT
) AS $$
DECLARE
  v_baseline RECORD;
  v_current RECORD;
BEGIN
  -- Get active baseline
  SELECT * INTO v_baseline FROM baseline_years WHERE is_active = true LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'No active baseline year configured';
    RETURN;
  END IF;
  
  -- Get current year totals (YTD)
  SELECT * INTO v_current FROM get_total_campus_emissions(1, p_current_year, p_current_month, p_current_year);
  
  RETURN QUERY
  SELECT 
    v_baseline.baseline_year,
    v_baseline.total_emissions_tonnes,
    v_current.total_emissions_tonnes,
    (v_current.total_emissions_tonnes - v_baseline.total_emissions_tonnes)::DECIMAL AS change_tonnes,
    CASE 
      WHEN v_baseline.total_emissions_tonnes > 0 
      THEN ((v_current.total_emissions_tonnes - v_baseline.total_emissions_tonnes) / v_baseline.total_emissions_tonnes * 100)::DECIMAL
      ELSE 0::DECIMAL
    END AS change_percentage,
    CASE 
      WHEN v_current.total_emissions_tonnes < v_baseline.total_emissions_tonnes THEN 'Reduced'
      WHEN v_current.total_emissions_tonnes > v_baseline.total_emissions_tonnes THEN 'Increased'
      ELSE 'Stable'
    END AS status;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. Function: Emission Intensity per Student
-- ============================================
CREATE OR REPLACE FUNCTION get_emission_intensity_per_student(
  p_start_month INTEGER,
  p_start_year INTEGER,
  p_end_month INTEGER,
  p_end_year INTEGER
)
RETURNS TABLE (
  total_emissions_tonnes DECIMAL,
  total_students INTEGER,
  emissions_per_student_kg DECIMAL
) AS $$
DECLARE
  v_emissions RECORD;
  v_student_count INTEGER;
BEGIN
  -- Get total emissions
  SELECT * INTO v_emissions FROM get_total_campus_emissions(p_start_month, p_start_year, p_end_month, p_end_year);
  
  -- Get total student count across all departments
  SELECT COALESCE(SUM(student_count), 0) INTO v_student_count FROM departments;
  
  RETURN QUERY
  SELECT 
    v_emissions.total_emissions_tonnes,
    v_student_count,
    CASE 
      WHEN v_student_count > 0 
      THEN (v_emissions.total_emissions_tonnes * 1000 / v_student_count)::DECIMAL
      ELSE 0::DECIMAL
    END AS emissions_per_student_kg;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. Function: Carbon Hotspot Detection
-- ============================================
CREATE OR REPLACE FUNCTION detect_carbon_hotspots(
  p_start_month INTEGER,
  p_start_year INTEGER,
  p_end_month INTEGER,
  p_end_year INTEGER,
  p_top_n INTEGER DEFAULT 5
)
RETURNS TABLE (
  rank INTEGER,
  scope TEXT,
  category_name TEXT,
  total_tonnes DECIMAL,
  percentage_of_total DECIMAL,
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH grand_total AS (
    SELECT SUM(calculated_emission_tonnes) AS total
    FROM emission_records
    WHERE (year > p_start_year OR (year = p_start_year AND month >= p_start_month))
      AND (year < p_end_year OR (year = p_end_year AND month <= p_end_month))
  )
  SELECT 
    ROW_NUMBER() OVER (ORDER BY SUM(er.calculated_emission_tonnes) DESC)::INTEGER AS rank,
    er.scope,
    er.category_name,
    SUM(er.calculated_emission_tonnes)::DECIMAL AS total_tonnes,
    CASE 
      WHEN (SELECT total FROM grand_total) > 0 
      THEN (SUM(er.calculated_emission_tonnes) / (SELECT total FROM grand_total) * 100)::DECIMAL
      ELSE 0::DECIMAL
    END AS percentage_of_total,
    CASE 
      WHEN er.scope = 'Scope1' AND er.category_name LIKE '%Diesel%' THEN 'Consider renewable energy alternatives or fuel switching'
      WHEN er.scope = 'Scope2' AND er.category_name LIKE '%Electricity%' THEN 'Install solar panels or improve energy efficiency'
      WHEN er.scope = 'Scope3' AND er.category_name LIKE '%Commute%' THEN 'Promote carpooling, public transport, or electric shuttles'
      WHEN er.category_name LIKE '%Waste%' THEN 'Implement waste reduction and recycling programs'
      ELSE 'Monitor and implement reduction strategies'
    END AS recommendation
  FROM emission_records er
  WHERE (er.year > p_start_year OR (er.year = p_start_year AND er.month >= p_start_month))
    AND (er.year < p_end_year OR (er.year = p_end_year AND er.month <= p_end_month))
  GROUP BY er.scope, er.category_name
  ORDER BY total_tonnes DESC
  LIMIT p_top_n;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. Grant Permissions
-- ============================================
GRANT EXECUTE ON FUNCTION get_current_emission_factor(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION insert_emission_record(INTEGER, INTEGER, UUID, DECIMAL, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_campus_emissions(INTEGER, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_scope_breakdown(INTEGER, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_category_breakdown(TEXT, INTEGER, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_dominant_scope(INTEGER, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_trend(INTEGER, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION compare_to_baseline(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_emission_intensity_per_student(INTEGER, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION detect_carbon_hotspots(INTEGER, INTEGER, INTEGER, INTEGER, INTEGER) TO authenticated;
