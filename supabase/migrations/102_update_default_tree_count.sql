-- Update default tree count to 1,256 (actual campus tree count)

CREATE OR REPLACE FUNCTION refresh_campus_carbon_summary(target_year INTEGER, tree_count INTEGER DEFAULT 1256)
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
  SELECT 
    COALESCE(SUM(scope1_emissions_kg), 0),
    COALESCE(SUM(scope2_emissions_kg), 0),
    COALESCE(SUM(scope3_emissions_kg), 0),
    COALESCE(SUM(total_carbon), 0)
  INTO scope1_total, scope2_total, scope3_total, total_emis
  FROM carbon_submissions
  WHERE EXTRACT(YEAR FROM submission_date) = target_year;

  tree_absorption := tree_count * 21;
  net_carbon := total_emis - tree_absorption;

  IF total_emis > 0 THEN
    neutrality_pct := (tree_absorption / total_emis) * 100;
    IF neutrality_pct > 100 THEN
      neutrality_pct := 100;
    END IF;
  ELSE
    neutrality_pct := 0;
  END IF;

  IF net_carbon > 0 THEN
    trees_needed := CEIL(net_carbon / 21);
  ELSE
    trees_needed := 0;
  END IF;

  INSERT INTO campus_carbon_summary (
    year, total_scope1, total_scope2, total_scope3, total_emissions,
    total_tree_count, tree_absorption_kg, net_carbon_kg,
    carbon_neutrality_percentage, trees_needed_for_offset
  ) VALUES (
    target_year, scope1_total, scope2_total, scope3_total, total_emis,
    tree_count, tree_absorption, net_carbon, neutrality_pct, trees_needed
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

CREATE OR REPLACE FUNCTION get_campus_carbon_summary(target_year INTEGER)
RETURNS campus_carbon_summary AS $$
DECLARE
  summary_record campus_carbon_summary;
BEGIN
  SELECT * INTO summary_record
  FROM campus_carbon_summary
  WHERE year = target_year;

  IF NOT FOUND THEN
    summary_record := refresh_campus_carbon_summary(target_year, 1256);
  END IF;

  RETURN summary_record;
END;
$$ LANGUAGE plpgsql;
