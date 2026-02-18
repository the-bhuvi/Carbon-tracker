# Database Setup Verification Guide

## ✅ Code Fix Applied
**Dashboard Hook Error**: Fixed import of `useAcademicYearSummary` → `useAcademicYearEmissionSummary`

This was causing the dashboard to fail to render. Now fixed and ready to test.

---

## Database Setup Checklist

Run these queries in your **Supabase SQL Editor** to verify setup:

### 1. Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN (
  'enrolled_students_config', 
  'monthly_audit_data', 
  'monthly_summary', 
  'academic_year_summary', 
  'carbon_offsets', 
  'carbon_reductions'
)
ORDER BY table_name;
```

**Expected**: 6 tables listed

---

### 2. Verify Enrollment Data
```sql
SELECT * FROM enrolled_students_config;
```

**If empty**, run this to add data:
```sql
INSERT INTO enrolled_students_config (academic_year, total_students)
VALUES ('2024-2025', 5000)
ON CONFLICT DO NOTHING;
```

---

### 3. Check Monthly Data (Should be Empty at First)
```sql
SELECT COUNT(*) as audit_record_count FROM monthly_audit_data;
```

**Expected at first**: 0 records (will populate as you add data via the form)

---

### 4. Check Monthly Summary (Aggregate Table)
```sql
SELECT COUNT(*) as summary_count FROM monthly_summary;
```

**Expected at first**: 0 records (auto-populates when you add audit data)

---

## Browser Setup

### Clear Cache & Reload
1. **Hard Refresh**: Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
2. **Or**: Open Developer Tools → Settings → Check "Disable cache (while DevTools open)"

### Check for Console Errors
1. Press **F12** to open Developer Tools
2. Click **Console** tab
3. Look for red error messages
4. Screenshot if you see errors

---

## Quick Test Workflow

### Step 1: Navigate to Admin Input
```
https://your-domain.com/admin/input
```

### Step 2: Fill Form
```
Year:           2024
Month:          July
Factor:         Electricity
Activity Data:  1000
Unit:           kWh (auto-fill)
Emission Factor: 0.73 (auto-fill)
Calculated:     730 kg CO₂e (auto-calculate)
```

### Step 3: Submit
Click **Submit** button

### Step 4: Expected Results
```
✓ Toast notification: "Success! Monthly audit entry recorded: 730.00 kg CO₂e"
✓ Form resets but keeps Year/Month
✓ Activity Data field clears
```

### Step 5: Add More Data
Repeat Step 2-3 three more times with:
- Diesel: 100 liters = 268 kg
- Water: 10000 liters = 3500 kg
- Travel: 5000 km = 600 kg

### Step 6: View Dashboard
```
https://your-domain.com/dashboard
```

**Expected**:
- 4 KPI cards populate with numbers
- 2 charts appear (pie and bar)
- Table shows factor breakdown
- Total: ~40,898 kg CO₂e

---

## Troubleshooting

### Problem: Still Blank After Adding Data

**Check 1**: Verify data was actually saved
```sql
SELECT * FROM monthly_audit_data WHERE year = 2024 AND month = 7;
```

**Check 2**: Verify monthly summary was calculated
```sql
SELECT * FROM monthly_summary WHERE year = 2024 AND month = 7;
```

**Check 3**: Browser console errors (F12)
- Take screenshot of any red errors
- Report them

### Problem: Form Won't Submit

**Check**:
1. All required fields filled?
2. Activity Data is a number (not text)?
3. Logged in as admin?
4. Console shows no errors? (F12)

### Problem: Data Submitted But Dashboard Still Blank

**Run in Supabase SQL Editor**:
```sql
-- Manually trigger the calculation function
SELECT refresh_monthly_summary(2024, 7);

-- Check results
SELECT * FROM monthly_summary WHERE year = 2024 AND month = 7;
```

---

## If You're Still Having Issues

Provide the following information:

1. **Screenshots of**:
   - Browser console errors (F12 → Console tab)
   - Form submission (successful or error?)
   - Dashboard page (completely blank or showing something?)

2. **SQL Query Results from**:
   - `SELECT * FROM monthly_audit_data LIMIT 5;`
   - `SELECT * FROM monthly_summary LIMIT 5;`
   - `SELECT * FROM enrolled_students_config;`

3. **Check Network Tab**:
   - F12 → Network tab
   - Try to submit form
   - Look for red "failed" requests
   - Screenshot the failed requests

---

## What Each Database Table Does

| Table | Purpose | Status |
|-------|---------|--------|
| `enrolled_students_config` | Annual student count (for per-capita) | Must have ≥1 record |
| `monthly_audit_data` | Raw factor-wise emission inputs | Populates as you enter data |
| `monthly_summary` | Aggregated monthly totals | Auto-calculates from audit data |
| `academic_year_summary` | July-June academic year totals | Auto-calculates monthly summaries |
| `carbon_offsets` | Offset tracking (for neutrality) | Optional, for later |
| `carbon_reductions` | Reduction tracking (for neutrality) | Optional, for later |

---

## Success Criteria ✓

- [ ] All 6 tables exist
- [ ] `enrolled_students_config` has 2024-2025 record (5000 students)
- [ ] Can navigate to `/admin/input`
- [ ] Can fill and submit form without errors
- [ ] Toast message appears: "Success! Monthly audit..."
- [ ] Data appears in `monthly_audit_data` table
- [ ] Data appears in `monthly_summary` table
- [ ] Dashboard `/dashboard` loads without errors
- [ ] Dashboard shows 4 KPI cards with numbers
- [ ] Dashboard shows charts and graphs

---

## Next Steps

After verification:
1. ✓ Add at least 3-4 months of data (July-October 2024)
2. ✓ Verify dashboard populates with all data
3. ✓ Check Monthly View works
4. ✓ Check Academic Year View works (select 2024-2025)
5. ✓ Add carbon offsets/reductions (optional, advanced)

---

**Status**: ✅ Ready to test
**Code**: Fixed hook import error
**Database**: Verify using queries above
**Form**: Ready to accept data
**Dashboard**: Ready to display data
