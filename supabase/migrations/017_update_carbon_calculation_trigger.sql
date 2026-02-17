-- CORRECTED Migration 017: Update Carbon Calculation Trigger with Scope Classification
-- ⚠️ PREREQUISITE: Migration 016 must be applied FIRST
-- This replaces the existing calculate_carbon_metrics() function with scope-aware calculations

-- Add dependency check
DO $$
BEGIN
  -- Check if required columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'carbon_submissions' 
    AND column_name = 'plastic_kg'
  ) THEN
    RAISE EXCEPTION 'Migration 016 must be applied first! Column plastic_kg does not exist.';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'carbon_submissions' 
    AND column_name = 'scope1_emissions_kg'
  ) THEN
    RAISE EXCEPTION 'Migration 016 must be applied first! Column scope1_emissions_kg does not exist.';
  END IF;
END $$;

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
  
  -- SCOPE 1: Direct emissions from combustion
  -- Diesel, LPG, PNG
  scope1 := 
    (COALESCE(NEW.diesel_liters, 0) * 2.68) +
    (COALESCE(NEW.lpg_kg, 0) * 2.98) +
    (COALESCE(NEW.png_m3, 0) * 2.75);
  
  -- SCOPE 2: Indirect emissions from purchased electricity
  scope2 := 
    (COALESCE(NEW.electricity_kwh, 0) * 0.82);
  
  -- SCOPE 3: Other indirect emissions
  -- Travel, water, waste (e-waste, paper, plastic, organic)
  scope3 := 
    (COALESCE(NEW.travel_km, 0) * 0.12) +
    (COALESCE(NEW.water_liters, 0) * 0.0003) +
    (COALESCE(NEW.ewaste_kg, 0) * 1.5) +
    (COALESCE(NEW.paper_kg, 0) * 1.3) +
    (COALESCE(NEW.plastic_kg, 0) * 2.7) +
    (COALESCE(NEW.organic_waste_kg, 0) * 0.5);
  
  -- Calculate total carbon emissions
  total := scope1 + scope2 + scope3;
  
  -- Add petrol (not in scope spec but exists in schema - treat as Scope 1)
  IF NEW.petrol_liters IS NOT NULL AND NEW.petrol_liters > 0 THEN
    scope1 := scope1 + (NEW.petrol_liters * factors.petrol_factor);
    total := scope1 + scope2 + scope3;
  END IF;
  
  -- Determine carbon score
  IF total < 100 THEN
    score := 'Green';
  ELSIF total < 500 THEN
    score := 'Moderate';
  ELSE
    score := 'High';
  END IF;
  
  -- Calculate tree equivalent (21kg CO2 per tree per year)
  trees := total / 21.0;
  
  -- Generate suggestions based on consumption
  suggestion_list := ARRAY[]::TEXT[];
  
  IF NEW.electricity_kwh > 500 THEN
    suggestion_list := array_append(suggestion_list, 'Consider switching to LED bulbs and energy-efficient appliances');
  END IF;
  
  IF NEW.diesel_liters > 50 OR NEW.petrol_liters > 50 THEN
    suggestion_list := array_append(suggestion_list, 'Explore renewable fuel alternatives or reduce vehicle usage');
  END IF;
  
  IF NEW.travel_km > 100 THEN
    suggestion_list := array_append(suggestion_list, 'Use public transport or carpool to reduce travel emissions');
  END IF;
  
  IF NEW.water_liters > 10000 THEN
    suggestion_list := array_append(suggestion_list, 'Install water-saving fixtures and fix leaks promptly');
  END IF;
  
  IF NEW.ewaste_kg > 10 THEN
    suggestion_list := array_append(suggestion_list, 'Properly recycle e-waste through certified facilities');
  END IF;
  
  IF NEW.paper_kg > 20 THEN
    suggestion_list := array_append(suggestion_list, 'Go digital to reduce paper consumption');
  END IF;
  
  IF NEW.plastic_kg > 10 THEN
    suggestion_list := array_append(suggestion_list, 'Reduce single-use plastics and switch to reusable alternatives');
  END IF;
  
  IF NEW.organic_waste_kg > 50 THEN
    suggestion_list := array_append(suggestion_list, 'Implement composting to reduce organic waste emissions');
  END IF;
  
  -- Set calculated values
  NEW.scope1_emissions_kg := scope1;
  NEW.scope2_emissions_kg := scope2;
  NEW.scope3_emissions_kg := scope3;
  NEW.total_carbon := total;  -- Column name is total_carbon, not total_carbon_kg
  NEW.carbon_score := score;
  NEW.tree_equivalent := trees;
  NEW.suggestions := suggestion_list;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER calculate_carbon_on_insert
BEFORE INSERT OR UPDATE ON carbon_submissions
FOR EACH ROW EXECUTE FUNCTION calculate_carbon_metrics();

-- Backfill existing records with scope calculations
UPDATE carbon_submissions SET updated_at = updated_at;
