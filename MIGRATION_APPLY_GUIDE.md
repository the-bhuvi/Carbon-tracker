# Apply Carbon Neutrality Migrations

## Prerequisites
- Supabase project set up
- Supabase CLI installed OR access to Supabase dashboard

## Option 1: Using Supabase CLI (Recommended)

### Step 1: Ensure you're in the project root
```bash
cd E:\Projects\Carbon-tracker
```

### Step 2: Link to your Supabase project (if not already linked)
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 3: Apply all migrations
```bash
supabase db push
```

This will apply all migrations in order from the `supabase/migrations/` directory.

### Step 4: Verify migrations
```bash
supabase db diff
```

---

## Option 2: Using Supabase Dashboard

### Step 1: Open Supabase Dashboard
Go to https://app.supabase.com/project/YOUR_PROJECT/sql

### Step 2: Apply migrations in order

Copy and paste each migration file content into the SQL editor and execute:

#### Migration 1: Add Scope Columns
File: `supabase/migrations/016_add_scope_columns.sql`

#### Migration 2: Update Carbon Calculation Trigger  
File: `supabase/migrations/017_update_carbon_calculation_trigger.sql`

**Important:** After this migration, backfill existing data:
```sql
UPDATE carbon_submissions SET updated_at = updated_at;
```

#### Migration 3: Campus Carbon Summary
File: `supabase/migrations/018_campus_carbon_summary.sql`

**Test it:**
```sql
SELECT * FROM get_campus_carbon_summary(2024);
```

#### Migration 4: Carbon Simulations
File: `supabase/migrations/019_carbon_simulations.sql`

**Test it:**
```sql
SELECT * FROM simulate_carbon_reduction(2024, 1000, 20, 15, 30);
```

#### Migration 5: Recommendation Engine
File: `supabase/migrations/020_recommendation_engine.sql`

**Test it:**
```sql
SELECT * FROM generate_recommendations(2024);
```

#### Migration 6: Department Budgets
File: `supabase/migrations/021_department_budgets.sql`

**Test it:**
```sql
SELECT * FROM get_all_department_budgets(2024);
```

---

## Verification Steps

### 1. Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('campus_carbon_summary', 'carbon_simulations');
```

Expected: Both tables should be listed.

### 2. Check New Columns
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'carbon_submissions' 
AND column_name IN ('scope1_emissions_kg', 'scope2_emissions_kg', 'scope3_emissions_kg');
```

Expected: Three scope columns should be listed.

### 3. Check Department Budget Column
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'departments' 
AND column_name = 'carbon_budget';
```

Expected: `carbon_budget` column should exist.

### 4. Check Functions Exist
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_campus_carbon_summary',
  'refresh_campus_carbon_summary',
  'simulate_carbon_reduction',
  'generate_recommendations',
  'check_department_budget',
  'get_all_department_budgets'
);
```

Expected: All 6 functions should be listed.

### 5. Test with Sample Data
```sql
-- Check if scope calculations work
SELECT 
  id,
  electricity_kwh,
  scope2_emissions_kg,
  diesel_liters,
  scope1_emissions_kg,
  total_carbon_kg
FROM carbon_submissions
LIMIT 5;
```

Expected: Scope columns should have calculated values.

---

## Rollback (If Needed)

If you need to rollback changes:

### Rollback Migration 6 (Department Budgets)
```sql
ALTER TABLE departments DROP COLUMN IF EXISTS carbon_budget;
DROP FUNCTION IF EXISTS calculate_department_budget(UUID);
DROP FUNCTION IF EXISTS check_department_budget(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_all_department_budgets(INTEGER);
DROP FUNCTION IF EXISTS auto_update_department_budget();
DROP TRIGGER IF EXISTS department_budget_update ON departments;
```

### Rollback Migration 5 (Recommendations)
```sql
DROP FUNCTION IF EXISTS generate_recommendations(INTEGER);
```

### Rollback Migration 4 (Simulations)
```sql
DROP TABLE IF EXISTS carbon_simulations CASCADE;
DROP FUNCTION IF EXISTS simulate_carbon_reduction(INTEGER, INTEGER, DECIMAL, DECIMAL, DECIMAL);
```

### Rollback Migration 3 (Campus Summary)
```sql
DROP TABLE IF EXISTS campus_carbon_summary CASCADE;
DROP FUNCTION IF EXISTS refresh_campus_carbon_summary(INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_campus_carbon_summary(INTEGER);
```

### Rollback Migration 2 (Trigger Update)
```sql
-- Restore old trigger (check 002_calculation_functions.sql for original)
```

### Rollback Migration 1 (Scope Columns)
```sql
ALTER TABLE carbon_submissions 
DROP COLUMN IF EXISTS scope1_emissions_kg,
DROP COLUMN IF EXISTS scope2_emissions_kg,
DROP COLUMN IF EXISTS scope3_emissions_kg,
DROP COLUMN IF EXISTS organic_waste_kg;

ALTER TABLE emission_factors
DROP COLUMN IF EXISTS paper_factor,
DROP COLUMN IF EXISTS plastic_factor,
DROP COLUMN IF EXISTS organic_waste_factor;
```

---

## Post-Migration Tasks

### 1. Update Existing Department Budgets
All departments with student counts should now have budgets. Verify:
```sql
SELECT 
  name,
  student_count,
  carbon_budget,
  (student_count * 300) as expected_budget
FROM departments
WHERE student_count IS NOT NULL;
```

### 2. Generate Initial Campus Summary
For each year with data:
```sql
SELECT * FROM refresh_campus_carbon_summary(2024, 1000);
SELECT * FROM refresh_campus_carbon_summary(2023, 900);
-- Adjust tree count as needed
```

### 3. Test Frontend
1. Start development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/carbon-neutrality`

3. Verify:
   - [ ] KPI cards display correctly
   - [ ] Charts render with data
   - [ ] Simulator sliders work
   - [ ] Recommendations appear
   - [ ] Year selector functions

### 4. Grant Additional Permissions (If Needed)
If users encounter permission errors:
```sql
GRANT EXECUTE ON FUNCTION get_campus_carbon_summary(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_campus_carbon_summary(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION simulate_carbon_reduction(INTEGER, INTEGER, DECIMAL, DECIMAL, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_recommendations(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_department_budget(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_department_budgets(INTEGER) TO authenticated;
```

---

## Troubleshooting

### Error: "relation does not exist"
**Cause:** Migration not applied or applied incorrectly.
**Solution:** Re-run the specific migration.

### Error: "permission denied for function"
**Cause:** RPC permissions not set.
**Solution:** Run GRANT statements above.

### Scope values are NULL
**Cause:** Trigger not updating existing records.
**Solution:** 
```sql
UPDATE carbon_submissions SET updated_at = updated_at;
```

### Campus summary returns no data
**Cause:** Summary not generated for the year.
**Solution:**
```sql
SELECT * FROM refresh_campus_carbon_summary(2024, 1000);
```

### Department budget is 0
**Cause:** Student count is NULL or 0.
**Solution:**
```sql
UPDATE departments SET student_count = 100 WHERE id = 'dept-uuid';
-- Budget will auto-calculate via trigger
```

---

## Success Criteria

✅ All 6 migrations applied without errors  
✅ Existing data still intact  
✅ Scope calculations working on existing submissions  
✅ Campus summary can be retrieved for current year  
✅ Simulation returns projected values  
✅ Recommendations are generated  
✅ Department budgets calculated  
✅ Frontend dashboard accessible at `/carbon-neutrality`  
✅ All charts and components render correctly  
✅ No console errors in browser  

---

## Next Steps After Migration

1. **Populate Tree Count:** Update campus tree count in summary
2. **Review Recommendations:** Check if recommendations make sense for your data
3. **Set Department Targets:** Review and adjust department budgets if needed
4. **Train Users:** Share CARBON_NEUTRALITY_GUIDE.md with team
5. **Monitor Performance:** Check query performance with real data
6. **Plan Actions:** Use recommendations to plan emission reduction strategies

---

## Support

For migration issues:
1. Check Supabase logs in dashboard
2. Verify PostgreSQL version (14+)
3. Ensure sufficient database permissions
4. Check for conflicting migrations
5. Review error messages carefully

## Contact
Refer to project documentation or open an issue in the repository.
