# 🚀 Quick Migration Application Guide

## ✅ All Migrations Fixed & Ready

All 8 migration files have been updated with:
- Dependency checks
- Clear error messages
- Safe IF NOT EXISTS clauses
- Order validation

---

## 🎯 3 Ways to Apply Migrations

### Option 1: Supabase CLI (RECOMMENDED) ⭐

```bash
cd E:\Projects\Carbon-tracker
supabase db push
```

**That's it!** The CLI automatically:
- Reads all files in `supabase/migrations/`
- Applies them in correct numerical order
- Tracks which ones are already applied
- Skips already-applied migrations

---

### Option 2: Bash Script

```bash
cd E:\Projects\Carbon-tracker
chmod +x apply_migrations.sh
./apply_migrations.sh
```

---

### Option 3: Manual Application via Dashboard

**Go to:** Supabase Dashboard → SQL Editor → New Query

**Apply in this exact order:**

1. Copy contents of `016_add_scope_columns.sql` → Run
2. Copy contents of `017_update_carbon_calculation_trigger.sql` → Run
3. Copy contents of `018_campus_carbon_summary.sql` → Run
4. Copy contents of `019_carbon_simulations.sql` → Run
5. Copy contents of `020_recommendation_engine.sql` → Run
6. Copy contents of `021_department_budgets.sql` → Run
7. Copy contents of `022_ghg_protocol_inventory_schema.sql` → Run
8. Copy contents of `023_ghg_protocol_functions.sql` → Run

**If any migration fails:**
- Read the error message carefully
- It will tell you which prerequisite is missing
- Apply the prerequisite first

---

## ✅ Verification Checklist

After applying, run these queries to verify:

### 1. Check Scope Columns Added (Migration 016)
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'carbon_submissions' 
AND column_name IN ('scope1_emissions_kg', 'scope2_emissions_kg', 'scope3_emissions_kg', 'plastic_kg');
```
**Expected:** All 4 columns listed

---

### 2. Check Trigger Updated (Migration 017)
```sql
-- Check trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'calculate_carbon_on_insert';

-- Check calculations work
SELECT 
  id, 
  electricity_kwh,
  scope1_emissions_kg, 
  scope2_emissions_kg, 
  scope3_emissions_kg,
  total_carbon_kg
FROM carbon_submissions 
LIMIT 5;
```
**Expected:** Trigger exists, scope values are calculated (non-zero if data exists)

---

### 3. Check Campus Summary (Migration 018)
```sql
-- Check table exists
SELECT * FROM campus_carbon_summary LIMIT 1;

-- Test function
SELECT * FROM get_campus_carbon_summary(2024);
```
**Expected:** Table exists, function returns data (or empty if no 2024 data yet)

---

### 4. Test Simulation (Migration 019)
```sql
SELECT * FROM simulate_carbon_reduction(2024, 1000, 20, 15, 30);
```
**Expected:** Returns simulation results with projected emissions

---

### 5. Test Recommendations (Migration 020)
```sql
SELECT * FROM generate_recommendations(2024);
```
**Expected:** Returns list of recommendations based on current data

---

### 6. Check Department Budgets (Migration 021)
```sql
-- Check column added
SELECT carbon_budget FROM departments LIMIT 5;

-- Test function
SELECT * FROM get_all_department_budgets(2024);
```
**Expected:** Column exists, function returns budget data

---

### 7. Check GHG Protocol Tables (Migration 022)
```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('emission_categories', 'emission_factors_config', 'emission_records', 'baseline_years');

-- Check categories seeded
SELECT scope, category_name, unit 
FROM emission_categories 
ORDER BY scope, category_name;
```
**Expected:** All 4 tables exist, 14 categories listed

---

### 8. Check GHG Protocol Functions (Migration 023)
```sql
-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%emission%'
ORDER BY routine_name;

-- Test a function
SELECT * FROM get_total_campus_emissions(1, 2024, 12, 2024);
```
**Expected:** 10+ functions listed, function executes without error

---

## 🛡️ What If Something Goes Wrong?

### Error: "column does not exist"
**Cause:** Migrations applied out of order  
**Fix:** Check which migration adds that column (see MIGRATIONS_ALL_FIXED.md), apply it first

### Error: "table does not exist"
**Cause:** Prerequisite migration not applied  
**Fix:** Apply prerequisite migration first (error message will tell you which one)

### Error: "Migration 016 must be applied first"
**Fix:** This is the new helpful error! It's telling you exactly what to do. Apply migration 016.

### Migration Already Applied?
**No problem!** All migrations use `IF NOT EXISTS` or `CREATE OR REPLACE`, so they're safe to re-run.

---

## 📊 Complete Test Suite

After all migrations applied, run this comprehensive test:

```sql
-- ============================================
-- Carbon Neutrality Features Test
-- ============================================

-- 1. Scope calculations
SELECT 
  'Scope Calculations' as test,
  COUNT(*) as total_records,
  AVG(scope1_emissions_kg) as avg_scope1,
  AVG(scope2_emissions_kg) as avg_scope2,
  AVG(scope3_emissions_kg) as avg_scope3
FROM carbon_submissions;

-- 2. Campus summary
SELECT 
  'Campus Summary' as test,
  year,
  total_emissions,
  net_carbon_kg,
  carbon_neutrality_percentage
FROM campus_carbon_summary
ORDER BY year DESC
LIMIT 1;

-- 3. Simulations
SELECT 
  'Simulation' as test,
  *
FROM simulate_carbon_reduction(2024, 1000, 20, 15, 30);

-- 4. Recommendations
SELECT 
  'Recommendations' as test,
  COUNT(*) as recommendation_count,
  string_agg(category, ', ') as categories
FROM generate_recommendations(2024);

-- 5. Department budgets
SELECT 
  'Department Budgets' as test,
  COUNT(*) as departments_with_budgets,
  AVG(carbon_budget) as avg_budget
FROM departments
WHERE carbon_budget > 0;

-- ============================================
-- GHG Protocol Inventory Test
-- ============================================

-- 6. Categories seeded
SELECT 
  'GHG Categories' as test,
  scope,
  COUNT(*) as category_count
FROM emission_categories
GROUP BY scope
ORDER BY scope;

-- 7. Emission factors configured
SELECT 
  'Emission Factors' as test,
  COUNT(*) as factor_count
FROM emission_factors_config;

-- 8. Test record insertion (safe - rolls back)
DO $$
DECLARE
  test_category_id UUID;
  test_record_id UUID;
BEGIN
  -- Get a category ID
  SELECT id INTO test_category_id 
  FROM emission_categories 
  WHERE scope = 'Scope2' 
  LIMIT 1;
  
  -- Try inserting a test record
  SELECT * INTO test_record_id
  FROM insert_emission_record(
    12, -- month
    2024, -- year
    test_category_id,
    1000.00, -- activity value
    'Test record'::TEXT
  );
  
  RAISE NOTICE 'Test record created: %', test_record_id;
  
  -- Rollback (don't actually save test data)
  RAISE EXCEPTION 'Test successful - rolling back';
END $$;
```

---

## 📁 Files You Need

All fixed migration files are in:
```
E:\Projects\Carbon-tracker\supabase\migrations\
├── 016_add_scope_columns.sql                    ✅ Fixed
├── 017_update_carbon_calculation_trigger.sql    ✅ Fixed
├── 018_campus_carbon_summary.sql                ✅ Fixed
├── 019_carbon_simulations.sql                   ✅ Fixed
├── 020_recommendation_engine.sql                ✅ Fixed
├── 021_department_budgets.sql                   ✅ Fixed
├── 022_ghg_protocol_inventory_schema.sql        ✅ Safe
└── 023_ghg_protocol_functions.sql               ✅ Fixed
```

---

## 🎉 Success Indicators

You know everything worked if:

1. ✅ All 8 migrations run without errors
2. ✅ All verification queries return expected results
3. ✅ No "column does not exist" errors
4. ✅ Functions execute successfully
5. ✅ Dashboard shows new features (after frontend deployed)

---

## 📖 Further Reading

- **MIGRATIONS_ALL_FIXED.md** - Detailed migration documentation
- **CARBON_NEUTRALITY_GUIDE.md** - Carbon neutrality feature guide
- **GHG_PROTOCOL_INVENTORY_GUIDE.md** - GHG Protocol system guide

---

## 💡 Pro Tip

**Always use Supabase CLI if available.** It:
- Handles order automatically
- Tracks applied migrations
- Shows clear error messages
- Much faster than manual copying

```bash
supabase db push
```

That's it! 🚀

---

**Status:** ✅ Ready to Apply  
**Risk Level:** 🟢 Low (all migrations have safety checks)  
**Breaking Changes:** None  
**Estimated Time:** < 5 minutes
