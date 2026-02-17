# ⚠️ MIGRATION ORDER ERROR - FIXED

## Problem
Migration 017 is failing because it references `plastic_kg` column which doesn't exist yet.

## Root Cause
Migrations must be applied **in order**. Migration 016 adds the `plastic_kg` column, and migration 017 depends on it.

## ✅ SOLUTION: Apply Migrations in Correct Order

### Step 1: Apply Migration 016 FIRST
This adds all required columns including `plastic_kg`.

```sql
-- Migration 016: Add Scope Columns
-- Copy/paste this entire content into Supabase SQL Editor

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

**Execute this and verify it succeeds.**

### Step 2: Verify Columns Were Added

```sql
-- Check that plastic_kg column now exists
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'carbon_submissions' 
AND column_name IN ('plastic_kg', 'organic_waste_kg', 'scope1_emissions_kg', 'scope2_emissions_kg', 'scope3_emissions_kg');
```

**Expected:** You should see all 5 columns listed.

### Step 3: Now Apply Migration 017
Once migration 016 is successfully applied, apply migration 017:

```sql
-- Copy the entire content from:
-- E:\Projects\Carbon-tracker\supabase\migrations\017_update_carbon_calculation_trigger.sql
-- And paste into Supabase SQL Editor
```

### Step 4: Backfill Existing Data

```sql
-- Update existing submissions to calculate scope values
UPDATE carbon_submissions SET updated_at = updated_at;

-- Verify calculations worked
SELECT 
  id,
  electricity_kwh,
  scope2_emissions_kg,
  diesel_liters,
  scope1_emissions_kg,
  plastic_kg,
  total_carbon_kg
FROM carbon_submissions
LIMIT 5;
```

---

## 🚀 Using Supabase CLI (Recommended)

If you have Supabase CLI, it will automatically apply migrations in order:

```bash
cd E:\Projects\Carbon-tracker
supabase db push
```

This ensures migrations 016, 017, 018, 019, 020, 021, 022, 023 are applied in sequence.

---

## ✅ Verification Checklist

After applying both migrations:

- [ ] Migration 016 executed successfully
- [ ] Column `plastic_kg` exists in `carbon_submissions`
- [ ] Migration 017 executed successfully
- [ ] Trigger `calculate_carbon_on_insert` exists
- [ ] Function `calculate_carbon_metrics()` exists
- [ ] Existing records have calculated scope values

---

## 🔍 Troubleshooting

### If Migration 016 Fails
Check if columns already exist:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'carbon_submissions';
```

If they exist, migration 016 will skip them (IF NOT EXISTS).

### If Migration 017 Still Fails
Ensure migration 016 completed:
```sql
-- This should return 5 rows
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'carbon_submissions' 
AND column_name IN ('plastic_kg', 'organic_waste_kg', 'scope1_emissions_kg', 'scope2_emissions_kg', 'scope3_emissions_kg');
```

---

## 📋 Complete Migration Order

For all Carbon Neutrality & GHG Protocol features:

1. ✅ **016** - Add scope columns
2. ✅ **017** - Update calculation trigger
3. ⏭️ **018** - Campus carbon summary
4. ⏭️ **019** - Carbon simulations
5. ⏭️ **020** - Recommendation engine
6. ⏭️ **021** - Department budgets
7. ⏭️ **022** - GHG Protocol inventory schema
8. ⏭️ **023** - GHG Protocol functions

**Always apply in this order!**

---

## ✨ Issue Resolved

Once migration 016 is applied first, migration 017 will work correctly because `plastic_kg` will exist.
