# 🎯 WHICH FIX DO I NEED? - Decision Tree

## Start Here: What's Your Situation?

---

### ✅ Scenario 1: Fresh Start (Never Applied These Migrations)

**You are here if:**
- You've never run migrations 016-023 before
- Your database doesn't have scope columns yet
- Starting completely fresh

**What to do:**
```bash
cd E:\Projects\Carbon-tracker
supabase db push
```

**That's it!** All migrations will apply in correct order.

---

### 🔄 Scenario 2: Already Applied, Got Error, Want to Fix

**You are here if:**
- You tried to apply migrations and got an error
- Error says "column does not exist" or similar
- Want to fix and continue

#### Sub-case A: Error about "plastic_kg" or "png_cubic_meters"

**Solution:** The migration files are already fixed. Just reapply:

**Step 1:** Drop the broken function
```sql
DROP TRIGGER IF EXISTS calculate_carbon_on_insert ON carbon_submissions;
DROP FUNCTION IF EXISTS calculate_carbon_metrics();
```

**Step 2:** Reapply migrations
```bash
supabase db push
```

---

#### Sub-case B: Error about "total_carbon_kg"

**Solution:** Old function cached in database.

**Quick Fix:**
```sql
-- In Supabase SQL Editor:
DROP TRIGGER IF EXISTS calculate_carbon_on_insert ON carbon_submissions;
DROP FUNCTION IF EXISTS calculate_carbon_metrics();
```

Then:
```bash
supabase db push
```

**Why?** The migration file is correct, but your database has the old version.

---

### 🔥 Scenario 3: Nuclear Option - Start Completely Fresh

**You are here if:**
- Nothing is working
- Want to delete everything and start over
- Don't care about losing scope data (if any)

**Steps:**

**1. Run cleanup script in SQL Editor:**
Copy/paste contents of `000_nuclear_cleanup.sql`

**2. Apply all migrations fresh:**
```bash
supabase db push
```

**⚠️ Warning:** This deletes all scope data and GHG Protocol tables!

---

### 🧪 Scenario 4: Want to Test First

**You are here if:**
- Not sure which scenario you're in
- Want to check current state first

**Check what's in your database:**

```sql
-- Check if scope columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'carbon_submissions' 
AND column_name LIKE 'scope%';

-- Check if function exists
SELECT proname FROM pg_proc WHERE proname = 'calculate_carbon_metrics';

-- Check if new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('campus_carbon_summary', 'emission_categories');
```

**Results:**
- **No results for any query?** → Go to Scenario 1 (Fresh Start)
- **Function exists but getting errors?** → Go to Scenario 2 (Fix and Continue)
- **Scope columns exist but wrong data?** → Go to Scenario 3 (Nuclear Option)

---

## 📊 Quick Decision Matrix

| Your Situation | Quick Test | Recommended Action | Script to Use |
|----------------|------------|-------------------|---------------|
| Never applied before | No scope columns | Fresh apply | `supabase db push` |
| Applied, got error | Function exists | Drop & reapply | `000_cleanup_old_functions.sql` |
| Partial/broken state | Mixed results | Nuclear cleanup | `000_nuclear_cleanup.sql` |
| Applied successfully before | Everything exists | Skip/update only | Check docs |

---

## 🎯 Most Common Case (You're Probably Here)

**You applied migrations, got "column does not exist" error, and now the error won't go away even though you fixed the files.**

**Solution (30 seconds):**

```sql
-- Copy/paste this into Supabase SQL Editor:
DROP TRIGGER IF EXISTS calculate_carbon_on_insert ON carbon_submissions;
DROP FUNCTION IF EXISTS calculate_carbon_metrics();
```

Then:
```bash
cd E:\Projects\Carbon-tracker
supabase db push
```

**Done!** ✅

---

## 🆘 Still Stuck?

### Error: "column 'plastic_kg' does not exist"
→ Your migration 016 didn't apply. Apply it first:
```bash
# Apply only migration 016
supabase migration up --file 016_add_scope_columns.sql
```

### Error: "column 'total_carbon_kg' does not exist"
→ Old function cached. See **FIX_CACHED_FUNCTION_ERROR.md**

### Error: "table 'campus_carbon_summary' does not exist"
→ Migration 018 not applied. Check order.

### Other errors?
→ See **MIGRATIONS_ALL_FIXED.md** troubleshooting section

---

## 📁 Related Files

- **FIX_CACHED_FUNCTION_ERROR.md** - Detailed fix for cached function issue
- **000_cleanup_old_functions.sql** - Light cleanup (just functions)
- **000_nuclear_cleanup.sql** - Heavy cleanup (everything)
- **MIGRATION_CHEAT_SHEET.md** - Quick reference
- **ALL_FIXED_FINAL_REPORT.md** - Complete status report

---

## 💡 Pro Tip

**If unsure, go with Scenario 2 Sub-case B** (drop function and reapply). It's the safest and works 90% of the time.

```sql
DROP TRIGGER IF EXISTS calculate_carbon_on_insert ON carbon_submissions;
DROP FUNCTION IF EXISTS calculate_carbon_metrics();
```

Then:
```bash
supabase db push
```

---

**Most users need:** Scenario 2 Sub-case B  
**Recommended for safety:** Always drop function first  
**Last resort:** Scenario 3 (nuclear option)
