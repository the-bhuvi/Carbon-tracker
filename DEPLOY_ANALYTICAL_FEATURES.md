# Quick Deployment Guide - Analytical Features

## TL;DR - 3 Steps

### Step 1: Deploy Database Migration
```bash
# Run the migration file
supabase db push
# OR manually run the SQL file in Supabase dashboard
# File: supabase/migrations/027_analytical_features.sql
```

### Step 2: Build & Deploy Frontend
```bash
npm run build
# Deploy dist/ folder to your hosting
```

### Step 3: Update Routes (Optional)
If replacing the old Dashboard:
- Update `src/App.tsx` to use `EnhancedDashboard` instead of `Dashboard`
- Or create a new route: `/dashboard-analytics`

---

## Database Migration Details

### What Gets Created

✅ `data_confidence` column on `monthly_audit_data`  
✅ `scope` column on `monthly_audit_data`  
✅ `factor_scope_mapping` table  
✅ `emission_simulations` table  
✅ 7 RPC functions:
   - `get_top_contributor(year, month)`
   - `get_factor_percentages(year, month)`
   - `get_emission_intensity(year, month)`
   - `simulate_emission_reduction(year, month, json)`
   - `get_scope_breakdown(year, month)`
   - `calculate_net_zero_year(year, reduction_pct)`
   - (Plus helpers)

✅ Indexes for performance  
✅ RLS policies for security  

### Rollback (if needed)
Run the cleanup script included in the migration file.

---

## Feature Availability After Deploy

| Feature | Available | Notes |
|---------|-----------|-------|
| Data Confidence | ✅ Yes | Shows 🟢🟡🔴 indicators |
| Top Contributor | ✅ Yes | Auto-calculated |
| Intensity Metrics | ✅ Yes | CO₂ per student, etc. |
| Reduction Simulator | ✅ Yes | Interactive tool |
| Academic Year Mode | ✅ Yes | July-June view |
| Scope Breakdown | ✅ Yes | Scope 1/2/3 chart |
| Net Zero Projection | ✅ Yes | Timeline to neutrality |

---

## Post-Deployment Checklist

- [ ] Migration runs successfully
- [ ] No database errors in logs
- [ ] Frontend builds without errors
- [ ] Dashboard loads
- [ ] Charts render
- [ ] Simulator works
- [ ] No console errors
- [ ] Performance acceptable

---

## Testing Queries

Run these in Supabase SQL editor to verify:

```sql
-- Test top contributor
SELECT * FROM get_top_contributor(2026, 1);

-- Test intensity
SELECT * FROM get_emission_intensity(2026, 1);

-- Test scope breakdown
SELECT * FROM get_scope_breakdown(2026, 1);

-- Test factor percentages
SELECT * FROM get_factor_percentages(2026, 1);

-- Test simulator
SELECT * FROM simulate_emission_reduction(2026, 1, '{"Electricity": 20}');

-- Test net zero
SELECT * FROM calculate_net_zero_year(2026, 5);
```

---

## Troubleshooting

**Migration fails?**
- Check if columns already exist
- Verify PostgreSQL version supports `DO` blocks
- Check for syntax errors (migration is idempotent)

**Charts not showing?**
- Verify monthly_audit_data has entries
- Check browser console for errors
- Ensure enrolled_students_config populated

**Simulator not working?**
- Verify factors have non-zero values
- Check month/year selection
- Browser console for API errors

**Need to rollback?**
- Uncomment rollback section in migration
- Or use Supabase backups
- Frontend changes can be reverted independently

---

## Support Resources

📄 **Full Documentation**: `ANALYTICAL_FEATURES_GUIDE.md`  
📋 **Implementation Details**: `IMPLEMENTATION_ANALYTICAL_FEATURES.md`  
💻 **Source Code**:
- Database: `supabase/migrations/027_analytical_features.sql`
- Types: `src/types/database.ts`
- APIs: `src/lib/supabase/api.ts`
- Hooks: `src/hooks/useSupabase.ts`
- Components: `src/components/*.tsx`
- Dashboard: `src/pages/EnhancedDashboard.tsx`

---

## Success Indicators

✅ Migration completes without errors  
✅ RPC functions callable from SQL editor  
✅ EnhancedDashboard loads  
✅ Metrics display correctly  
✅ Simulator responds to input  
✅ No TypeScript errors  
✅ Charts render properly  
✅ All features functional  

---

**Version**: 1.0  
**Last Updated**: 2026-02-18  
**Status**: Ready for Deployment
