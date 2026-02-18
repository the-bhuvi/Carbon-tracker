-- ======================================================
-- COMPLETE FIX: Remove PNG and Load Historical Data
-- Run this entire script in Supabase SQL Editor
-- ======================================================

-- STEP 1: Update the calculation trigger to remove PNG references
DROP TRIGGER IF EXISTS calculate_carbon_on_insert ON carbon_submissions;
DROP FUNCTION IF EXISTS calculate_carbon_metrics();

CREATE OR REPLACE FUNCTION calculate_carbon_metrics()
RETURNS TRIGGER AS $$
DECLARE
  factors RECORD;
  scope1 DECIMAL(12, 4);
  scope2 DECIMAL(12, 4);
  scope3 DECIMAL(12, 4);
  total DECIMAL(12, 4);
  score TEXT;
  trees DECIMAL(10, 2);
  suggestion_list TEXT[];
BEGIN
  -- Get emission factors
  SELECT * INTO factors FROM emission_factors LIMIT 1;
  
  -- SCOPE 1: Direct emissions from combustion (removed PNG)
  scope1 := 
    (COALESCE(NEW.diesel_liters, 0) * 2.68) +
    (COALESCE(NEW.lpg_kg, 0) * 2.98);
  
  -- SCOPE 2: Indirect emissions from purchased electricity
  scope2 := 
    (COALESCE(NEW.electricity_kwh, 0) * 0.82);
  
  -- SCOPE 3: Other indirect emissions
  scope3 := 
    (COALESCE(NEW.petrol_liters, 0) * 2.31) +
    (COALESCE(NEW.travel_km, 0) * 0.12) +
    (COALESCE(NEW.water_liters, 0) * 0.0003) +
    (COALESCE(NEW.ewaste_kg, 0) * 1.5) +
    (COALESCE(NEW.paper_kg, 0) * 1.7) +
    (COALESCE(NEW.plastic_kg, 0) * 2.0) +
    (COALESCE(NEW.organic_waste_kg, 0) * 0.3);
  
  -- Calculate total
  total := scope1 + scope2 + scope3;
  
  -- Determine carbon score
  IF total < 5000 THEN
    score := 'Green';
  ELSIF total < 15000 THEN
    score := 'Moderate';
  ELSE
    score := 'High';
  END IF;
  
  -- Calculate trees needed to offset
  trees := total / 21.77;
  
  -- Generate suggestions
  suggestion_list := ARRAY[]::TEXT[];
  
  IF NEW.electricity_kwh > 5000 THEN
    suggestion_list := array_append(suggestion_list, 'High electricity usage - consider energy efficiency measures');
  END IF;
  
  IF NEW.diesel_liters > 200 THEN
    suggestion_list := array_append(suggestion_list, 'High diesel consumption - explore cleaner alternatives');
  END IF;
  
  IF NEW.travel_km > 30000 THEN
    suggestion_list := array_append(suggestion_list, 'High travel emissions - promote carpooling and public transport');
  END IF;
  
  -- Set calculated values
  NEW.scope1_emissions_kg := scope1;
  NEW.scope2_emissions_kg := scope2;
  NEW.scope3_emissions_kg := scope3;
  NEW.total_carbon_kg := total;
  NEW.carbon_score := score;
  NEW.trees_to_offset := trees;
  NEW.suggestions := suggestion_list;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_carbon_on_insert
BEFORE INSERT OR UPDATE ON carbon_submissions
FOR EACH ROW EXECUTE FUNCTION calculate_carbon_metrics();

-- STEP 2: Remove PNG column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'carbon_submissions' 
    AND column_name IN ('png_m3', 'png_cubic_meters')
  ) THEN
    ALTER TABLE carbon_submissions DROP COLUMN IF EXISTS png_m3;
    ALTER TABLE carbon_submissions DROP COLUMN IF EXISTS png_cubic_meters;
    RAISE NOTICE '✅ Removed PNG columns';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'emission_factors' 
    AND column_name = 'png_factor'
  ) THEN
    ALTER TABLE emission_factors DROP COLUMN IF EXISTS png_factor;
    RAISE NOTICE '✅ Removed PNG factor column';
  END IF;
END $$;

-- STEP 3: Import historical data
DO $$
DECLARE
  v_dept_id UUID;
  v_user_id UUID;
BEGIN
  -- Get or create Institution-wide department
  SELECT id INTO v_dept_id 
  FROM departments 
  WHERE name = 'Institution-wide' 
  LIMIT 1;
  
  IF v_dept_id IS NULL THEN
    INSERT INTO departments (name, student_count, building_area)
    VALUES ('Institution-wide', 10000, 50000)
    RETURNING id INTO v_dept_id;
    RAISE NOTICE '✅ Created Institution-wide department';
  ELSE
    RAISE NOTICE '✅ Using existing department';
  END IF;

  -- Get or create admin user
  SELECT id INTO v_user_id 
  FROM users 
  WHERE email = 'admin@institution.edu' 
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    INSERT INTO users (name, email, role, department_id)
    VALUES ('System Admin', 'admin@institution.edu', 'admin', v_dept_id)
    RETURNING id INTO v_user_id;
    RAISE NOTICE '✅ Created admin user';
  ELSE
    RAISE NOTICE '✅ Using existing user';
  END IF;

  -- Insert historical data (July 2024 - June 2025)
  INSERT INTO carbon_submissions (
    user_id, department_id, submission_date,
    electricity_kwh, diesel_liters, petrol_liters, lpg_kg, travel_km,
    water_liters, paper_kg, plastic_kg, ewaste_kg, organic_waste_kg
  ) VALUES
    (v_user_id, v_dept_id, '2024-07-01', 30416, 600, 525, 133, 40000, 0, 0, 0, 0, 0),
    (v_user_id, v_dept_id, '2024-08-01', 76038, 1200, 525, 285, 40000, 0, 0, 0, 0, 0),
    (v_user_id, v_dept_id, '2024-09-01', 82006, 1200, 525, 285, 40000, 0, 0, 0, 0, 0),
    (v_user_id, v_dept_id, '2024-10-01', 89221, 400, 525, 285, 40000, 0, 0, 0, 0, 0),
    (v_user_id, v_dept_id, '2024-11-01', 85703, 600, 525, 228, 40000, 0, 0, 0, 0, 0),
    (v_user_id, v_dept_id, '2024-12-01', 83948, 300, 525, 247, 40000, 0, 0, 0, 0, 0),
    (v_user_id, v_dept_id, '2025-01-01', 71298, 400, 525, 190, 40000, 0, 0, 0, 0, 0),
    (v_user_id, v_dept_id, '2025-02-01', 65174, 400, 525, 285, 40000, 0, 0, 0, 0, 0),
    (v_user_id, v_dept_id, '2025-03-01', 84851, 400, 525, 285, 40000, 0, 0, 0, 0, 0),
    (v_user_id, v_dept_id, '2025-04-01', 91594, 400, 525, 228, 40000, 0, 0, 0, 0, 0),
    (v_user_id, v_dept_id, '2025-05-01', 94464, 300, 525, 247, 40000, 0, 0, 0, 0, 0),
    (v_user_id, v_dept_id, '2025-06-01', 78637, 400, 175, 133, 40000, 0, 0, 0, 0, 0)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Imported 12 months of historical data';
END $$;

-- STEP 4: Refresh materialized views
REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_summary;
REFRESH MATERIALIZED VIEW CONCURRENTLY academic_year_summary;
REFRESH MATERIALIZED VIEW CONCURRENTLY factor_breakdown;

-- STEP 5: Verify the data
SELECT 
  '🎉 VERIFICATION' as status,
  COUNT(*) as total_records,
  MIN(submission_date) as earliest,
  MAX(submission_date) as latest,
  ROUND(SUM(total_carbon_kg)::numeric, 2) as total_carbon_kg
FROM carbon_submissions
WHERE submission_date >= '2024-07-01' AND submission_date <= '2025-06-30';

-- Show monthly breakdown
SELECT 
  TO_CHAR(submission_date, 'YYYY-MM') as month,
  electricity_kwh,
  ROUND(total_carbon_kg::numeric, 2) as total_carbon_kg,
  carbon_score
FROM carbon_submissions
WHERE submission_date >= '2024-07-01' AND submission_date <= '2025-06-30'
ORDER BY submission_date;
