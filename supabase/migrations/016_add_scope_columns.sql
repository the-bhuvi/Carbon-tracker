-- Phase 1: Add Scope Classification Columns to carbon_submissions
-- This migration adds scope-based emission tracking without breaking existing functionality

-- 1. Add scope emission columns
ALTER TABLE carbon_submissions 
ADD COLUMN IF NOT EXISTS scope1_emissions_kg DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS scope2_emissions_kg DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS scope3_emissions_kg DECIMAL(10, 2) DEFAULT 0;

-- 2. Add missing waste columns if not present
ALTER TABLE carbon_submissions 
ADD COLUMN IF NOT EXISTS organic_waste_kg DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS plastic_kg DECIMAL(10, 2) DEFAULT 0;

-- 3. Add waste emission factors to emission_factors table
ALTER TABLE emission_factors
ADD COLUMN IF NOT EXISTS paper_factor DECIMAL(10, 4) DEFAULT 1.3,
ADD COLUMN IF NOT EXISTS plastic_factor DECIMAL(10, 4) DEFAULT 2.7,
ADD COLUMN IF NOT EXISTS organic_waste_factor DECIMAL(10, 4) DEFAULT 0.5;

-- 4. Create indexes for scope columns
CREATE INDEX IF NOT EXISTS idx_carbon_submissions_scope1 ON carbon_submissions(scope1_emissions_kg);
CREATE INDEX IF NOT EXISTS idx_carbon_submissions_scope2 ON carbon_submissions(scope2_emissions_kg);
CREATE INDEX IF NOT EXISTS idx_carbon_submissions_scope3 ON carbon_submissions(scope3_emissions_kg);

-- 5. Add comment for documentation
COMMENT ON COLUMN carbon_submissions.scope1_emissions_kg IS 'Scope 1: Direct emissions (diesel, LPG, PNG)';
COMMENT ON COLUMN carbon_submissions.scope2_emissions_kg IS 'Scope 2: Indirect emissions from electricity';
COMMENT ON COLUMN carbon_submissions.scope3_emissions_kg IS 'Scope 3: Other indirect emissions (travel, water, waste)';
