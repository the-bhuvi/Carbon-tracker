# Quick Start - Adding Test Data to Dashboard

The dashboard is showing a blank page because **there's no data in the database yet**. This is normal!

Follow these steps to add test data and see the dashboard in action.

---

## Step 1: Go to Admin Input Page

Navigate to: **`/admin/input`**

---

## Step 2: Add First Monthly Audit Entry

Fill in the form with this data:

```
Year: 2024
Month: 7 (July)
Emission Factor: Electricity
Activity Data: 50000
(Emission Factor will auto-populate: 0.73)
(Unit will auto-populate: kWh)
Calculated CO2e: 36,500 kg (auto-calculated)
Notes: (optional)
```

Click **Submit**

You should see: ✅ "Submission successful" toast notification

---

## Step 3: Add More Factors for Same Month

Add 3 more entries for July 2024 with different factors:

### Entry 2:
```
Year: 2024
Month: 7
Emission Factor: Diesel
Activity Data: 100
(Will auto-populate: 2.68 kg/liter)
Calculated CO2e: 268 kg
```
Click **Submit**

### Entry 3:
```
Year: 2024
Month: 7
Emission Factor: Water
Activity Data: 10000
(Will auto-populate: 0.35 kg/1000L)
Calculated CO2e: 3,500 kg
```
Click **Submit**

### Entry 4:
```
Year: 2024
Month: 7
Emission Factor: Travel (km)
Activity Data: 5000
(Will auto-populate: 0.12 kg/km)
Calculated CO2e: 600 kg
```
Click **Submit**

---

## Step 4: View Dashboard

Navigate to: **`/dashboard`**

You should now see:

✅ **Dashboard Data**:
- Total Emission: **40,868 kg** (36,500 + 268 + 3,500 + 600)
- Per Capita: **8.17 kg/student** (40,868 / 5,000)
- Highest Factor: **Electricity** (36,500 kg)
- Neutrality %: **0%** (no offsets/reductions yet)

✅ **Charts**:
- Factor Breakdown (pie chart):
  - Electricity: 89.3%
  - Water: 8.6%
  - Travel: 1.5%
  - Diesel: 0.7%
  
- Trend Chart:
  - July 2024: 40,868 kg

---

## Step 5 (Optional): Add More Months

Add data for August 2024:

```
Year: 2024
Month: 8
Emission Factor: Electricity
Activity Data: 45000
Calculated CO2e: 32,850 kg
```

And a few more for August:
```
Diesel: 120 liters = 321.6 kg
Water: 12000 liters = 4,200 kg
Travel: 4000 km = 480 kg
```

Now the trend chart will show two months with progression.

---

## Expected Results After Data Entry

### Dashboard Should Show:
1. ✅ **Monthly View** (default)
   - Total emission from all months combined
   - Charts with real data
   - Per-capita calculations
   
2. ✅ **Academic Year View** (toggle)
   - All data from July 2024 onwards
   - Year-to-date totals

3. ✅ **KPI Cards**
   - Total Emission (actual kg CO2e)
   - Per Capita (kg CO2e per student)
   - Highest Factor (top emission source)
   - Neutrality % (0% - no offsets yet)

4. ✅ **Factor Breakdown Chart**
   - All factors shown in pie or bar chart
   - Sorted by emissions (highest first)
   - Color-coded

5. ✅ **Trend Chart**
   - Monthly progression (X-axis: months)
   - Emissions (Y-axis: kg CO2e)
   - Optional per-capita overlay

---

## Troubleshooting

### Issue: Still seeing blank page after adding data?

**Solution 1: Hard refresh browser**
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

**Solution 2: Check browser console for errors**
1. Open Developer Tools: **F12**
2. Go to **Console** tab
3. Look for red error messages
4. Share the error in your question

**Solution 3: Verify data was saved**
1. Go to **/admin/input**
2. Submit the same data again
3. Should get: "Updated successfully" (if upsert worked)

### Issue: Form won't submit?

**Check**:
- [ ] Logged in as admin user
- [ ] All required fields filled (Year, Month, Factor, Activity Data)
- [ ] No browser console errors (F12)
- [ ] Network tab shows POST request success

---

## How the System Works

### Data Flow:
1. **Admin Input Form** → Submit monthly audit data
2. **monthly_audit_data table** → Stores raw factor entries
3. **Automatic Trigger** → Calculates per-capita and aggregates
4. **Dashboard** → Queries and displays data in charts

### Calculations:
```
Total Emission = Sum of all factors for a month
Per Capita = Total Emission / Student Count (5,000)
Highest Factor = Factor with largest emission value
Neutrality % = (Offsets + Reductions) / Total Emission
```

---

## Next Steps

Once you have data in the dashboard:

1. **View Monthly Data**
   - Select year and month
   - Check charts and KPIs

2. **Switch to Academic Year View**
   - Toggle to "Academic Year View" button
   - See July-June aggregations

3. **Add More Data**
   - Enter data for multiple months
   - Watch trends develop

4. **Add Offsets/Reductions** (Advanced)
   - Use database directly or future API
   - See Neutrality % change

---

## Sample Data Commands (Database Direct)

If you want to add data directly via SQL:

```sql
-- Make sure enrollment exists
INSERT INTO enrolled_students_config (academic_year, total_students, notes)
VALUES ('2024-2025', 5000, 'Test data')
ON CONFLICT (academic_year) DO NOTHING;

-- Add audit data
INSERT INTO monthly_audit_data (year, month, factor_name, activity_data, emission_factor, unit)
VALUES 
  (2024, 7, 'Electricity', 50000, 0.73, 'kWh'),
  (2024, 7, 'Diesel', 100, 2.68, 'liters'),
  (2024, 7, 'Water', 10000, 0.35, 'liters'),
  (2024, 7, 'Travel (km)', 5000, 0.12, 'km');

-- Refresh monthly summary
SELECT refresh_monthly_summary(2024, 7);

-- Check results
SELECT * FROM monthly_summary WHERE year = 2024 AND month = 7;
```

---

## Still Need Help?

1. **Check error message** - Browser console (F12)
2. **Verify admin login** - Make sure logged in as admin
3. **Check enrollment config** - Verify 2024-2025 exists in database
4. **Verify migration** - Check all 6 tables exist in database

---

**Status**: Ready for data entry  
**Next**: Add test data above and view dashboard
