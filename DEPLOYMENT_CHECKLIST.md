# Carbon Neutrality System - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Review
- [x] All 6 migration files created
- [x] All 7 React components created
- [x] All 4 custom hooks created  
- [x] Types updated in database.ts
- [x] App.tsx routing updated
- [x] Navigation.tsx updated with new link
- [x] Documentation created (3 guides)

### 2. Database Preparation
- [ ] Backup current database
- [ ] Review migration files
- [ ] Test migrations on development/staging first
- [ ] Verify Supabase project has sufficient resources

### 3. Environment Check
- [ ] Node.js 18+ installed
- [ ] npm packages up to date (`npm install`)
- [ ] Supabase CLI installed (optional but recommended)
- [ ] Environment variables set correctly

---

## 🚀 Deployment Steps

### Step 1: Apply Database Migrations

#### Option A: Using Supabase CLI (Recommended)
```bash
# Ensure you're in project root
cd E:\Projects\Carbon-tracker

# Link to Supabase project (if not linked)
supabase link --project-ref YOUR_PROJECT_REF

# Apply all migrations
supabase db push

# Verify
supabase db diff
```

#### Option B: Using Supabase Dashboard
1. Go to https://app.supabase.com/project/YOUR_PROJECT/sql
2. Copy and paste each migration file content (in order 016-021)
3. Execute each migration
4. Verify no errors

**Migration Order:**
1. ✅ `016_add_scope_columns.sql`
2. ✅ `017_update_carbon_calculation_trigger.sql`
3. ✅ `018_campus_carbon_summary.sql`
4. ✅ `019_carbon_simulations.sql`
5. ✅ `020_recommendation_engine.sql`
6. ✅ `021_department_budgets.sql`

### Step 2: Backfill Existing Data

Execute these SQL statements in Supabase SQL Editor:

```sql
-- 1. Update existing submissions to calculate scope values
UPDATE carbon_submissions SET updated_at = updated_at;

-- 2. Generate campus summary for current year (adjust tree count)
SELECT * FROM refresh_campus_carbon_summary(2024, 1000);

-- 3. Verify scope calculations
SELECT 
  id,
  total_carbon_kg,
  scope1_emissions_kg,
  scope2_emissions_kg,
  scope3_emissions_kg
FROM carbon_submissions
LIMIT 5;

-- 4. Verify department budgets calculated
SELECT name, student_count, carbon_budget
FROM departments
WHERE student_count IS NOT NULL;
```

### Step 3: Build Frontend

```bash
# Install any missing dependencies
npm install

# Build for production
npm run build

# Test build locally
npm run preview
```

### Step 4: Test Locally

```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173
```

**Test these features:**
- [ ] Navigate to `/carbon-neutrality`
- [ ] Dashboard loads without errors
- [ ] KPI cards display data
- [ ] Charts render correctly
- [ ] Year selector changes data
- [ ] Simulator tab works
- [ ] Sliders update values in real-time
- [ ] Recommendations tab shows suggestions
- [ ] No console errors
- [ ] Navigation menu shows new link

### Step 5: Deploy to Production

#### Vercel (Recommended)
```bash
# If not already connected
vercel

# Deploy to production
vercel --prod
```

#### Manual Build
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

### Step 6: Post-Deployment Verification

**Database Checks:**
```sql
-- Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('campus_carbon_summary', 'carbon_simulations');

-- Verify all functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_campus_carbon_summary',
  'simulate_carbon_reduction',
  'generate_recommendations',
  'check_department_budget'
);

-- Test campus summary
SELECT * FROM get_campus_carbon_summary(2024);

-- Test recommendations
SELECT * FROM generate_recommendations(2024);
```

**Frontend Checks:**
- [ ] Visit production URL
- [ ] Log in with test user
- [ ] Navigate to Carbon Neutrality page
- [ ] Verify all features work
- [ ] Test on mobile device
- [ ] Check browser console for errors

---

## 🐛 Troubleshooting

### Issue: Migration fails
**Solution:**
- Check PostgreSQL version (need 14+)
- Ensure no conflicting column/table names
- Review error message carefully
- Apply migrations one at a time

### Issue: Scope values NULL
**Solution:**
```sql
UPDATE carbon_submissions SET updated_at = updated_at;
```

### Issue: Dashboard shows no data
**Solution:**
```sql
SELECT * FROM refresh_campus_carbon_summary(2024, 1000);
```

### Issue: Permission denied
**Solution:**
```sql
GRANT EXECUTE ON FUNCTION get_campus_carbon_summary(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION simulate_carbon_reduction(INTEGER, INTEGER, DECIMAL, DECIMAL, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_recommendations(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_department_budget(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_department_budgets(INTEGER) TO authenticated;
```

### Issue: Charts not rendering
- Verify recharts is installed: `npm list recharts`
- Check data format matches expected types
- Review browser console for errors

### Issue: Build fails
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Post-Deployment Tasks

### 1. Initialize Data

```sql
-- Set realistic tree count for your campus
SELECT * FROM refresh_campus_carbon_summary(2024, 5000);

-- Update department student counts if needed
UPDATE departments SET student_count = 250 WHERE name = 'Computer Science';

-- Verify budgets calculated
SELECT name, student_count, carbon_budget FROM departments;
```

### 2. User Training

- Share `CARBON_NEUTRALITY_GUIDE.md` with users
- Demonstrate key features:
  - KPI cards and metrics
  - Simulator for planning
  - Recommendations for action
  - Department budgets

### 3. Set Goals

- Review current neutrality percentage
- Set target neutrality % for next year
- Identify high-priority recommendations
- Assign department targets

### 4. Monitor & Iterate

- Check dashboard weekly for new data
- Review recommendations monthly
- Track progress toward neutrality goal
- Adjust tree count as campus changes

---

## 📈 Success Metrics

### Technical Success
- ✅ Zero migration errors
- ✅ All RPC functions working
- ✅ Frontend loads in <3 seconds
- ✅ No console errors
- ✅ Mobile responsive

### Business Success
- Track carbon neutrality % over time
- Monitor recommendation adoption rate
- Measure emission reductions achieved
- Count departments meeting budget targets
- User engagement with simulator

---

## 🎉 Launch Announcement

After successful deployment, announce to campus:

**Sample Message:**

> 🌱 **New Feature: Carbon Neutrality Dashboard**
> 
> We're excited to announce our new Carbon Neutrality Dashboard! Track our campus progress toward carbon neutrality with:
> 
> ✅ Real-time emission tracking by scope (1, 2, 3)
> ✅ Interactive reduction simulator
> ✅ Smart recommendations for reducing emissions
> ✅ Department carbon budgets
> 
> Visit: [your-app-url]/carbon-neutrality
> 
> Goal: Achieve 100% carbon neutrality through emission reduction and tree planting.
> 
> Current Status: [X]% carbon neutral

---

## 📞 Support Resources

- **User Guide:** CARBON_NEUTRALITY_GUIDE.md
- **Technical Guide:** IMPLEMENTATION_COMPLETE.md
- **Migration Help:** MIGRATION_APPLY_GUIDE.md
- **Supabase Docs:** https://supabase.com/docs
- **React Query Docs:** https://tanstack.com/query/latest

---

## 🔄 Rollback Plan

If critical issues arise:

1. **Frontend:** Revert to previous commit
   ```bash
   git revert HEAD
   vercel --prod
   ```

2. **Database:** Run rollback SQL (see MIGRATION_APPLY_GUIDE.md)

3. **Hotfix:** Fix issue, test locally, redeploy

---

## ✅ Final Checklist

- [ ] All migrations applied successfully
- [ ] Existing data still intact and accessible
- [ ] Scope values calculated for all submissions
- [ ] Campus summary generated for current year
- [ ] Department budgets calculated
- [ ] Frontend builds without errors
- [ ] Dashboard accessible at `/carbon-neutrality`
- [ ] All charts and components render
- [ ] Simulator returns accurate projections
- [ ] Recommendations appear correctly
- [ ] No console errors in production
- [ ] Mobile layout works properly
- [ ] Navigation menu updated
- [ ] Documentation accessible to team
- [ ] Users trained on new features
- [ ] Success metrics defined and tracked

---

## 🎊 Deployment Complete!

Your Carbon Neutrality System is now live! 

**Next Steps:**
1. Monitor initial user feedback
2. Track first week's usage metrics
3. Review recommendations with stakeholders
4. Plan first emission reduction initiatives
5. Set quarterly neutrality milestones

**Remember:** This is a living system. Regular updates and engagement will maximize its impact on your campus sustainability goals.

---

**Deployment Date:** ________________

**Deployed By:** ________________

**Production URL:** ________________

**Supabase Project:** ________________

---

END OF DEPLOYMENT CHECKLIST
