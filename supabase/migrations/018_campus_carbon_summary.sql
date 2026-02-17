-- Phase 2: Campus Carbon Summary Table
-- ⚠️ PREREQUISITE: Migrations 016 and 017 must be applied FIRST
-- Tracks yearly campus-wide carbon emissions, tree absorption, and neutrality metrics

-- Add dependency check
DO $$
BEGIN
  -- Check if scope columns exist (from migration 016)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'carbon_submissions' 
    AND column_name = 'scope1_emissions_kg'
  ) THEN
    RAISE EXCEPTION 'Migration 016 must be applied first! Scope columns do not exist.';
  END IF;
END $$;

-- 1. Create campus_carbon_summary table
CREATE TABLE IF NOT EXISTS campus_carbon_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year INTEGER NOT NULL UNIQUE,
  
  -- Scope-based totals
  total_scope1 DECIMAL(12, 2) DEFAULT 0,
  total_scope2 DECIMAL(12, 2) DEFAULT 0,
  total_scope3 DECIMAL(12, 2) DEFAULT 0,
  total_emissions DECIMAL(12, 2) DEFAULT 0,
  
  -- Tree carbon offset
  total_tree_count INTEGER DEFAULT 0,
  tree_absorption_kg DECIMAL(12, 2) DEFAULT 0,
  
  -- Net carbon and neutrality
  net_carbon_kg DECIMAL(12, 2) DEFAULT 0,
  carbon_neutrality_percentage DECIMAL(5, 2) DEFAULT 0,
  trees_needed_for_offset INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index on year for fast lookups
CREATE INDEX IF NOT EXISTS idx_campus_carbon_summary_year ON campus_carbon_summary(year);

-- 3. Create updated_at trigger
DROP TRIGGER IF EXISTS campus_carbon_summary_updated_at ON campus_carbon_summary;
CREATE TRIGGER campus_carbon_summary_updated_at
BEFORE UPDATE ON campus_carbon_summary
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Function to refresh/calculate campus carbon summary for a specific year
CREATE OR REPLACE FUNCTION refresh_campus_carbon_summary(target_year INTEGER, tree_count INTEGER DEFAULT 1000)
RETURNS campus_carbon_summary AS $$
DECLARE
  scope1_total DECIMAL(12, 2);
  scope2_total DECIMAL(12, 2);
  scope3_total DECIMAL(12, 2);
  total_emis DECIMAL(12, 2);
  tree_absorption DECIMAL(12, 2);
  net_carbon DECIMAL(12, 2);
  neutrality_pct DECIMAL(5, 2);
  trees_needed INTEGER;
  summary_record campus_carbon_summary;
BEGIN
  -- Aggregate scope emissions for the year
  SELECT 
    COALESCE(SUM(scope1_emissions_kg), 0),
    COALESCE(SUM(scope2_emissions_kg), 0),
    COALESCE(SUM(scope3_emissions_kg), 0),
    COALESCE(SUM(total_carbon), 0)  -- Column is total_carbon, not total_carbon_kg
  INTO scope1_total, scope2_total, scope3_total, total_emis
  FROM carbon_submissions
  WHERE EXTRACT(YEAR FROM submission_date) = target_year;
  
  -- Calculate tree absorption (21 kg CO2 per tree per year)
  tree_absorption := tree_count * 21;
  
  -- Calculate net carbon
  net_carbon := total_emis - tree_absorption;
  
  -- Calculate carbon neutrality percentage
  IF total_emis > 0 THEN
    neutrality_pct := (tree_absorption / total_emis) * 100;
    -- Cap at 100%
    IF neutrality_pct > 100 THEN
      neutrality_pct := 100;
    END IF;
  ELSE
    neutrality_pct := 0;
  END IF;
  
  -- Calculate trees needed to offset remaining emissions
  IF net_carbon > 0 THEN
    trees_needed := CEIL(net_carbon / 21);
  ELSE
    trees_needed := 0;
  END IF;
  
  -- Insert or update the summary record
  INSERT INTO campus_carbon_summary (
    year,
    total_scope1,
    total_scope2,
    total_scope3,
    total_emissions,
    total_tree_count,
    tree_absorption_kg,
    net_carbon_kg,
    carbon_neutrality_percentage,
    trees_needed_for_offset
  ) VALUES (
    target_year,
    scope1_total,
    scope2_total,
    scope3_total,
    total_emis,
    tree_count,
    tree_absorption,
    net_carbon,
    neutrality_pct,
    trees_needed
  )
  ON CONFLICT (year) 
  DO UPDATE SET
    total_scope1 = EXCLUDED.total_scope1,
    total_scope2 = EXCLUDED.total_scope2,
    total_scope3 = EXCLUDED.total_scope3,
    total_emissions = EXCLUDED.total_emissions,
    total_tree_count = EXCLUDED.total_tree_count,
    tree_absorption_kg = EXCLUDED.tree_absorption_kg,
    net_carbon_kg = EXCLUDED.net_carbon_kg,
    carbon_neutrality_percentage = EXCLUDED.carbon_neutrality_percentage,
    trees_needed_for_offset = EXCLUDED.trees_needed_for_offset,
    updated_at = NOW()
  RETURNING * INTO summary_record;
  
  RETURN summary_record;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to get campus carbon summary (RPC callable from frontend)
CREATE OR REPLACE FUNCTION get_campus_carbon_summary(target_year INTEGER)
RETURNS campus_carbon_summary AS $$
DECLARE
  summary_record campus_carbon_summary;
BEGIN
  -- Try to get existing record
  SELECT * INTO summary_record 
  FROM campus_carbon_summary 
  WHERE year = target_year;
  
  -- If not found, calculate it with default tree count
  IF NOT FOUND THEN
    summary_record := refresh_campus_carbon_summary(target_year, 1000);
  END IF;
  
  RETURN summary_record;
END;
$$ LANGUAGE plpgsql;

-- 6. Add RLS policies
ALTER TABLE campus_carbon_summary ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read campus summary
CREATE POLICY "Anyone can view campus carbon summary"
  ON campus_carbon_summary FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert/update
CREATE POLICY "Only admins can modify campus carbon summary"
  ON campus_carbon_summary FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
