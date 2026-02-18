-- ======================================================
-- HISTORICAL DATA IMPORT (July 2024 - June 2025)
-- Run this in Supabase SQL Editor
-- ======================================================

-- Step 1: Get or create the Institution-wide department
DO $$
DECLARE
  v_dept_id UUID;
  v_user_id UUID;
BEGIN
  -- Get existing department or create it
  SELECT id INTO v_dept_id 
  FROM departments 
  WHERE name = 'Institution-wide' 
  LIMIT 1;
  
  IF v_dept_id IS NULL THEN
    INSERT INTO departments (name, student_count, building_area)
    VALUES ('Institution-wide', 10000, 50000)
    RETURNING id INTO v_dept_id;
    
    RAISE NOTICE 'Created department with ID: %', v_dept_id;
  ELSE
    RAISE NOTICE 'Using existing department with ID: %', v_dept_id;
  END IF;

  -- Get existing admin user or create it
  SELECT id INTO v_user_id 
  FROM users 
  WHERE email = 'admin@institution.edu' 
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    INSERT INTO users (name, email, role, department_id)
    VALUES ('System Admin', 'admin@institution.edu', 'admin', v_dept_id)
    RETURNING id INTO v_user_id;
    
    RAISE NOTICE 'Created admin user with ID: %', v_user_id;
  ELSE
    RAISE NOTICE 'Using existing admin user with ID: %', v_user_id;
  END IF;

  -- Step 2: Insert historical carbon emission data
  RAISE NOTICE 'Inserting historical data...';

  INSERT INTO carbon_submissions (
    user_id, 
    department_id, 
    submission_date,
    electricity_kwh, 
    diesel_liters, 
    petrol_liters, 
    lpg_kg, 
    travel_km, 
    water_liters, 
    paper_kg, 
    plastic_kg, 
    ewaste_kg, 
    organic_waste_kg
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
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✅ Successfully imported 12 months of historical data!';
  
  -- Show summary
  RAISE NOTICE '📊 Data Summary:';
  RAISE NOTICE '   - Period: July 2024 to June 2025';
  RAISE NOTICE '   - Total Records: 12 monthly submissions';
  RAISE NOTICE '   - Department: Institution-wide';
  RAISE NOTICE '   - User: admin@institution.edu';
  
END $$;

-- Verify the import
SELECT 
  TO_CHAR(submission_date, 'YYYY-MM') as month,
  electricity_kwh,
  diesel_liters,
  petrol_liters,
  lpg_kg,
  travel_km,
  total_carbon_kg
FROM carbon_submissions
WHERE submission_date >= '2024-07-01' 
  AND submission_date <= '2025-06-30'
ORDER BY submission_date;
