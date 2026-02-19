-- Import Historical Data (July 2025 - January 2026)
-- This migration imports 7 months of carbon emission data

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

  -- Insert data for July 2025 - January 2026
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
    (v_user_id, v_dept_id, '2025-07-01', 81350, 600,  525, 240, 40000, 0, 0, 0, 0, 0),
    (v_user_id, v_dept_id, '2025-08-01', 84500, 1100, 525, 280, 40000, 0, 0, 0, 0, 0),
    (v_user_id, v_dept_id, '2025-09-01', 87800, 1150, 525, 285, 40000, 0, 0, 0, 0, 0),
    (v_user_id, v_dept_id, '2025-10-01', 90200, 450,  525, 275, 40000, 0, 0, 0, 0, 0),
    (v_user_id, v_dept_id, '2025-11-01', 88900, 600,  525, 230, 40000, 0, 0, 0, 0, 0),
    (v_user_id, v_dept_id, '2025-12-01', 86100, 350,  525, 245, 40000, 0, 0, 0, 0, 0),
    (v_user_id, v_dept_id, '2026-01-01', 79200, 400,  525, 200, 40000, 0, 0, 0, 0, 0)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Historical data imported successfully for 7 months (July 2025 - January 2026)';
END $$;
