-- GHG Protocol Carbon Inventory System - Database Schema
-- This is a NEW parallel system that does NOT modify existing tables

-- ============================================
-- 1. Emission Categories (Scope-based)
-- ============================================
CREATE TABLE IF NOT EXISTS emission_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope TEXT NOT NULL CHECK (scope IN ('Scope1', 'Scope2', 'Scope3')),
  category_name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL, -- litres, kWh, kg, km, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scope, category_name)
);

-- ============================================
-- 2. Emission Factors Configuration
-- ============================================
CREATE TABLE IF NOT EXISTS emission_factors_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES emission_categories(id) ON DELETE CASCADE,
  emission_factor DECIMAL(10, 6) NOT NULL, -- kg CO2 per unit
  factor_source TEXT, -- e.g., "IPCC 2021", "India Grid 2023"
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to DATE,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. Emission Records (Official Inventory)
-- ============================================
CREATE TABLE IF NOT EXISTS emission_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  category_id UUID REFERENCES emission_categories(id) ON DELETE RESTRICT,
  scope TEXT NOT NULL CHECK (scope IN ('Scope1', 'Scope2', 'Scope3')),
  category_name TEXT NOT NULL, -- Denormalized for reporting
  activity_value DECIMAL(12, 2) NOT NULL, -- e.g., 1000 kWh
  emission_factor DECIMAL(10, 6) NOT NULL, -- Factor used at time of record
  calculated_emission_kg DECIMAL(12, 2) NOT NULL, -- activity × factor
  calculated_emission_tonnes DECIMAL(12, 4) GENERATED ALWAYS AS (calculated_emission_kg / 1000) STORED,
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate entries
  UNIQUE(month, year, category_id)
);

-- ============================================
-- 4. Baseline Years Configuration
-- ============================================
CREATE TABLE IF NOT EXISTS baseline_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  baseline_year INTEGER NOT NULL UNIQUE,
  total_scope1_tonnes DECIMAL(12, 4),
  total_scope2_tonnes DECIMAL(12, 4),
  total_scope3_tonnes DECIMAL(12, 4),
  total_emissions_tonnes DECIMAL(12, 4),
  description TEXT,
  is_active BOOLEAN DEFAULT true, -- Only one active baseline at a time
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. Create Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_emission_records_year_month ON emission_records(year, month);
CREATE INDEX IF NOT EXISTS idx_emission_records_scope ON emission_records(scope);
CREATE INDEX IF NOT EXISTS idx_emission_records_category ON emission_records(category_id);
CREATE INDEX IF NOT EXISTS idx_emission_factors_category ON emission_factors_config(category_id);
CREATE INDEX IF NOT EXISTS idx_emission_factors_valid ON emission_factors_config(valid_from, valid_to);

-- ============================================
-- 6. Updated At Triggers
-- ============================================
CREATE TRIGGER emission_categories_updated_at
BEFORE UPDATE ON emission_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER emission_factors_config_updated_at
BEFORE UPDATE ON emission_factors_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER emission_records_updated_at
BEFORE UPDATE ON emission_records
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER baseline_years_updated_at
BEFORE UPDATE ON baseline_years
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 7. Seed Default Categories
-- ============================================
INSERT INTO emission_categories (scope, category_name, description, unit) VALUES
-- Scope 1: Direct Emissions
('Scope1', 'Diesel Generator', 'Stationary combustion - diesel generators', 'litres'),
('Scope1', 'Campus Vehicles - Diesel', 'Mobile combustion - diesel vehicles', 'litres'),
('Scope1', 'Campus Vehicles - Petrol', 'Mobile combustion - petrol vehicles', 'litres'),
('Scope1', 'LPG', 'Stationary combustion - LPG (cooking, heating)', 'kg'),
('Scope1', 'PNG', 'Piped natural gas', 'cubic_meters'),

-- Scope 2: Indirect Energy Emissions
('Scope2', 'Electricity - Grid', 'Purchased electricity from grid', 'kWh'),

-- Scope 3: Other Indirect Emissions
('Scope3', 'Student Commute', 'Student transportation to/from campus', 'km'),
('Scope3', 'Staff Commute', 'Staff transportation to/from campus', 'km'),
('Scope3', 'Waste - Solid', 'Solid waste disposal', 'kg'),
('Scope3', 'Waste - Organic', 'Organic waste disposal', 'kg'),
('Scope3', 'Water Consumption', 'Municipal water supply and treatment', 'litres'),
('Scope3', 'Paper', 'Paper consumption and disposal', 'kg'),
('Scope3', 'Plastic', 'Plastic consumption and disposal', 'kg'),
('Scope3', 'E-Waste', 'Electronic waste', 'kg')
ON CONFLICT (scope, category_name) DO NOTHING;

-- ============================================
-- 8. Seed Default Emission Factors
-- ============================================
-- Get category IDs and insert factors
DO $$
DECLARE
  cat_id UUID;
BEGIN
  -- Scope 1 Factors
  SELECT id INTO cat_id FROM emission_categories WHERE category_name = 'Diesel Generator';
  INSERT INTO emission_factors_config (category_id, emission_factor, factor_source) 
  VALUES (cat_id, 2.68, 'IPCC 2006') ON CONFLICT DO NOTHING;
  
  SELECT id INTO cat_id FROM emission_categories WHERE category_name = 'Campus Vehicles - Diesel';
  INSERT INTO emission_factors_config (category_id, emission_factor, factor_source) 
  VALUES (cat_id, 2.68, 'IPCC 2006') ON CONFLICT DO NOTHING;
  
  SELECT id INTO cat_id FROM emission_categories WHERE category_name = 'Campus Vehicles - Petrol';
  INSERT INTO emission_factors_config (category_id, emission_factor, factor_source) 
  VALUES (cat_id, 2.31, 'IPCC 2006') ON CONFLICT DO NOTHING;
  
  SELECT id INTO cat_id FROM emission_categories WHERE category_name = 'LPG';
  INSERT INTO emission_factors_config (category_id, emission_factor, factor_source) 
  VALUES (cat_id, 3.0, 'IPCC 2006') ON CONFLICT DO NOTHING;
  
  SELECT id INTO cat_id FROM emission_categories WHERE category_name = 'PNG';
  INSERT INTO emission_factors_config (category_id, emission_factor, factor_source) 
  VALUES (cat_id, 2.75, 'IPCC 2006') ON CONFLICT DO NOTHING;
  
  -- Scope 2 Factors
  SELECT id INTO cat_id FROM emission_categories WHERE category_name = 'Electricity - Grid';
  INSERT INTO emission_factors_config (category_id, emission_factor, factor_source) 
  VALUES (cat_id, 0.82, 'India Grid Average 2023') ON CONFLICT DO NOTHING;
  
  -- Scope 3 Factors
  SELECT id INTO cat_id FROM emission_categories WHERE category_name = 'Student Commute';
  INSERT INTO emission_factors_config (category_id, emission_factor, factor_source) 
  VALUES (cat_id, 0.12, 'Average passenger transport') ON CONFLICT DO NOTHING;
  
  SELECT id INTO cat_id FROM emission_categories WHERE category_name = 'Staff Commute';
  INSERT INTO emission_factors_config (category_id, emission_factor, factor_source) 
  VALUES (cat_id, 0.12, 'Average passenger transport') ON CONFLICT DO NOTHING;
  
  SELECT id INTO cat_id FROM emission_categories WHERE category_name = 'Waste - Solid';
  INSERT INTO emission_factors_config (category_id, emission_factor, factor_source) 
  VALUES (cat_id, 0.5, 'Landfill emissions') ON CONFLICT DO NOTHING;
  
  SELECT id INTO cat_id FROM emission_categories WHERE category_name = 'Waste - Organic';
  INSERT INTO emission_factors_config (category_id, emission_factor, factor_source) 
  VALUES (cat_id, 0.5, 'Organic decomposition') ON CONFLICT DO NOTHING;
  
  SELECT id INTO cat_id FROM emission_categories WHERE category_name = 'Water Consumption';
  INSERT INTO emission_factors_config (category_id, emission_factor, factor_source) 
  VALUES (cat_id, 0.0003, 'Water treatment and supply') ON CONFLICT DO NOTHING;
  
  SELECT id INTO cat_id FROM emission_categories WHERE category_name = 'Paper';
  INSERT INTO emission_factors_config (category_id, emission_factor, factor_source) 
  VALUES (cat_id, 1.3, 'Paper lifecycle') ON CONFLICT DO NOTHING;
  
  SELECT id INTO cat_id FROM emission_categories WHERE category_name = 'Plastic';
  INSERT INTO emission_factors_config (category_id, emission_factor, factor_source) 
  VALUES (cat_id, 2.7, 'Plastic lifecycle') ON CONFLICT DO NOTHING;
  
  SELECT id INTO cat_id FROM emission_categories WHERE category_name = 'E-Waste';
  INSERT INTO emission_factors_config (category_id, emission_factor, factor_source) 
  VALUES (cat_id, 1.5, 'Electronics disposal') ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- 9. Row Level Security
-- ============================================
ALTER TABLE emission_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE emission_factors_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE emission_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE baseline_years ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view
CREATE POLICY "Anyone can view emission categories"
  ON emission_categories FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Anyone can view emission factors"
  ON emission_factors_config FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Anyone can view emission records"
  ON emission_records FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Anyone can view baseline years"
  ON baseline_years FOR SELECT
  TO authenticated USING (true);

-- Only admins can modify
CREATE POLICY "Only admins can modify emission categories"
  ON emission_categories FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Only admins can modify emission factors"
  ON emission_factors_config FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Only admins can modify emission records"
  ON emission_records FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Only admins can modify baseline years"
  ON baseline_years FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  ));
