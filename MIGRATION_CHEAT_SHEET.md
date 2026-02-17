# 🚀 Migration Quick Reference Card

## ⚠️ CRITICAL: If You Already Tried to Apply Migrations

**Getting "total_carbon_kg does not exist" error?**

The old function is cached in your database! Run this first:

```sql
DROP TRIGGER IF EXISTS calculate_carbon_on_insert ON carbon_submissions;
DROP FUNCTION IF EXISTS calculate_carbon_metrics();
```

Then reapply migrations. See **FIX_CACHED_FUNCTION_ERROR.md** for details.

---

## ⚠️ CRITICAL: Column Names Fixed

**Database uses these exact names:**
- ✅ `png_m3` (NOT png_cubic_meters)
- ✅ `total_carbon` (NOT total_carbon_kg)

All migrations now use correct names!

---

## One-Liner Solution
```bash
cd E:\Projects\Carbon-tracker && supabase db push
```
**Done!** That's all you need. ✅

---

## If You Don't Have Supabase CLI

### Install It First (1 minute)
```bash
npm install -g supabase
```

### Then Apply
```bash
supabase db push
```

---

## Manual Application Order
If you must use SQL Editor, copy/paste in this order:

```
016 → 017 → 018 → 019 → 020 → 021 → 022 → 023
```

**Remember:** Each checks for prerequisites. If error occurs, read the message—it tells you what to do.

---

## Quick Verification (After Application)
```sql
-- Should return 6 tables
SELECT table_name FROM information_schema.tables 
WHERE table_name IN (
  'campus_carbon_summary', 'carbon_simulations',
  'emission_categories', 'emission_records',
  'emission_factors_config', 'baseline_years'
);

-- Should return 3 columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'carbon_submissions' 
AND column_name LIKE 'scope%';

-- Should work without error
SELECT * FROM generate_recommendations(2024);
```

If all three queries work → ✅ **Success!**

---

## Common Errors (FIXED)

### ❌ OLD: "column plastic_kg does not exist"
**Was:** Cryptic database error  
**Now:** "Migration 016 must be applied first!"

### ❌ OLD: "table campus_carbon_summary does not exist"
**Was:** Generic error  
**Now:** "Migration 018 must be applied first!"

All migrations now give **clear, actionable errors**.

---

## Migration Purpose Quick Guide

| # | Name | What It Does | Depends On |
|---|------|--------------|------------|
| 016 | Scope Columns | Adds scope1/2/3 tracking | None |
| 017 | Trigger Update | Auto-calculates scopes | 016 |
| 018 | Campus Summary | Campus-wide aggregation | 016 |
| 019 | Simulations | What-if scenarios | 018 |
| 020 | Recommendations | Smart suggestions | 016 |
| 021 | Dept Budgets | Per-department budgets | 016 |
| 022 | GHG Protocol Schema | Professional inventory | None |
| 023 | GHG Protocol Functions | Inventory calculations | 022 |

---

## Files You Need
All in: `E:\Projects\Carbon-tracker\supabase\migrations\`

All files already **FIXED** with:
- ✅ Dependency checks
- ✅ Clear error messages  
- ✅ Safe operations
- ✅ Order validation

---

## What Was Fixed?
5 migrations got dependency checks added:
- 017 (trigger)
- 018 (summary)
- 019 (simulations)
- 020 (recommendations)
- 021 (budgets)
- 023 (GHG functions)

**Result:** No more mysterious "column does not exist" errors!

---

## Full Documentation
- **Quick start:** APPLY_MIGRATIONS_NOW.md
- **Detailed info:** MIGRATIONS_ALL_FIXED.md
- **Summary:** MIGRATION_FIXES_COMPLETE.md
- **Feature guides:** CARBON_NEUTRALITY_GUIDE.md, GHG_PROTOCOL_INVENTORY_GUIDE.md

---

## TL;DR
1. Run `supabase db push`
2. Verify with queries above
3. Done! 🎉

**Time:** < 5 minutes  
**Risk:** Low  
**Breaking changes:** None  

---

**Status:** ✅ Ready  
**Recommended method:** Supabase CLI  
**Alternative:** Manual SQL Editor (order: 016→017→018→019→020→021→022→023)
