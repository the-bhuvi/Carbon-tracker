-- Import Historical Data (July 2024 - June 2025)
-- This migration imports 12 months of carbon emission data

-- First, ensure we have a system admin user and department
DO $$
DECLARE
  v_dept_id UUID;
  v_user_id UUID;
BEGIN
  -- Get or create Institution-wide department
  SELECT id INTO v_dept_id FROM departments WHERE name = 'Institution-wide' LIMIT 1;
  
  IF v_dept_id IS NULL THEN
    INSERT INTO departments (name, student_count)
    VALUES ('Institution-wide', 10000)
    RETURNING id INTO v_dept_id;
  END IF;

  -- Get or create system admin user
  SELECT id INTO v_user_id FROM users WHERE email = 'admin@institution.edu' LIMIT 1;
  
  IF v_user_id IS NULL THEN
    INSERT INTO users (name, email, role, department_id)
    VALUES ('System Admin', 'admin@institution.edu', 'admin', v_dept_id)
    RETURNING id INTO v_user_id;
  END IF;

  -- Insert historical data for each month
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
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Historical data imported successfully for 12 months (July 2024 - June 2025)';
END $$;
