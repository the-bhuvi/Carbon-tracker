# Dashboard Troubleshooting Guide

## Symptom: Blank Page on Dashboard

This is **NORMAL** if you haven't added any data yet!

---

## Diagnosis: Is Your System Working?

### Test 1: Check if Dashboard Loads
Navigate to: `/dashboard`

**Expected Results**:
- [ ] Page loads without errors
- [ ] Title "Carbon Footprint Dashboard" visible
- [ ] View Mode toggles visible (Monthly / Academic Year buttons)
- [ ] "No emission data available" message appears

If YES → System is working, just needs data  
If NO → See **Issue: Page doesn't load** below

---

### Test 2: Check Admin Input Form
Navigate to: `/admin/input`

**Expected Results**:
- [ ] Form loads without errors
- [ ] All fields visible:
  - Year dropdown
  - Month dropdown
  - Factor dropdown (12 options)
  - Activity Data input
  - Auto-populated Emission Factor
  - Auto-populated Unit
  - Calculated CO2e field
  - Submit button

If YES → System is working  
If NO → See **Issue: Form not loading** below

---

### Test 3: Try Adding Sample Data
Fill form with this data:
```
Year: 2024
Month: 7
Factor: Electricity
Activity Data: 1000
```

Click **Submit**

**Expected Results**:
- [ ] Green success toast appears
- [ ] Form resets
- [ ] No error messages

If YES → Data entry working  
If NO → See **Issue: Can't submit data** below

---

### Test 4: Check Dashboard Refresh
Navigate back to `/dashboard`

**Expected Results**:
- [ ] Data now visible (no more "No emission data" message)
- [ ] KPI cards show values
- [ ] Charts display data
- [ ] Calculated values are correct:
  - Total: 730 kg CO2e
  - Per Capita: 0.146 kg CO2e/student
  - Highest Factor: Electricity

If YES → System fully operational! 🎉  
If NO → See **Issue: Data not showing** below

---

## Common Issues & Solutions

### Issue 1: Dashboard Shows "No emission data available"

**This is EXPECTED if you haven't added data yet!**

✅ **Solution**: 
1. Go to `/admin/input`
2. Add test data (see instructions above)
3. Return to `/dashboard`
4. Data should appear

---

### Issue 2: Page doesn't load / Blank white screen

**Cause**: Likely a JavaScript error or missing component

✅ **Solution**:

**Step 1: Check Browser Console**
1. Press **F12** to open Developer Tools
2. Click **Console** tab
3. Look for red error messages
4. Take a screenshot of errors

**Common errors**:
- `Cannot read property 'data' of undefined` → Hook not returning data
- `useMonthlyEmissionByYear is not a function` → Import missing
- `Cannot find module` → File not found

**Step 2: Hard Refresh**
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

**Step 3: Check Network Tab**
1. Open Developer Tools (**F12**)
2. Click **Network** tab
3. Reload page
4. Look for red error requests (404, 500)
5. Check `/api/` endpoints are working

---

### Issue 3: Form won't submit / Error on submit

**Cause**: Form validation or API error

✅ **Solution**:

**Step 1: Check Required Fields**
- [ ] Year is selected (dropdown not blank)
- [ ] Month is selected (dropdown not blank)
- [ ] Factor is selected (dropdown not blank)
- [ ] Activity Data has a number

**Step 2: Check Console for Error**
1. Press **F12**
2. Open **Console** tab
3. Try submitting form again
4. Look for red error messages

**Step 3: Verify Admin Login**
- [ ] You should be logged in as **admin**
- [ ] Check user menu (top right) shows your role
- [ ] If not admin, contact administrator

**Step 4: Check Database**
Verify enrollment config exists:
```sql
SELECT * FROM enrolled_students_config;
-- Should show: 2024-2025 with 1000+ students
```

---

### Issue 4: Data not appearing in dashboard after adding it

**Cause**: Cache not refreshed or data not saved

✅ **Solution**:

**Step 1: Hard Refresh Dashboard**
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

**Step 2: Wait 2-3 Seconds**
- Dashboard has loading state
- Charts take time to render
- Calculations happen on first view

**Step 3: Check if Data Actually Saved**
1. Go to `/admin/input`
2. Select same Year/Month/Factor
3. Submit again
4. Should show "Updated successfully" (upsert, not new insertion)

**Step 4: Check Browser Console**
1. Press **F12** → **Console**
2. Look for errors like:
   - `Failed to fetch data`
   - `Network error`
   - `Unauthorized`

**Step 5: Check Database Directly**
```sql
SELECT * FROM monthly_audit_data WHERE year = 2024 AND month = 7;
-- Should show your entries
```

---

### Issue 5: Charts not rendering / Empty graphs

**Cause**: Data format issue or chart library error

✅ **Solution**:

**Step 1: Verify Data in Dashboard**
- [ ] KPI cards showing numbers (not 0)
- [ ] "No emission data" message NOT showing
- [ ] Check console for chart-specific errors

**Step 2: Add More Data**
- Pie chart needs 2+ factors
- Line chart needs 2+ months
- Try adding different factor for same month

**Step 3: Check Console**
1. Press **F12** → **Console**
2. Look for `recharts` related errors

---

### Issue 6: Wrong calculations in KPI cards

**Cause**: Incorrect enrollment count or formula

✅ **Solution**:

**Verify Enrollment Count**:
```sql
SELECT * FROM enrolled_students_config WHERE academic_year = '2024-2025';
```

**Per Capita Calculation**:
```
Expected: 730 kg / 5000 students = 0.146 kg/student
If different enrollment, recalculate
```

**Verify Monthly Summary**:
```sql
SELECT * FROM monthly_summary WHERE year = 2024 AND month = 7;
-- Check: total_emission_kg and per_capita_kg
```

---

### Issue 7: Toggle doesn't work / Views don't switch

**Cause**: State management issue or component not re-rendering

✅ **Solution**:

**Step 1: Check Console**
1. Press **F12** → **Console**
2. Look for errors

**Step 2: Hard Refresh**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

**Step 3: Try Different Route**
1. Go to `/` (home)
2. Navigate back to `/dashboard`
3. Try toggling again

---

## Advanced Diagnostics

### Check 1: Verify Database Tables Exist

```sql
SELECT tablename FROM pg_tables 
WHERE tablename IN (
  'enrolled_students_config',
  'monthly_audit_data',
  'monthly_summary',
  'academic_year_summary'
)
ORDER BY tablename;

-- Should return 4 tables (minimum)
```

### Check 2: Verify Helper Functions Exist

```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%refresh%'
ORDER BY routine_name;

-- Should return functions like:
-- refresh_monthly_summary
-- refresh_academic_year_summary
```

### Check 3: Test Monthly Summary Calculation

```sql
-- If no data shows, manually trigger recalculation:
SELECT refresh_monthly_summary(2024, 7);

-- Then check result:
SELECT * FROM monthly_summary WHERE year = 2024 AND month = 7;
```

### Check 4: Check RLS Policies

```sql
-- Verify SELECT is allowed
SELECT * FROM monthly_audit_data LIMIT 1;

-- If error, check RLS policies
SELECT policyname, permissive FROM pg_policies 
WHERE tablename = 'monthly_audit_data';
```

---

## Symptom Checklist

### If you see:

**"Loading dashboard data..." (spinner)**
→ System is loading, wait 2-3 seconds

**"No emission data available"**
→ Normal! Add test data via /admin/input

**"No data" for Academic Year View**
→ Normal if only July data entered. Add more months.

**Blank white page**
→ JavaScript error. Check console (F12)

**Form won't load**
→ Admin permission issue. Check login.

**Submitted but no toast**
→ Check console for JavaScript errors (F12)

**Data shows wrong numbers**
→ Check enrollment config and calculations

---

## Contact Support

If after trying these solutions you still have issues:

1. **Take screenshot** of the blank page
2. **Open browser console** (F12) and copy error message
3. **Check database**:
   ```sql
   SELECT COUNT(*) FROM monthly_audit_data;
   -- Tells you if data exists
   ```
4. **Check your user role**:
   - Admin? Needed for `/admin/input`
   - Logged in? Check auth status
5. **Provide information**:
   - What page you're on
   - What error you see (console)
   - What data you added
   - Database query results

---

## Quick Reference

| Page | URL | Expected Result |
|------|-----|-----------------|
| Dashboard | `/dashboard` | Shows charts/KPIs or "No data" message |
| Admin Input | `/admin/input` | Shows form with all fields |
| Landing | `/` | Shows login options |

| Action | Expected | Timeline |
|--------|----------|----------|
| Add data | Success toast | Immediate |
| Refresh page | Data appears | 1-2 seconds |
| Switch views | Charts update | < 1 second |
| Hard refresh | Cache cleared | Immediate |

---

**Status**: Troubleshooting guide complete  
**Next**: Follow the guide above to add test data
