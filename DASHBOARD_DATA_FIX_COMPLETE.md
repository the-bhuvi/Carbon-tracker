# Dashboard Data Not Showing - Complete Solution

## 🎯 Problem
You added data directly to the `monthly_audit_data` table in the database, but it doesn't appear on the dashboard.

## 🔍 Root Cause
The dashboard displays data from **summary tables** (`monthly_summary` and `academic_year_summary`), not the raw audit data. These summary tables are calculated views that need to be **refreshed** after data is added.

### Data Flow
```
monthly_audit_data (raw data) 
          ↓
   (refresh function)
          ↓
   monthly_summary (what dashboard reads)
          ↓
    Dashboard displays it
```

When you use the **Admin Input form**, it automatically refreshes these summaries. When you add data directly to `monthly_audit_data`, they don't refresh automatically.

## ✅ Solutions

### Solution 1: Use the New Refresh Dashboard Page (Easiest)
A new utility page has been created specifically for this:

**Steps:**
1. Log in as an admin
2. Navigate to: `http://localhost:5173/refresh-dashboard`
3. Click one of these buttons:
   - **"Refresh Current Month"** - Recalculates data for this month only
   - **"Refresh Current Year"** - Recalculates all months of this year and related academic years
4. Go back to the Dashboard - your data should now appear ✨

**When to use:** Use this whenever you add data directly to the database.

### Solution 2: Run SQL Commands Directly
If you have access to your database console (Supabase, pgAdmin, etc.):

**For current month (example: March 2026):**
```sql
SELECT refresh_monthly_summary(2026, 3);
SELECT refresh_academic_year_summary('2025-2026');
```

**For an entire year:**
```sql
-- Refresh all 12 months of 2026
SELECT refresh_monthly_summary(2026, 1);
SELECT refresh_monthly_summary(2026, 2);
SELECT refresh_monthly_summary(2026, 3);
SELECT refresh_monthly_summary(2026, 4);
SELECT refresh_monthly_summary(2026, 5);
SELECT refresh_monthly_summary(2026, 6);
SELECT refresh_monthly_summary(2026, 7);
SELECT refresh_monthly_summary(2026, 8);
SELECT refresh_monthly_summary(2026, 9);
SELECT refresh_monthly_summary(2026, 10);
SELECT refresh_monthly_summary(2026, 11);
SELECT refresh_monthly_summary(2026, 12);

-- Refresh academic years that span 2026
SELECT refresh_academic_year_summary('2025-2026');
SELECT refresh_academic_year_summary('2026-2027');
```

### Solution 3: Use Admin Input Form (Prevention)
**Going forward, always add data through the Admin Input form:**
- Navigate to: `/admin/input`
- Fill in the form with year, month, factor, and activity data
- Click "Submit Monthly Audit"
- The system automatically refreshes the dashboard data

This is the recommended approach for regular data entry.

## 📋 Implementation Details

### Files Created/Modified:
1. **NEW:** `/src/pages/RefreshDashboard.tsx` - The refresh utility page
2. **MODIFIED:** `/src/App.tsx` - Added route for `/refresh-dashboard`

### Route Registration:
```tsx
<Route path="/refresh-dashboard" element={<AdminRoute><RefreshDashboard /></AdminRoute>} />
```

The `/refresh-dashboard` page is:
- ✅ Admin-only (requires admin authentication)
- ✅ User-friendly with clear instructions
- ✅ Handles both single-month and year-wide refreshes
- ✅ Shows success/error messages
- ✅ Includes troubleshooting checklist

## 🔧 Technical Details

The dashboard queries use these Supabase RPC (Remote Procedure Call) functions:
- `refresh_monthly_summary(year, month)` - Updates monthly calculations
- `refresh_academic_year_summary(academic_year)` - Updates academic year calculations
- `get_factor_breakdown(year, month)` - Retrieves factor breakdown data

These functions are defined in the database migrations:
- See `/supabase/migrations/024_institutional_monthly_audit.sql`

## ❓ FAQ

**Q: Do I need to refresh if I use the Admin Input form?**
A: No! The form automatically handles it via React Query cache invalidation.

**Q: Can data be in the dashboard but not show because it's filtered?**
A: Yes! Check:
- Selected Year/Month on the dashboard
- The data's year/month match your selection
- You're viewing the correct view (Monthly vs Academic Year)

**Q: Why isn't the dashboard showing data after I refreshed?**
A: Possible causes:
- The data year/month doesn't match your dashboard selection
- You need to refresh the page (Ctrl+R or Cmd+R)
- Your data might have calculation errors - check the `monthly_audit_data` table directly
- For academic year view, ensure both academic year refresh functions were called

**Q: Can I bulk refresh all data?**
A: For now, you need to call the refresh for each month/academic year individually. This is by design to track which data was recalculated.

## 🚀 Quick Checklist

After adding data directly to the database:
- [ ] Data is definitely in `monthly_audit_data` table
- [ ] Year and month values look correct
- [ ] Visit `/refresh-dashboard` (admin-only)
- [ ] Click "Refresh Current Month" or "Refresh Current Year"
- [ ] See "Success!" message
- [ ] Go to `/dashboard`
- [ ] Verify year/month selection matches your data
- [ ] Refresh the page (Ctrl+R)
- [ ] Data should now be visible!

## 📞 Still Having Issues?

1. Check that you're logged in as an admin
2. Verify the year and month in your data are correct
3. Try refreshing the page after using the refresh tool
4. Check browser console (F12) for any errors
5. Make sure the `/refresh-dashboard` route is accessible

---

**Summary:** Always use the `/refresh-dashboard` page or the Admin Input form. Never add data directly to the database and expect it to automatically appear!
