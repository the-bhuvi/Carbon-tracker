# 🔧 Column Name Issue - FIXED

## Issue Identified
The migration used `png_cubic_meters` but your database uses `png_m3`.

## ✅ Fixed Files
- `016_add_scope_columns.sql` - Added plastic_kg column
- `017_update_carbon_calculation_trigger.sql` - Changed to png_m3
- `src/types/database.ts` - Updated TypeScript types

## 🚀 Apply Migrations Now

### Option 1: Supabase CLI
```bash
cd E:\Projects\Carbon-tracker
supabase db push
```

### Option 2: Supabase Dashboard
Go to SQL Editor and run each migration in order:

#### 1. Migration 016 - Add Scope Columns
```sql
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
```

#### 2. Migration 017 - Update Trigger
Copy the entire content from `supabase/migrations/017_update_carbon_calculation_trigger.sql` (now fixed)

#### 3. Backfill Existing Data
```sql
-- Update existing submissions to calculate scope values
UPDATE carbon_submissions SET updated_at = updated_at;

-- Verify it worked
SELECT 
  id,
  electricity_kwh,
  scope2_emissions_kg,
  diesel_liters,
  scope1_emissions_kg,
  png_m3,
  total_carbon_kg
FROM carbon_submissions
LIMIT 5;
```

#### 4. Continue with remaining migrations (018-021)
These should work fine now. Apply them in order.

## ✅ Verification

After applying all migrations, run:

```sql
-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'carbon_submissions' 
AND column_name IN ('scope1_emissions_kg', 'scope2_emissions_kg', 'scope3_emissions_kg', 'png_m3');
```

Expected result: You should see all 4 columns listed.

## 🎉 Issue Resolved

The migrations are now corrected and ready to apply!
