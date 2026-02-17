# 🔧 How to Fix "total_carbon_kg" Error

## The Problem

You're getting this error:
```
ERROR: 42703: record "new" has no field "total_carbon_kg"
```

**Even though the migration file is now correct!**

## Why This Happens

The **OLD version** of the function is already in your database from a previous migration attempt. PostgreSQL is running the old function, not the new one.

---

## ✅ Solution: Clean and Reapply

### Option 1: Run Cleanup Script First (RECOMMENDED)

**Step 1:** Apply the cleanup migration
```sql
-- Run this in Supabase SQL Editor:
DROP TRIGGER IF EXISTS calculate_carbon_on_insert ON carbon_submissions;
DROP FUNCTION IF EXISTS calculate_carbon_metrics();
```

**Step 2:** Then apply migration 017 (the fixed version)
```bash
supabase db push
```

---

### Option 2: Force Replace via SQL Editor

Copy the **entire contents** of the fixed `017_update_carbon_calculation_trigger.sql` file and run it in SQL Editor. The `CREATE OR REPLACE FUNCTION` should overwrite the old one.

---

### Option 3: Reset and Start Fresh

If you haven't applied migrations 018-023 yet:

```sql
-- Remove everything from the failed attempts
DROP TRIGGER IF EXISTS calculate_carbon_on_insert ON carbon_submissions;
DROP FUNCTION IF EXISTS calculate_carbon_metrics() CASCADE;

-- Remove the scope columns if they were added incorrectly
ALTER TABLE carbon_submissions 
DROP COLUMN IF EXISTS scope1_emissions_kg,
DROP COLUMN IF EXISTS scope2_emissions_kg,
DROP COLUMN IF EXISTS scope3_emissions_kg,
DROP COLUMN IF EXISTS plastic_kg CASCADE;

-- Now apply migrations in order: 016 → 017 → 018 → 019 → 020 → 021 → 022 → 023
```

⚠️ **Warning:** This deletes the scope columns and calculated data!

---

## 🎯 Quick Fix (Safest)

Run this in Supabase SQL Editor:

```sql
-- Just drop the function and reapply
DROP TRIGGER IF EXISTS calculate_carbon_on_insert ON carbon_submissions;
DROP FUNCTION IF EXISTS calculate_carbon_metrics();
```

Then immediately run the corrected migration 017 content in SQL Editor or use:
```bash
supabase db push
```

---

## ✅ Verification

After fixing, test with:

```sql
-- Check the function was updated
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'calculate_carbon_metrics';

-- Should show NEW.total_carbon (not NEW.total_carbon_kg)
```

---

## 📋 What Happened Timeline

1. ❌ Applied migration 017 with wrong column name (`total_carbon_kg`)
2. ❌ Function created in database with bug
3. ✅ Migration file fixed (column changed to `total_carbon`)
4. ❌ But database still has old function!
5. ✅ Need to drop old function and reapply

---

## 💡 Prevention for Future

Always drop and recreate functions during development:
```sql
DROP FUNCTION IF EXISTS function_name() CASCADE;
CREATE OR REPLACE FUNCTION function_name() ...
```

The `CREATE OR REPLACE` should work, but sometimes explicit `DROP` is safer.

---

**Status:** Migration file is ✅ CORRECT  
**Problem:** Database has ❌ OLD VERSION  
**Solution:** Drop function, then reapply migration
