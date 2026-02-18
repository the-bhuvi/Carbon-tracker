# Quick Start: Dashboard Data Not Showing

## 🚨 You Added Data But It Doesn't Show?

### Fastest Fix (30 seconds)
1. Go to: `http://localhost:5173/refresh-dashboard`
2. Click: **"Refresh Current Month"**
3. Wait for success message ✓
4. Go back to Dashboard
5. Your data is now visible!

---

## Why This Happens

```
You add data directly to database
         ↓
         ✗ Dashboard doesn't see it yet
         ↓
       Why? Dashboard reads from "summary" tables,
       not the raw data tables
         ↓
Solution: Run refresh function to recalculate summaries
         ↓
         ✓ Dashboard now shows your data
```

---

## Three Ways to Fix

### Method 1️⃣ - Use Refresh Dashboard Page (⭐ Recommended)
- **URL:** `/refresh-dashboard`
- **Steps:** 2 clicks, 5 seconds
- **Best for:** Regular data entry
- **Access:** Admin only

### Method 2️⃣ - SQL Commands
- **Where:** Supabase SQL Editor or pgAdmin
- **File:** `REFRESH_DASHBOARD_SQL.sql` (has ready-to-run commands)
- **Best for:** Bulk data operations
- **Access:** Database admin only

### Method 3️⃣ - Use Admin Input Form (Going Forward)
- **URL:** `/admin/input`
- **Benefit:** Automatic refresh, no extra steps needed
- **Recommended:** Always use this for regular data entry

---

## Checklist

✓ Data is in the database (verified in `monthly_audit_data` table)
✓ Year and month are correct
✓ Used `/refresh-dashboard` page OR ran SQL refresh
✓ Went back to Dashboard page
✓ Refreshed browser (Ctrl+R)
→ **Data should now be visible!**

---

## Common Issues

❌ **Dashboard still empty?**
- Check: Is the year/month on Dashboard matching your data?
- Check: Did you refresh the browser page?
- Check: Is your data actually in `monthly_audit_data` table?

❌ **Page not found `/refresh-dashboard`?**
- Make sure you're logged in as admin
- Make sure the app rebuilt (check browser console for errors)

❌ **Permission denied?**
- Make sure you're logged in as admin, not student/faculty

---

## Files Created

| File | Purpose |
|------|---------|
| `RefreshDashboard.tsx` | User-friendly refresh page |
| `DASHBOARD_DATA_FIX_COMPLETE.md` | Full technical documentation |
| `REFRESH_DASHBOARD_SQL.sql` | SQL commands for manual refresh |
| `App.tsx` | Updated with new route |

---

## Next Time

✅ **Use the Admin Input form** to add data → automatic refresh
❌ **Don't add directly to database** unless you plan to refresh after

---

**Still stuck?** Check `DASHBOARD_DATA_FIX_COMPLETE.md` for detailed troubleshooting.
