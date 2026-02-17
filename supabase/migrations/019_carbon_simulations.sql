-- Phase 4: Carbon Reduction Simulation Engine
-- ⚠️ PREREQUISITE: Migrations 016, 017, 018 must be applied FIRST
-- Allows simulation of emission reductions based on various strategies

-- Add dependency check
DO $$
BEGIN
  -- Check if campus summary table exists (from migration 018)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'campus_carbon_summary'
  ) THEN
    RAISE EXCEPTION 'Migration 018 must be applied first! Campus summary table does not exist.';
  END IF;
END $$;

-- 1. Create carbon_simulations table
CREATE TABLE IF NOT EXISTS carbon_simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  
  -- Reduction parameters (percentages)
  electricity_reduction_percent DECIMAL(5, 2) DEFAULT 0 CHECK (electricity_reduction_percent >= 0 AND electricity_reduction_percent <= 100),
  travel_shift_percent DECIMAL(5, 2) DEFAULT 0 CHECK (travel_shift_percent >= 0 AND travel_shift_percent <= 100),
  diesel_reduction_percent DECIMAL(5, 2) DEFAULT 0 CHECK (diesel_reduction_percent >= 0 AND diesel_reduction_percent <= 100),
  
  -- Current baseline
  baseline_scope1 DECIMAL(12, 2) DEFAULT 0,
  baseline_scope2 DECIMAL(12, 2) DEFAULT 0,
  baseline_scope3 DECIMAL(12, 2) DEFAULT 0,
  baseline_total_emissions DECIMAL(12, 2) DEFAULT 0,
  
  -- Projected values after reductions
  projected_scope1 DECIMAL(12, 2) DEFAULT 0,
  projected_scope2 DECIMAL(12, 2) DEFAULT 0,
  projected_scope3 DECIMAL(12, 2) DEFAULT 0,
  projected_emissions DECIMAL(12, 2) DEFAULT 0,
  
  -- Projected net carbon (with tree absorption)
  tree_absorption_kg DECIMAL(12, 2) DEFAULT 0,
  projected_net_carbon DECIMAL(12, 2) DEFAULT 0,
  projected_neutrality_percent DECIMAL(5, 2) DEFAULT 0,
  
  -- Emission reduction achieved
  total_reduction_kg DECIMAL(12, 2) DEFAULT 0,
  reduction_percentage DECIMAL(5, 2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_carbon_simulations_user ON carbon_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_simulations_year ON carbon_simulations(year);

-- 3. Function to simulate carbon reduction
CREATE OR REPLACE FUNCTION simulate_carbon_reduction(
  target_year INTEGER,
  tree_count INTEGER DEFAULT 1000,
  electricity_reduction DECIMAL DEFAULT 0,
  travel_reduction DECIMAL DEFAULT 0,
  diesel_reduction DECIMAL DEFAULT 0
)
RETURNS TABLE (
  baseline_scope1 DECIMAL,
  baseline_scope2 DECIMAL,
  baseline_scope3 DECIMAL,
  baseline_total DECIMAL,
  projected_scope1 DECIMAL,
  projected_scope2 DECIMAL,
  projected_scope3 DECIMAL,
  projected_total DECIMAL,
  tree_absorption DECIMAL,
  projected_net_carbon DECIMAL,
  projected_neutrality_percent DECIMAL,
  total_reduction_kg DECIMAL,
  reduction_percentage DECIMAL
) AS $$
DECLARE
  -- Baseline aggregates
  base_electricity DECIMAL;
  base_travel DECIMAL;
  base_diesel DECIMAL;
  base_scope1 DECIMAL;
  base_scope2 DECIMAL;
  base_scope3 DECIMAL;
  base_total DECIMAL;
  
  -- Projected values
  proj_scope1 DECIMAL;
  proj_scope2 DECIMAL;
  proj_scope3 DECIMAL;
  proj_total DECIMAL;
  
  -- Tree and net carbon
  tree_abs DECIMAL;
  net_carbon DECIMAL;
  neutrality_pct DECIMAL;
  
  -- Reductions
  total_reduction DECIMAL;
  reduction_pct DECIMAL;
BEGIN
  -- Get baseline scope totals for the year
  SELECT 
    COALESCE(SUM(scope1_emissions_kg), 0),
    COALESCE(SUM(scope2_emissions_kg), 0),
    COALESCE(SUM(scope3_emissions_kg), 0),
    COALESCE(SUM(total_carbon), 0),  -- Column is total_carbon, not total_carbon_kg
    COALESCE(SUM(electricity_kwh), 0),
    COALESCE(SUM(travel_km), 0),
    COALESCE(SUM(diesel_liters), 0)
  INTO base_scope1, base_scope2, base_scope3, base_total, base_electricity, base_travel, base_diesel
  FROM carbon_submissions
  WHERE EXTRACT(YEAR FROM submission_date) = target_year;
  
  -- Calculate projected emissions with reductions applied
  
  -- Scope 2: Reduce electricity emissions
  proj_scope2 := base_scope2 * (1 - (electricity_reduction / 100.0));
  
  -- Scope 3: Reduce travel emissions
  -- Travel is part of scope 3, need to calculate reduction
  DECLARE
    base_travel_emissions DECIMAL;
    reduced_travel_emissions DECIMAL;
    other_scope3_emissions DECIMAL;
  BEGIN
    base_travel_emissions := base_travel * 0.12;
    reduced_travel_emissions := base_travel_emissions * (1 - (travel_reduction / 100.0));
    other_scope3_emissions := base_scope3 - base_travel_emissions;
    proj_scope3 := reduced_travel_emissions + other_scope3_emissions;
  END;
  
  -- Scope 1: Reduce diesel emissions
  DECLARE
    base_diesel_emissions DECIMAL;
    reduced_diesel_emissions DECIMAL;
    other_scope1_emissions DECIMAL;
  BEGIN
    base_diesel_emissions := base_diesel * 2.68;
    reduced_diesel_emissions := base_diesel_emissions * (1 - (diesel_reduction / 100.0));
    other_scope1_emissions := base_scope1 - base_diesel_emissions;
    proj_scope1 := reduced_diesel_emissions + other_scope1_emissions;
  END;
  
  -- Calculate projected total
  proj_total := proj_scope1 + proj_scope2 + proj_scope3;
  
  -- Calculate tree absorption
  tree_abs := tree_count * 21;
  
  -- Calculate net carbon
  net_carbon := proj_total - tree_abs;
  
  -- Calculate neutrality percentage
  IF proj_total > 0 THEN
    neutrality_pct := (tree_abs / proj_total) * 100;
    IF neutrality_pct > 100 THEN
      neutrality_pct := 100;
    END IF;
  ELSE
    neutrality_pct := 0;
  END IF;
  
  -- Calculate total reduction achieved
  total_reduction := base_total - proj_total;
  
  -- Calculate reduction percentage
  IF base_total > 0 THEN
    reduction_pct := (total_reduction / base_total) * 100;
  ELSE
    reduction_pct := 0;
  END IF;
  
  -- Return results
  RETURN QUERY SELECT 
    base_scope1,
    base_scope2,
    base_scope3,
    base_total,
    proj_scope1,
    proj_scope2,
    proj_scope3,
    proj_total,
    tree_abs,
    net_carbon,
    neutrality_pct,
    total_reduction,
    reduction_pct;
END;
$$ LANGUAGE plpgsql;

-- 4. Add RLS policies
ALTER TABLE carbon_simulations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own simulations
CREATE POLICY "Users can view own simulations"
  ON carbon_simulations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Users can create their own simulations
CREATE POLICY "Users can create simulations"
  ON carbon_simulations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
