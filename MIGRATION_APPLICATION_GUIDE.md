# How to Apply Survey Fix Migration

## Prerequisites
- Supabase project connected
- Database access (via CLI or Dashboard)

## Method 1: Using Supabase CLI (Recommended)

### Step 1: Ensure CLI is installed
```bash
# Check if installed
supabase --version

# If not installed, install it:
npm install -g supabase
```

### Step 2: Link your project (if not already)
```bash
# Navigate to project directory
cd E:\Projects\Carbon-tracker

# Login to Supabase (if not logged in)
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 3: Push migrations
```bash
# This will apply all pending migrations including 015_fix_survey_validation.sql
supabase db push
```

### Step 4: Verify
```bash
# Check migration status
supabase migration list
```

## Method 2: Manual via Supabase Dashboard

### Step 1: Get the SQL
1. Open the file: `E:\Projects\Carbon-tracker\supabase\migrations\015_fix_survey_validation.sql`
2. Copy the entire contents (Ctrl+A, Ctrl+C)

### Step 2: Execute in Dashboard
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Paste the copied SQL
6. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Success
You should see:
```
Success! No rows returned
```

If you see errors, check:
- Is your database connection active?
- Do you have admin permissions?
- Were previous migrations applied?

## Method 3: Using psql (Advanced)

If you have direct PostgreSQL access:

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration
\i E:/Projects/Carbon-tracker/supabase/migrations/015_fix_survey_validation.sql

# Verify
\df calculate_survey_emissions
```

## Verification Steps

After applying the migration, verify it worked:

### Check 1: Function Updated
```sql
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'calculate_survey_emissions';
```

**Expected**: Should return function with new logic (check for `question_type IN ('number')`)

### Check 2: Questions Updated
```sql
SELECT COUNT(*) as question_count
FROM survey_questions 
WHERE survey_id IN (
  SELECT id FROM surveys WHERE title = 'Student Carbon Footprint Survey 2026'
);
```

**Expected**: Should return `15` (15 questions)

### Check 3: Question Types
```sql
SELECT 
  question_text, 
  question_type, 
  is_required, 
  emission_category
FROM survey_questions 
WHERE survey_id IN (
  SELECT id FROM surveys WHERE title LIKE '%Student%'
)
ORDER BY order_index;
```

**Expected**: Should show refined questions with proper types

## Common Issues

### Issue: "relation does not exist"
**Cause**: Earlier migrations not applied
**Fix**: Run all migrations in order:
```bash
supabase db reset  # For dev - resets and runs all migrations
# OR
supabase db push   # For prod - runs pending migrations only
```

### Issue: "duplicate key value violates unique constraint"
**Cause**: Migration already applied or questions already exist
**Fix**: The migration handles this by deleting existing questions first. If error persists, manually delete:
```sql
DELETE FROM survey_questions 
WHERE survey_id IN (
  SELECT id FROM surveys WHERE title = 'Student Carbon Footprint Survey 2026'
);
```
Then re-run the migration.

### Issue: "permission denied"
**Cause**: Insufficient database permissions
**Fix**: Ensure you're connected as superuser/owner. Check your Supabase project settings.

### Issue: "function calculate_survey_emissions does not exist"
**Cause**: Migration 005_survey_system.sql not applied
**Fix**: Run earlier migrations first:
```bash
supabase db reset  # Runs all migrations from scratch
```

## Rollback (If Needed)

If you need to rollback (not recommended after testing):

```sql
-- Restore old function (from 005_survey_system.sql)
-- This will bring back the bug, only use for emergency rollback

DROP FUNCTION IF EXISTS calculate_survey_emissions();

CREATE OR REPLACE FUNCTION calculate_survey_emissions()
RETURNS TRIGGER AS $$
-- [Original function code from 005_survey_system.sql]
$$;
```

## Post-Migration Testing

After applying migration:

1. **Frontend Test**:
   ```bash
   npm run dev
   ```
   - Login as student
   - Try submitting survey with mixed text/numeric answers
   - Should succeed ✓

2. **Database Test**:
   ```sql
   -- Check recent responses
   SELECT * FROM survey_responses ORDER BY submitted_at DESC LIMIT 5;
   ```
   - Verify `responses` JSONB contains mixed types
   - Verify `calculated_emissions` only has numeric categories
   - Verify `total_carbon` is calculated

3. **UI Test**:
   - Check optional questions show "(Optional)" label
   - Check helpful hints appear for optional questions
   - Check validation only blocks required fields

## Success Checklist

- [ ] Migration file executed without errors
- [ ] Function `calculate_survey_emissions` updated
- [ ] 15 survey questions created
- [ ] Old questions deleted
- [ ] Trigger recreated
- [ ] Frontend displays surveys correctly
- [ ] Test submission works (hosteller scenario)
- [ ] Test submission works (day scholar scenario)
- [ ] Emissions calculated correctly
- [ ] No "numeric value" errors

## Need Help?

If migration fails or you encounter issues:

1. Check Supabase logs:
   - Dashboard → Logs → Database
   
2. Check migration status:
   ```bash
   supabase migration list
   ```

3. Review error messages carefully:
   - Copy exact error text
   - Check which line number
   - Search in migration file

4. Try reset (development only):
   ```bash
   supabase db reset
   ```

5. See other docs:
   - `SURVEY_VALIDATION_FIX.md` - Technical details
   - `SURVEY_TESTING_CHECKLIST.md` - Testing guide
   - `QUICK_FIX_SURVEY.md` - Quick reference

## Summary

**Fastest Method**: `supabase db push` (if CLI setup)  
**Easiest Method**: Copy SQL to Dashboard → SQL Editor  
**Most Control**: Direct psql connection

Choose the method that works best for your setup!
