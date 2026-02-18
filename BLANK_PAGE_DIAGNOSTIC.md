# Blank Page Diagnostic Steps

## Issue Fixed ✅
Found and fixed a hook import issue in Dashboard.tsx:
- **Problem**: Dashboard was importing `useAcademicYearSummary` (doesn't exist)
- **Solution**: Changed to `useAcademicYearEmissionSummary` (correct name)

## Next Steps to Test

### Step 1: Verify Database Tables Exist
Go to Supabase SQL Editor and run:

```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('enrolled_students_config', 'monthly_audit_data', 'monthly_summary', 'academic_year_summary', 'carbon_offsets', 'carbon_reductions')
ORDER BY table_name;
```

Expected output: 6 tables listed

### Step 2: Verify Enrollment Data Exists
```sql
-- Check if we have enrollment config
SELECT * FROM enrolled_students_config;
```

If empty, add this data:
```sql
INSERT INTO enrolled_students_config (academic_year, total_students)
VALUES ('2024-2025', 5000);
```

### Step 3: Hard Refresh Browser
- Windows: **Ctrl + Shift + R**
- Mac: **Cmd + Shift + R**

This clears the browser cache and reloads the latest code.

### Step 4: Check Browser Console for Errors
1. Press **F12** to open developer tools
2. Go to **Console** tab
3. Look for red error messages
4. Take a screenshot if you see errors

### Step 5: Add Test Data
Go to `/admin/input` and add:
```
Year: 2024
Month: 7 (July)
Factor: Electricity
Activity Data: 1000
```

Then submit and go to `/dashboard`

---

## If Still Blank After These Steps

Run this query in Supabase SQL Editor:

```sql
-- Check monthly_summary table (where dashboard gets data)
SELECT * FROM monthly_summary;
```

If empty: You need to add monthly audit data first (see Step 5 above)

If has data: The issue is in the React component (check browser console F12)

---

## Most Common Causes

1. **Database migration not applied** → Run it in Supabase SQL Editor
2. **No enrollment data** → Insert `enrolled_students_config` record
3. **No monthly audit data** → Add data via `/admin/input`
4. **Browser cache** → Hard refresh (Ctrl+Shift+R)
5. **Hook import error** → ✅ Already fixed in Dashboard.tsx

---

## Code Fix Applied

```
File: src/pages/Dashboard.tsx
Change: useAcademicYearSummary → useAcademicYearEmissionSummary
Status: ✅ Complete
```
