-- Phase 6: Department Carbon Budget System
-- ⚠️ PREREQUISITE: Migration 016 must be applied FIRST (uses scope columns)
-- Implements per-capita carbon budgets for departments

-- Add dependency check
DO $$
BEGIN
  -- Check if scope columns exist (from migration 016)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'carbon_submissions' 
    AND column_name = 'scope1_emissions_kg'
  ) THEN
    RAISE EXCEPTION 'Migration 016 must be applied first! Scope columns needed for budget calculations.';
  END IF;
END $$;

-- 1. Add carbon_budget column to departments table
ALTER TABLE departments
ADD COLUMN IF NOT EXISTS carbon_budget DECIMAL(12, 2) DEFAULT 0;

-- 2. Function to calculate department budget based on student count
-- Formula: 300 kg CO2 per student per year
CREATE OR REPLACE FUNCTION calculate_department_budget(dept_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  student_cnt INTEGER;
  budget DECIMAL;
BEGIN
  SELECT student_count INTO student_cnt
  FROM departments
  WHERE id = dept_id;
  
  IF student_cnt IS NULL OR student_cnt = 0 THEN
    RETURN 0;
  END IF;
  
  budget := student_cnt * 300;
  
  -- Update the department's budget
  UPDATE departments
  SET carbon_budget = budget
  WHERE id = dept_id;
  
  RETURN budget;
END;
$$ LANGUAGE plpgsql;

-- 3. Function to check department budget status
CREATE OR REPLACE FUNCTION check_department_budget(dept_id UUID, target_year INTEGER)
RETURNS TABLE (
  department_id UUID,
  department_name TEXT,
  student_count INTEGER,
  allowed_budget DECIMAL,
  current_emissions DECIMAL,
  remaining_budget DECIMAL,
  budget_utilized_percent DECIMAL,
  status TEXT,
  per_capita_emissions DECIMAL
) AS $$
DECLARE
  dept_name TEXT;
  students INTEGER;
  budget DECIMAL;
  emissions DECIMAL;
  remaining DECIMAL;
  utilized_pct DECIMAL;
  budget_status TEXT;
  per_capita DECIMAL;
BEGIN
  -- Get department details
  SELECT name, student_count, carbon_budget
  INTO dept_name, students, budget
  FROM departments
  WHERE id = dept_id;
  
  -- If budget not set, calculate it
  IF budget IS NULL OR budget = 0 THEN
    budget := calculate_department_budget(dept_id);
  END IF;
  
  -- Get current year emissions for department
  SELECT COALESCE(SUM(total_carbon_kg), 0)
  INTO emissions
  FROM carbon_submissions
  WHERE department_id = dept_id
    AND EXTRACT(YEAR FROM submission_date) = target_year;
  
  -- Calculate remaining budget
  remaining := budget - emissions;
  
  -- Calculate utilization percentage
  IF budget > 0 THEN
    utilized_pct := (emissions / budget) * 100;
  ELSE
    utilized_pct := 0;
  END IF;
  
  -- Calculate per capita emissions
  IF students > 0 THEN
    per_capita := emissions / students;
  ELSE
    per_capita := 0;
  END IF;
  
  -- Determine status
  IF utilized_pct <= 70 THEN
    budget_status := 'Green';
  ELSIF utilized_pct <= 100 THEN
    budget_status := 'Yellow';
  ELSE
    budget_status := 'Exceeded';
  END IF;
  
  -- Return results
  RETURN QUERY SELECT 
    dept_id,
    dept_name,
    students,
    budget,
    emissions,
    remaining,
    utilized_pct,
    budget_status,
    per_capita;
END;
$$ LANGUAGE plpgsql;

-- 4. Function to get all department budgets overview
CREATE OR REPLACE FUNCTION get_all_department_budgets(target_year INTEGER)
RETURNS TABLE (
  department_id UUID,
  department_name TEXT,
  student_count INTEGER,
  allowed_budget DECIMAL,
  current_emissions DECIMAL,
  remaining_budget DECIMAL,
  budget_utilized_percent DECIMAL,
  status TEXT,
  per_capita_emissions DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.student_count,
    d.carbon_budget,
    COALESCE(SUM(cs.total_carbon_kg), 0)::DECIMAL,
    (d.carbon_budget - COALESCE(SUM(cs.total_carbon_kg), 0))::DECIMAL,
    CASE 
      WHEN d.carbon_budget > 0 THEN ((COALESCE(SUM(cs.total_carbon_kg), 0) / d.carbon_budget) * 100)::DECIMAL
      ELSE 0::DECIMAL
    END,
    CASE 
      WHEN d.carbon_budget > 0 AND ((COALESCE(SUM(cs.total_carbon_kg), 0) / d.carbon_budget) * 100) <= 70 THEN 'Green'
      WHEN d.carbon_budget > 0 AND ((COALESCE(SUM(cs.total_carbon_kg), 0) / d.carbon_budget) * 100) <= 100 THEN 'Yellow'
      WHEN d.carbon_budget > 0 THEN 'Exceeded'
      ELSE 'Not Set'
    END,
    CASE 
      WHEN d.student_count > 0 THEN (COALESCE(SUM(cs.total_carbon_kg), 0) / d.student_count)::DECIMAL
      ELSE 0::DECIMAL
    END
  FROM departments d
  LEFT JOIN carbon_submissions cs ON d.id = cs.department_id 
    AND EXTRACT(YEAR FROM cs.submission_date) = target_year
  GROUP BY d.id, d.name, d.student_count, d.carbon_budget
  ORDER BY budget_utilized_percent DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger to auto-calculate budget when student_count is updated
CREATE OR REPLACE FUNCTION auto_update_department_budget()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.student_count IS NOT NULL AND NEW.student_count != OLD.student_count THEN
    NEW.carbon_budget := NEW.student_count * 300;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS department_budget_update ON departments;
CREATE TRIGGER department_budget_update
BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION auto_update_department_budget();

-- 6. Backfill budgets for existing departments
UPDATE departments 
SET carbon_budget = student_count * 300 
WHERE student_count IS NOT NULL AND student_count > 0;

-- 7. Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_department_budget(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_department_budget(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_department_budgets(INTEGER) TO authenticated;
