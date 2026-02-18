-- Institutional Monthly Audit System
-- Transform from department-based to institutional-level factor-wise monthly tracking
-- Start from July 2024

-- ============================================
-- 1. Enrolled Students Configuration
-- ============================================
CREATE TABLE IF NOT EXISTS enrolled_students_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year VARCHAR(9) NOT NULL UNIQUE, -- Format: "2024-2025"
  total_students INTEGER NOT NULL CHECK (total_students > 0),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. Monthly Audit Data (Core Data Table)
-- ============================================
CREATE TABLE IF NOT EXISTS monthly_audit_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2024),
  factor_name VARCHAR(255) NOT NULL,
  activity_data DECIMAL(12, 4) NOT NULL,
  emission_factor DECIMAL(10, 6) NOT NULL,
  calculated_co2e_kg DECIMAL(14, 2) NOT NULL GENERATED ALWAYS AS (activity_data * emission_factor) STORED,
  unit VARCHAR(50),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_month_factor UNIQUE (year, month, factor_name)
);

-- ============================================
-- 3. Monthly Summary (Aggregated View)
-- ============================================
CREATE TABLE IF NOT EXISTS monthly_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2024),
  total_emission_kg DECIMAL(14, 2) NOT NULL,
  per_capita_kg DECIMAL(10, 4) NOT NULL,
  student_count INTEGER NOT NULL,
  factor_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_month_summary UNIQUE (year, month)
);

-- ============================================
-- 4. Academic Year Summary (July-June Aggregations)
-- ============================================
CREATE TABLE IF NOT EXISTS academic_year_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year VARCHAR(9) NOT NULL UNIQUE, -- Format: "2024-2025"
  total_emission_kg DECIMAL(14, 2) NOT NULL,
  per_capita_kg DECIMAL(10, 4) NOT NULL,
  avg_students INTEGER NOT NULL,
  highest_factor_name VARCHAR(255),
  highest_factor_emission_kg DECIMAL(14, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. Carbon Offsets (Reforestation, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS carbon_offsets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2024),
  offset_type VARCHAR(100) NOT NULL, -- 'reforestation', 'renewable_energy', 'carbon_credit', etc.
  quantity DECIMAL(12, 4) NOT NULL,
  unit VARCHAR(50),
  co2e_offset_kg DECIMAL(14, 2) NOT NULL,
  source_description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. Carbon Reductions (Efficiency Improvements)
-- ============================================
CREATE TABLE IF NOT EXISTS carbon_reductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2024),
  reduction_type VARCHAR(100) NOT NULL, -- 'energy_efficiency', 'travel_reduction', 'waste_reduction', etc.
  baseline_co2e_kg DECIMAL(14, 2) NOT NULL,
  actual_co2e_kg DECIMAL(14, 2) NOT NULL,
  reduction_co2e_kg DECIMAL(14, 2) GENERATED ALWAYS AS (baseline_co2e_kg - actual_co2e_kg) STORED,
  initiative_description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE enrolled_students_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_audit_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_year_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_offsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_reductions ENABLE ROW LEVEL SECURITY;

-- Policies for enrolled_students_config
CREATE POLICY "View enrolled students config" ON enrolled_students_config
  FOR SELECT USING (true);

CREATE POLICY "Manage enrolled students config (admin only)" ON enrolled_students_config
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policies for monthly_audit_data
CREATE POLICY "View monthly audit data" ON monthly_audit_data
  FOR SELECT USING (true);

CREATE POLICY "Manage monthly audit data (admin only)" ON monthly_audit_data
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policies for monthly_summary
CREATE POLICY "View monthly summary" ON monthly_summary
  FOR SELECT USING (true);

CREATE POLICY "Manage monthly summary (admin only)" ON monthly_summary
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policies for academic_year_summary
CREATE POLICY "View academic year summary" ON academic_year_summary
  FOR SELECT USING (true);

CREATE POLICY "Manage academic year summary (admin only)" ON academic_year_summary
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policies for carbon_offsets
CREATE POLICY "View carbon offsets" ON carbon_offsets
  FOR SELECT USING (true);

CREATE POLICY "Manage carbon offsets (admin only)" ON carbon_offsets
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policies for carbon_reductions
CREATE POLICY "View carbon reductions" ON carbon_reductions
  FOR SELECT USING (true);

CREATE POLICY "Manage carbon reductions (admin only)" ON carbon_reductions
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================
-- 8. Indexes for Performance
-- ============================================
CREATE INDEX idx_monthly_audit_year_month ON monthly_audit_data(year, month);
CREATE INDEX idx_monthly_audit_factor ON monthly_audit_data(factor_name);
CREATE INDEX idx_monthly_summary_year_month ON monthly_summary(year, month);
CREATE INDEX idx_academic_year_summary_year ON academic_year_summary(academic_year);
CREATE INDEX idx_carbon_offsets_year_month ON carbon_offsets(year, month);
CREATE INDEX idx_carbon_reductions_year_month ON carbon_reductions(year, month);

-- ============================================
-- 9. Trigger to Update Timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_enrolled_students_config_timestamp
  BEFORE UPDATE ON enrolled_students_config
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_monthly_audit_data_timestamp
  BEFORE UPDATE ON monthly_audit_data
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_monthly_summary_timestamp
  BEFORE UPDATE ON monthly_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_academic_year_summary_timestamp
  BEFORE UPDATE ON academic_year_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_carbon_offsets_timestamp
  BEFORE UPDATE ON carbon_offsets
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_carbon_reductions_timestamp
  BEFORE UPDATE ON carbon_reductions
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- ============================================
-- 10. Helper Functions
-- ============================================

-- Get current academic year from date
CREATE OR REPLACE FUNCTION get_academic_year(from_date DATE DEFAULT CURRENT_DATE)
RETURNS VARCHAR(9) AS $$
DECLARE
  current_year INT;
  current_month INT;
BEGIN
  current_year := EXTRACT(YEAR FROM from_date)::INT;
  current_month := EXTRACT(MONTH FROM from_date)::INT;
  
  -- Academic year runs July to June
  IF current_month >= 7 THEN
    RETURN current_year || '-' || (current_year + 1);
  ELSE
    RETURN (current_year - 1) || '-' || current_year;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Refresh monthly summary for a specific month
CREATE OR REPLACE FUNCTION refresh_monthly_summary(p_year INT, p_month INT)
RETURNS VOID AS $$
DECLARE
  v_total_emission DECIMAL(14, 2);
  v_student_count INT;
  v_per_capita DECIMAL(10, 4);
  v_factor_count INT;
BEGIN
  -- Get total emission for the month
  SELECT COALESCE(SUM(calculated_co2e_kg), 0) INTO v_total_emission
  FROM monthly_audit_data
  WHERE year = p_year AND month = p_month;
  
  -- Get student count for the academic year
  SELECT total_students INTO v_student_count
  FROM enrolled_students_config
  WHERE academic_year = get_academic_year(make_date(p_year, p_month, 1))
  LIMIT 1;
  
  -- Default to 1000 if no config found
  IF v_student_count IS NULL THEN
    v_student_count := 1000;
  END IF;
  
  -- Calculate per capita
  v_per_capita := ROUND(CAST(v_total_emission AS NUMERIC) / v_student_count, 4);
  
  -- Count factors
  SELECT COUNT(DISTINCT factor_name) INTO v_factor_count
  FROM monthly_audit_data
  WHERE year = p_year AND month = p_month;
  
  -- Insert or update summary
  INSERT INTO monthly_summary (month, year, total_emission_kg, per_capita_kg, student_count, factor_count)
  VALUES (p_month, p_year, v_total_emission, v_per_capita, v_student_count, v_factor_count)
  ON CONFLICT (year, month) DO UPDATE SET
    total_emission_kg = v_total_emission,
    per_capita_kg = v_per_capita,
    student_count = v_student_count,
    factor_count = v_factor_count,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Refresh academic year summary
CREATE OR REPLACE FUNCTION refresh_academic_year_summary(p_academic_year VARCHAR(9))
RETURNS VOID AS $$
DECLARE
  v_total_emission DECIMAL(14, 2);
  v_avg_students INT;
  v_per_capita DECIMAL(10, 4);
  v_highest_factor VARCHAR(255);
  v_highest_emission DECIMAL(14, 2);
  v_start_year INT;
  v_end_year INT;
BEGIN
  -- Parse academic year
  v_start_year := CAST(SPLIT_PART(p_academic_year, '-', 1) AS INT);
  v_end_year := CAST(SPLIT_PART(p_academic_year, '-', 2) AS INT);
  
  -- Get total emission for academic year (July to June)
  SELECT COALESCE(SUM(calculated_co2e_kg), 0) INTO v_total_emission
  FROM monthly_audit_data
  WHERE (year = v_start_year AND month >= 7) OR (year = v_end_year AND month <= 6);
  
  -- Get average student count
  SELECT total_students INTO v_avg_students
  FROM enrolled_students_config
  WHERE academic_year = p_academic_year
  LIMIT 1;
  
  IF v_avg_students IS NULL THEN
    v_avg_students := 1000;
  END IF;
  
  -- Calculate per capita
  v_per_capita := ROUND(CAST(v_total_emission AS NUMERIC) / v_avg_students, 4);
  
  -- Get highest emission factor
  SELECT factor_name, SUM(calculated_co2e_kg) AS total
  INTO v_highest_factor, v_highest_emission
  FROM monthly_audit_data
  WHERE (year = v_start_year AND month >= 7) OR (year = v_end_year AND month <= 6)
  GROUP BY factor_name
  ORDER BY total DESC
  LIMIT 1;
  
  -- Insert or update summary
  INSERT INTO academic_year_summary (
    academic_year, total_emission_kg, per_capita_kg, avg_students,
    highest_factor_name, highest_factor_emission_kg
  ) VALUES (
    p_academic_year, v_total_emission, v_per_capita, v_avg_students,
    v_highest_factor, v_highest_emission
  )
  ON CONFLICT (academic_year) DO UPDATE SET
    total_emission_kg = v_total_emission,
    per_capita_kg = v_per_capita,
    avg_students = v_avg_students,
    highest_factor_name = v_highest_factor,
    highest_factor_emission_kg = v_highest_emission,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Calculate neutrality percentage for a month
CREATE OR REPLACE FUNCTION calculate_monthly_neutrality(p_year INT, p_month INT)
RETURNS DECIMAL(5, 2) AS $$
DECLARE
  v_total_emission DECIMAL(14, 2);
  v_total_offset DECIMAL(14, 2);
  v_total_reduction DECIMAL(14, 2);
  v_neutrality DECIMAL(5, 2);
BEGIN
  -- Get total emission
  SELECT COALESCE(SUM(calculated_co2e_kg), 0) INTO v_total_emission
  FROM monthly_audit_data
  WHERE year = p_year AND month = p_month;
  
  -- Get total offsets
  SELECT COALESCE(SUM(co2e_offset_kg), 0) INTO v_total_offset
  FROM carbon_offsets
  WHERE year = p_year AND month = p_month;
  
  -- Get total reductions
  SELECT COALESCE(SUM(reduction_co2e_kg), 0) INTO v_total_reduction
  FROM carbon_reductions
  WHERE year = p_year AND month = p_month;
  
  -- Calculate neutrality percentage
  IF v_total_emission = 0 THEN
    RETURN 0;
  END IF;
  
  v_neutrality := ROUND(CAST((v_total_offset + v_total_reduction) * 100 AS NUMERIC) / v_total_emission, 2);
  
  -- Cap at 100%
  IF v_neutrality > 100 THEN
    v_neutrality := 100;
  END IF;
  
  RETURN v_neutrality;
END;
$$ LANGUAGE plpgsql;

-- Calculate neutrality percentage for an academic year
CREATE OR REPLACE FUNCTION calculate_academic_year_neutrality(p_academic_year VARCHAR(9))
RETURNS DECIMAL(5, 2) AS $$
DECLARE
  v_total_emission DECIMAL(14, 2);
  v_total_offset DECIMAL(14, 2);
  v_total_reduction DECIMAL(14, 2);
  v_neutrality DECIMAL(5, 2);
  v_start_year INT;
  v_end_year INT;
BEGIN
  v_start_year := CAST(SPLIT_PART(p_academic_year, '-', 1) AS INT);
  v_end_year := CAST(SPLIT_PART(p_academic_year, '-', 2) AS INT);
  
  -- Get total emission
  SELECT COALESCE(SUM(calculated_co2e_kg), 0) INTO v_total_emission
  FROM monthly_audit_data
  WHERE (year = v_start_year AND month >= 7) OR (year = v_end_year AND month <= 6);
  
  -- Get total offsets
  SELECT COALESCE(SUM(co2e_offset_kg), 0) INTO v_total_offset
  FROM carbon_offsets
  WHERE (year = v_start_year AND month >= 7) OR (year = v_end_year AND month <= 6);
  
  -- Get total reductions
  SELECT COALESCE(SUM(reduction_co2e_kg), 0) INTO v_total_reduction
  FROM carbon_reductions
  WHERE (year = v_start_year AND month >= 7) OR (year = v_end_year AND month <= 6);
  
  -- Calculate neutrality percentage
  IF v_total_emission = 0 THEN
    RETURN 0;
  END IF;
  
  v_neutrality := ROUND(CAST((v_total_offset + v_total_reduction) * 100 AS NUMERIC) / v_total_emission, 2);
  
  IF v_neutrality > 100 THEN
    v_neutrality := 100;
  END IF;
  
  RETURN v_neutrality;
END;
$$ LANGUAGE plpgsql;

-- Get factor breakdown for a period
CREATE OR REPLACE FUNCTION get_factor_breakdown(p_year INT, p_month INT DEFAULT NULL)
RETURNS TABLE(
  factor_name VARCHAR(255),
  total_co2e_kg DECIMAL(14, 2),
  percentage DECIMAL(5, 2)
) AS $$
DECLARE
  v_total DECIMAL(14, 2);
BEGIN
  -- Get total emission
  IF p_month IS NULL THEN
    SELECT COALESCE(SUM(calculated_co2e_kg), 0) INTO v_total
    FROM monthly_audit_data
    WHERE year = p_year;
  ELSE
    SELECT COALESCE(SUM(calculated_co2e_kg), 0) INTO v_total
    FROM monthly_audit_data
    WHERE year = p_year AND month = p_month;
  END IF;
  
  RETURN QUERY
  SELECT
    m.factor_name,
    SUM(m.calculated_co2e_kg) as total_co2e,
    CASE WHEN v_total = 0 THEN 0
         ELSE ROUND(CAST(SUM(m.calculated_co2e_kg) * 100 AS NUMERIC) / v_total, 2)
    END as pct
  FROM monthly_audit_data m
  WHERE m.year = p_year AND (p_month IS NULL OR m.month = p_month)
  GROUP BY m.factor_name
  ORDER BY total_co2e DESC;
END;
$$ LANGUAGE plpgsql;

-- Seed initial data for current academic year (if needed)
INSERT INTO enrolled_students_config (academic_year, total_students, notes)
VALUES ('2024-2025', 1000, 'Initial enrollment configuration')
ON CONFLICT (academic_year) DO NOTHING;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
