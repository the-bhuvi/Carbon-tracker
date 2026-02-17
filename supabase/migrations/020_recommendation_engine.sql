-- Phase 5: Smart Recommendation Engine
-- ⚠️ PREREQUISITE: Migration 016 must be applied FIRST (uses scope columns)
-- Generates actionable recommendations based on emission patterns

-- Add dependency check
DO $$
BEGIN
  -- Check if scope columns exist (from migration 016)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'carbon_submissions' 
    AND column_name IN ('scope1_emissions_kg', 'plastic_kg', 'organic_waste_kg')
  ) THEN
    RAISE EXCEPTION 'Migration 016 must be applied first! Scope and waste columns needed for recommendations.';
  END IF;
END $$;

-- Function to generate smart recommendations
CREATE OR REPLACE FUNCTION generate_recommendations(target_year INTEGER)
RETURNS TABLE (
  category TEXT,
  priority TEXT,
  action TEXT,
  impact_estimate TEXT,
  scope TEXT,
  current_value DECIMAL,
  percentage_of_total DECIMAL
) AS $$
DECLARE
  scope1_total DECIMAL;
  scope2_total DECIMAL;
  scope3_total DECIMAL;
  total_emis DECIMAL;
  net_carbon DECIMAL;
  tree_absorption DECIMAL;
  tree_count INTEGER := 1000; -- Default tree count
  
  scope1_pct DECIMAL;
  scope2_pct DECIMAL;
  scope3_pct DECIMAL;
  
  electricity_total DECIMAL;
  diesel_total DECIMAL;
  travel_total DECIMAL;
  water_total DECIMAL;
  waste_total DECIMAL;
BEGIN
  -- Get scope totals for the year
  SELECT 
    COALESCE(SUM(scope1_emissions_kg), 0),
    COALESCE(SUM(scope2_emissions_kg), 0),
    COALESCE(SUM(scope3_emissions_kg), 0),
    COALESCE(SUM(total_carbon), 0),  -- Column is total_carbon, not total_carbon_kg
    COALESCE(SUM(electricity_kwh), 0),
    COALESCE(SUM(diesel_liters), 0),
    COALESCE(SUM(travel_km), 0),
    COALESCE(SUM(water_liters), 0),
    COALESCE(SUM(paper_kg + plastic_kg + ewaste_kg + organic_waste_kg), 0)
  INTO scope1_total, scope2_total, scope3_total, total_emis, 
       electricity_total, diesel_total, travel_total, water_total, waste_total
  FROM carbon_submissions
  WHERE EXTRACT(YEAR FROM submission_date) = target_year;
  
  -- Calculate percentages
  IF total_emis > 0 THEN
    scope1_pct := (scope1_total / total_emis) * 100;
    scope2_pct := (scope2_total / total_emis) * 100;
    scope3_pct := (scope3_total / total_emis) * 100;
  ELSE
    scope1_pct := 0;
    scope2_pct := 0;
    scope3_pct := 0;
  END IF;
  
  -- Calculate net carbon
  tree_absorption := tree_count * 21;
  net_carbon := total_emis - tree_absorption;
  
  -- RECOMMENDATION 1: High Scope 2 (Electricity)
  IF scope2_pct > 40 THEN
    RETURN QUERY SELECT 
      'Electricity'::TEXT,
      'High'::TEXT,
      'Install rooftop solar panels covering 40% of energy needs'::TEXT,
      ('Reduce ' || ROUND(scope2_total * 0.4, 0)::TEXT || ' kg CO2 annually')::TEXT,
      'Scope 2'::TEXT,
      scope2_total,
      scope2_pct;
  END IF;
  
  -- RECOMMENDATION 2: High Scope 3 (Transportation)
  IF scope3_pct > 35 THEN
    DECLARE
      travel_emissions DECIMAL;
      potential_reduction DECIMAL;
    BEGIN
      travel_emissions := travel_total * 0.12;
      potential_reduction := travel_emissions * 0.3; -- 30% reduction target
      
      RETURN QUERY SELECT 
        'Transportation'::TEXT,
        'High'::TEXT,
        'Implement electric shuttle service and promote carpooling'::TEXT,
        ('Reduce ' || ROUND(potential_reduction, 0)::TEXT || ' kg CO2 annually')::TEXT,
        'Scope 3'::TEXT,
        scope3_total,
        scope3_pct;
    END;
  END IF;
  
  -- RECOMMENDATION 3: High Scope 1 (Diesel/Generator)
  IF scope1_pct > 30 OR diesel_total > 5000 THEN
    DECLARE
      diesel_emissions DECIMAL;
      potential_reduction DECIMAL;
    BEGIN
      diesel_emissions := diesel_total * 2.68;
      potential_reduction := diesel_emissions * 0.5; -- 50% reduction target
      
      RETURN QUERY SELECT 
        'Diesel Generators'::TEXT,
        'High'::TEXT,
        'Replace diesel generators with cleaner alternatives or battery storage'::TEXT,
        ('Reduce ' || ROUND(potential_reduction, 0)::TEXT || ' kg CO2 annually')::TEXT,
        'Scope 1'::TEXT,
        scope1_total,
        scope1_pct;
    END;
  END IF;
  
  -- RECOMMENDATION 4: Moderate electricity usage
  IF scope2_pct > 25 AND scope2_pct <= 40 THEN
    RETURN QUERY SELECT 
      'Energy Efficiency'::TEXT,
      'Medium'::TEXT,
      'Upgrade to LED lighting and install smart energy management systems'::TEXT,
      ('Reduce ' || ROUND(scope2_total * 0.15, 0)::TEXT || ' kg CO2 annually')::TEXT,
      'Scope 2'::TEXT,
      scope2_total,
      scope2_pct;
  END IF;
  
  -- RECOMMENDATION 5: Waste management
  IF waste_total > 1000 THEN
    DECLARE
      waste_emissions DECIMAL;
      potential_reduction DECIMAL;
    BEGIN
      waste_emissions := (waste_total * 1.5); -- Average waste factor
      potential_reduction := waste_emissions * 0.4; -- 40% reduction target
      
      RETURN QUERY SELECT 
        'Waste Management'::TEXT,
        'Medium'::TEXT,
        'Implement comprehensive recycling and composting program'::TEXT,
        ('Reduce ' || ROUND(potential_reduction, 0)::TEXT || ' kg CO2 annually')::TEXT,
        'Scope 3'::TEXT,
        waste_emissions,
        (waste_emissions / total_emis * 100);
    END;
  END IF;
  
  -- RECOMMENDATION 6: Water conservation
  IF water_total > 500000 THEN
    DECLARE
      water_emissions DECIMAL;
    BEGIN
      water_emissions := water_total * 0.0003;
      
      RETURN QUERY SELECT 
        'Water Conservation'::TEXT,
        'Low'::TEXT,
        'Install rainwater harvesting and water recycling systems'::TEXT,
        ('Reduce ' || ROUND(water_emissions * 0.3, 0)::TEXT || ' kg CO2 annually')::TEXT,
        'Scope 3'::TEXT,
        water_emissions,
        (water_emissions / total_emis * 100);
    END;
  END IF;
  
  -- RECOMMENDATION 7: Tree planting for offset
  IF net_carbon > 0 THEN
    DECLARE
      trees_needed INTEGER;
    BEGIN
      trees_needed := CEIL(net_carbon / 21);
      
      RETURN QUERY SELECT 
        'Carbon Offset'::TEXT,
        'High'::TEXT,
        ('Plant ' || trees_needed::TEXT || ' additional trees to achieve carbon neutrality')::TEXT,
        ('Offset ' || ROUND(net_carbon, 0)::TEXT || ' kg CO2 annually')::TEXT,
        'All Scopes'::TEXT,
        net_carbon,
        100.0;
    END;
  END IF;
  
  -- RECOMMENDATION 8: Campus already carbon neutral
  IF net_carbon <= 0 THEN
    RETURN QUERY SELECT 
      'Achievement'::TEXT,
      'Info'::TEXT,
      'Campus has achieved carbon neutrality - maintain current practices'::TEXT,
      'Carbon neutral status achieved'::TEXT,
      'All Scopes'::TEXT,
      0.0,
      0.0;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_recommendations(INTEGER) TO authenticated;
