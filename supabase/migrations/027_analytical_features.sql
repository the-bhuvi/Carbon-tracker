-- ============================================
-- Analytical Features Enhancement
-- ============================================
-- This migration adds professional-level analytical features:
-- 1. Data Confidence Tracking
-- 2. Top Emission Contributors
-- 3. Emission Intensity Metrics
-- 4. Reduction Simulator
-- 5. Net Zero Projection
-- 6. Academic Year Comparison

-- ============================================
-- 1. Add data_confidence column to monthly_audit_data
-- ============================================
DO $$
BEGIN
  -- Add data_confidence column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'monthly_audit_data' 
    AND column_name = 'data_confidence'
  ) THEN
    ALTER TABLE monthly_audit_data 
    ADD COLUMN data_confidence VARCHAR(50) DEFAULT 'Estimated' 
    CHECK (data_confidence IN ('Actual', 'Estimated', 'Not Available'));
  END IF;
END $$;

-- ============================================
-- 2. Add scope classification to monthly_audit_data
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'monthly_audit_data' 
    AND column_name = 'scope'
  ) THEN
    ALTER TABLE monthly_audit_data 
    ADD COLUMN scope VARCHAR(50) DEFAULT 'Scope3' 
    CHECK (scope IN ('Scope1', 'Scope2', 'Scope3'));
  END IF;
END $$;

-- ============================================
-- 3. Create table for emission factor scope mapping
-- ============================================
CREATE TABLE IF NOT EXISTS factor_scope_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factor_name VARCHAR(255) NOT NULL UNIQUE,
  scope VARCHAR(50) NOT NULL CHECK (scope IN ('Scope1', 'Scope2', 'Scope3')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default factor mappings
INSERT INTO factor_scope_mapping (factor_name, scope, description) VALUES
('Electricity', 'Scope2', 'Purchased electricity from grid'),
('Diesel', 'Scope1', 'Diesel fuel consumption'),
('Petrol', 'Scope1', 'Petrol fuel consumption'),
('LPG', 'Scope1', 'Liquefied Petroleum Gas'),
('PNG', 'Scope1', 'Piped Natural Gas'),
('Travel', 'Scope3', 'Business travel emissions'),
('Water', 'Scope3', 'Water consumption and treatment'),
('E-Waste', 'Scope3', 'Electronic waste disposal'),
('Paper', 'Scope3', 'Paper consumption'),
('Plastic', 'Scope3', 'Plastic waste disposal'),
('Organic Waste', 'Scope3', 'Organic waste disposal')
ON CONFLICT (factor_name) DO NOTHING;

-- ============================================
-- 4. Create reduction simulation tracking table
-- ============================================
CREATE TABLE IF NOT EXISTS emission_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2024),
  baseline_total_kg DECIMAL(14, 2) NOT NULL,
  simulated_total_kg DECIMAL(14, 2) NOT NULL,
  reduction_percentage DECIMAL(5, 2) NOT NULL,
  reduction_details JSONB, -- {factor_name: percentage_reduction, ...}
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. Function: Get top emission contributor for a month
-- ============================================
CREATE OR REPLACE FUNCTION get_top_contributor(p_year INTEGER, p_month INTEGER)
RETURNS TABLE(
  factor_name VARCHAR,
  total_co2e_kg DECIMAL,
  percentage_contribution DECIMAL
) AS $$
DECLARE
  v_total_monthly DECIMAL;
BEGIN
  -- Get total emissions for the month
  SELECT COALESCE(SUM(calculated_co2e_kg), 0)
  INTO v_total_monthly
  FROM monthly_audit_data
  WHERE year = p_year AND month = p_month;

  IF v_total_monthly = 0 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    mad.factor_name,
    SUM(mad.calculated_co2e_kg)::DECIMAL AS total_co2e_kg,
    ROUND((SUM(mad.calculated_co2e_kg) / v_total_monthly * 100)::NUMERIC, 2)::DECIMAL AS percentage_contribution
  FROM monthly_audit_data mad
  WHERE mad.year = p_year AND mad.month = p_month
  GROUP BY mad.factor_name
  ORDER BY total_co2e_kg DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 6. Function: Get all factor percentages for a period
-- ============================================
CREATE OR REPLACE FUNCTION get_factor_percentages(p_year INTEGER, p_month INTEGER DEFAULT NULL)
RETURNS TABLE(
  factor_name VARCHAR,
  total_co2e_kg DECIMAL,
  percentage_contribution DECIMAL
) AS $$
DECLARE
  v_total DECIMAL;
BEGIN
  IF p_month IS NULL THEN
    -- Annual view
    SELECT COALESCE(SUM(calculated_co2e_kg), 0)
    INTO v_total
    FROM monthly_audit_data
    WHERE year = p_year;
  ELSE
    -- Monthly view
    SELECT COALESCE(SUM(calculated_co2e_kg), 0)
    INTO v_total
    FROM monthly_audit_data
    WHERE year = p_year AND month = p_month;
  END IF;

  IF v_total = 0 THEN
    RETURN;
  END IF;

  IF p_month IS NULL THEN
    RETURN QUERY
    SELECT 
      mad.factor_name,
      SUM(mad.calculated_co2e_kg)::DECIMAL AS total_co2e_kg,
      ROUND((SUM(mad.calculated_co2e_kg) / v_total * 100)::NUMERIC, 2)::DECIMAL AS percentage_contribution
    FROM monthly_audit_data mad
    WHERE mad.year = p_year
    GROUP BY mad.factor_name
    ORDER BY total_co2e_kg DESC;
  ELSE
    RETURN QUERY
    SELECT 
      mad.factor_name,
      SUM(mad.calculated_co2e_kg)::DECIMAL AS total_co2e_kg,
      ROUND((SUM(mad.calculated_co2e_kg) / v_total * 100)::NUMERIC, 2)::DECIMAL AS percentage_contribution
    FROM monthly_audit_data mad
    WHERE mad.year = p_year AND mad.month = p_month
    GROUP BY mad.factor_name
    ORDER BY total_co2e_kg DESC;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 7. Function: Calculate emission intensity metrics
-- ============================================
CREATE OR REPLACE FUNCTION get_emission_intensity(
  p_year INTEGER, 
  p_month INTEGER DEFAULT NULL
)
RETURNS TABLE(
  total_emissions_kg DECIMAL,
  total_students INTEGER,
  co2_per_student_kg DECIMAL,
  scope1_kg DECIMAL,
  scope2_kg DECIMAL,
  scope3_kg DECIMAL
) AS $$
DECLARE
  v_total_emissions DECIMAL;
  v_students INTEGER;
  v_scope1 DECIMAL;
  v_scope2 DECIMAL;
  v_scope3 DECIMAL;
BEGIN
  -- Get student count for the academic year
  SELECT COALESCE(total_students, 0)
  INTO v_students
  FROM enrolled_students_config
  WHERE academic_year = CASE 
    WHEN p_month >= 7 THEN p_year || '-' || (p_year + 1)
    ELSE (p_year - 1) || '-' || p_year
  END
  ORDER BY created_at DESC
  LIMIT 1;

  IF p_month IS NULL THEN
    -- Annual view
    SELECT 
      COALESCE(SUM(calculated_co2e_kg), 0),
      COALESCE(SUM(CASE WHEN COALESCE(scope, 'Scope3') = 'Scope1' THEN calculated_co2e_kg ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN COALESCE(scope, 'Scope3') = 'Scope2' THEN calculated_co2e_kg ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN COALESCE(scope, 'Scope3') = 'Scope3' THEN calculated_co2e_kg ELSE 0 END), 0)
    INTO v_total_emissions, v_scope1, v_scope2, v_scope3
    FROM monthly_audit_data
    WHERE year = p_year;
  ELSE
    -- Monthly view
    SELECT 
      COALESCE(SUM(calculated_co2e_kg), 0),
      COALESCE(SUM(CASE WHEN COALESCE(scope, 'Scope3') = 'Scope1' THEN calculated_co2e_kg ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN COALESCE(scope, 'Scope3') = 'Scope2' THEN calculated_co2e_kg ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN COALESCE(scope, 'Scope3') = 'Scope3' THEN calculated_co2e_kg ELSE 0 END), 0)
    INTO v_total_emissions, v_scope1, v_scope2, v_scope3
    FROM monthly_audit_data
    WHERE year = p_year AND month = p_month;
  END IF;

  RETURN QUERY
  SELECT 
    v_total_emissions,
    v_students,
    CASE WHEN v_students > 0 THEN ROUND((v_total_emissions / v_students)::NUMERIC, 2)::DECIMAL ELSE 0 END,
    v_scope1,
    v_scope2,
    v_scope3;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 8. Function: Simulate emission reduction
-- ============================================
CREATE OR REPLACE FUNCTION simulate_emission_reduction(
  p_year INTEGER,
  p_month INTEGER,
  p_reduction_json JSONB -- {factor_name: percentage_reduction}
)
RETURNS TABLE(
  baseline_total_kg DECIMAL,
  simulated_total_kg DECIMAL,
  total_reduction_kg DECIMAL,
  reduction_percentage DECIMAL
) AS $$
DECLARE
  v_baseline DECIMAL;
  v_simulated DECIMAL;
  v_factor_name VARCHAR;
  v_reduction_pct DECIMAL;
BEGIN
  -- Calculate baseline
  SELECT COALESCE(SUM(calculated_co2e_kg), 0)
  INTO v_baseline
  FROM monthly_audit_data
  WHERE year = p_year AND month = p_month;

  v_simulated := v_baseline;

  -- Apply reductions for each factor in the JSON
  FOR v_factor_name, v_reduction_pct IN
    SELECT jsonb_object_keys(p_reduction_json), jsonb_extract_path_text(p_reduction_json, jsonb_object_keys(p_reduction_json))::DECIMAL
    FROM jsonb_object_keys(p_reduction_json) keys
  LOOP
    -- Subtract the reduction amount
    v_simulated := v_simulated - (
      SELECT COALESCE(SUM(calculated_co2e_kg * v_reduction_pct / 100), 0)
      FROM monthly_audit_data
      WHERE year = p_year AND month = p_month AND factor_name = v_factor_name
    );
  END LOOP;

  -- Ensure simulated doesn't go below zero
  v_simulated := GREATEST(v_simulated, 0);

  RETURN QUERY
  SELECT 
    v_baseline,
    v_simulated,
    v_baseline - v_simulated,
    CASE WHEN v_baseline > 0 THEN ROUND(((v_baseline - v_simulated) / v_baseline * 100)::NUMERIC, 2)::DECIMAL ELSE 0 END;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 9. Function: Get scope-wise breakdown
-- ============================================
CREATE OR REPLACE FUNCTION get_scope_breakdown(p_year INTEGER, p_month INTEGER DEFAULT NULL)
RETURNS TABLE(
  scope VARCHAR,
  total_co2e_kg DECIMAL,
  percentage_contribution DECIMAL
) AS $$
DECLARE
  v_total DECIMAL;
BEGIN
  IF p_month IS NULL THEN
    SELECT COALESCE(SUM(calculated_co2e_kg), 0)
    INTO v_total
    FROM monthly_audit_data
    WHERE year = p_year;
  ELSE
    SELECT COALESCE(SUM(calculated_co2e_kg), 0)
    INTO v_total
    FROM monthly_audit_data
    WHERE year = p_year AND month = p_month;
  END IF;

  IF v_total = 0 THEN
    RETURN;
  END IF;

  IF p_month IS NULL THEN
    RETURN QUERY
    SELECT 
      COALESCE(mad.scope, 'Scope3')::VARCHAR,
      SUM(mad.calculated_co2e_kg)::DECIMAL AS total_co2e_kg,
      ROUND((SUM(mad.calculated_co2e_kg) / v_total * 100)::NUMERIC, 2)::DECIMAL AS percentage_contribution
    FROM monthly_audit_data mad
    WHERE mad.year = p_year
    GROUP BY COALESCE(mad.scope, 'Scope3')
    ORDER BY total_co2e_kg DESC;
  ELSE
    RETURN QUERY
    SELECT 
      COALESCE(mad.scope, 'Scope3')::VARCHAR,
      SUM(mad.calculated_co2e_kg)::DECIMAL AS total_co2e_kg,
      ROUND((SUM(mad.calculated_co2e_kg) / v_total * 100)::NUMERIC, 2)::DECIMAL AS percentage_contribution
    FROM monthly_audit_data mad
    WHERE mad.year = p_year AND mad.month = p_month
    GROUP BY COALESCE(mad.scope, 'Scope3')
    ORDER BY total_co2e_kg DESC;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 10. Function: Calculate net zero year projection
-- ============================================
CREATE OR REPLACE FUNCTION calculate_net_zero_year(
  p_baseline_year INTEGER,
  p_annual_reduction_percentage DECIMAL DEFAULT 5.0
)
RETURNS TABLE(
  baseline_year INTEGER,
  baseline_emissions_tonnes DECIMAL,
  annual_reduction_percentage DECIMAL,
  projected_net_zero_year INTEGER
) AS $$
DECLARE
  v_baseline_emissions DECIMAL;
  v_projected_year INTEGER;
  v_current_emissions DECIMAL;
  v_current_year INTEGER;
BEGIN
  -- Get baseline emissions for the year
  SELECT COALESCE(SUM(calculated_co2e_kg) / 1000, 0)
  INTO v_baseline_emissions
  FROM monthly_audit_data
  WHERE year = p_baseline_year;

  IF v_baseline_emissions = 0 THEN
    RETURN;
  END IF;

  v_projected_year := p_baseline_year;
  v_current_emissions := v_baseline_emissions;

  -- Project forward year by year
  WHILE v_current_emissions > 0 AND v_projected_year < p_baseline_year + 100 LOOP
    v_current_emissions := v_current_emissions * (1 - p_annual_reduction_percentage / 100);
    v_projected_year := v_projected_year + 1;
  END LOOP;

  RETURN QUERY
  SELECT 
    p_baseline_year,
    v_baseline_emissions,
    p_annual_reduction_percentage,
    v_projected_year;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 11. Create indexes for new columns
-- ============================================
CREATE INDEX IF NOT EXISTS idx_monthly_audit_data_confidence 
  ON monthly_audit_data(data_confidence);

CREATE INDEX IF NOT EXISTS idx_monthly_audit_data_scope 
  ON monthly_audit_data(scope);

CREATE INDEX IF NOT EXISTS idx_factor_scope_mapping 
  ON factor_scope_mapping(factor_name);

CREATE INDEX IF NOT EXISTS idx_emission_simulations_year_month 
  ON emission_simulations(year, month);

-- ============================================
-- 12. RLS for new tables
-- ============================================
ALTER TABLE factor_scope_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE emission_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View factor scope mapping" ON factor_scope_mapping
  FOR SELECT USING (true);

CREATE POLICY "View emission simulations" ON emission_simulations
  FOR SELECT USING (true);

CREATE POLICY "Manage emission simulations (admin only)" ON emission_simulations
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================
-- 13. Update academic_year_summary to include scope data
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'academic_year_summary' 
    AND column_name = 'scope1_kg'
  ) THEN
    ALTER TABLE academic_year_summary 
    ADD COLUMN scope1_kg DECIMAL(14, 2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'academic_year_summary' 
    AND column_name = 'scope2_kg'
  ) THEN
    ALTER TABLE academic_year_summary 
    ADD COLUMN scope2_kg DECIMAL(14, 2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'academic_year_summary' 
    AND column_name = 'scope3_kg'
  ) THEN
    ALTER TABLE academic_year_summary 
    ADD COLUMN scope3_kg DECIMAL(14, 2) DEFAULT 0;
  END IF;
END $$;
