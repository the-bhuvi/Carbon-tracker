# DEPLOYMENT CHECKLIST - Institutional Carbon Tracking Refactor

**Date**: February 2026  
**Version**: 1.0  
**Status**: ✅ Ready for Deployment

---

## PRE-DEPLOYMENT VERIFICATION

### Code Review
- [x] Database migration reviewed (024_institutional_monthly_audit.sql)
- [x] All TypeScript types defined and imported correctly
- [x] All API modules implemented with proper error handling
- [x] All React hooks follow React Query best practices
- [x] Dashboard component completely rewritten (no dept references)
- [x] AdminInput form updated for monthly audits
- [x] No circular dependencies or import errors
- [x] No console warnings or errors in development build

### Testing
- [ ] Manual test: Dashboard loads without errors
- [ ] Manual test: AdminInput form displays correctly
- [ ] Manual test: Can submit monthly audit data
- [ ] Manual test: Dashboard shows submitted data
- [ ] Manual test: Monthly/Academic Year toggle works
- [ ] Manual test: Calculation formulas are correct
- [ ] Manual test: Per-capita calculations match expectations
- [ ] Manual test: Neutrality % calculates properly
- [ ] Manual test: Factor breakdown chart renders
- [ ] Manual test: Trend chart displays data

### Database
- [ ] Backup of current database created
- [ ] Migration file syntax verified
- [ ] All table names match in API/Types/Hooks
- [ ] RLS policies are correct
- [ ] Indexes created for performance
- [ ] Helper functions syntax verified

### Documentation
- [x] REFACTORING_SUMMARY.md created
- [x] INSTITUTIONAL_REFACTOR_TECHNICAL_GUIDE.md created
- [x] Database schema documented
- [x] API endpoints documented
- [x] Type definitions documented
- [x] Deployment instructions documented

---

## DEPLOYMENT PHASES

### PHASE 1: Database Setup (30 minutes)

#### Step 1.1: Backup
```bash
# Create backup of current database
# Date/time format: YYYYMMDD_HHMMSS
# Example: backup_20260218_120000.sql

pg_dump -h <host> -U <user> -d <database> > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup file size (should be > 1MB for real database)
ls -lh backup_*.sql
```
- [ ] Backup created
- [ ] Backup file verified (size > 0)
- [ ] Backup stored in secure location

#### Step 1.2: Apply Migration
```bash
# Connect to Supabase/PostgreSQL
# Option A: Via Supabase Dashboard SQL Editor
# Option B: Via psql command line
psql -h <host> -U <user> -d <database> -f supabase/migrations/024_institutional_monthly_audit.sql

# Verify migration applied
SELECT tablename FROM pg_tables 
WHERE tablename IN (
  'enrolled_students_config',
  'monthly_audit_data',
  'monthly_summary',
  'academic_year_summary',
  'carbon_offsets',
  'carbon_reductions'
) 
ORDER BY tablename;
```
- [ ] Migration applied without errors
- [ ] All 6 tables visible in database

#### Step 1.3: Verify RLS Policies
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename LIKE '%monthly_%' OR tablename LIKE '%academic_year_%' OR tablename LIKE '%carbon_%'
ORDER BY tablename;

-- Result should show: rowsecurity = true for all tables
```
- [ ] RLS enabled on all new tables

#### Step 1.4: Verify Helper Functions
```sql
-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND (routine_name LIKE '%refresh%' OR routine_name LIKE '%calculate%' OR routine_name = 'get_academic_year' OR routine_name = 'get_factor_breakdown')
ORDER BY routine_name;

-- Should return:
-- - calculate_academic_year_neutrality
-- - calculate_monthly_neutrality
-- - get_academic_year
-- - get_factor_breakdown
-- - refresh_academic_year_summary
-- - refresh_monthly_summary
```
- [ ] All 6 helper functions exist

#### Step 1.5: Seed Initial Data
```sql
-- Insert current academic year enrollment
INSERT INTO enrolled_students_config (academic_year, total_students, notes)
VALUES ('2024-2025', 5000, 'Initial institutional enrollment from refactor')
ON CONFLICT (academic_year) DO UPDATE
SET total_students = 5000;

-- Verify
SELECT * FROM enrolled_students_config ORDER BY academic_year DESC;
```
- [ ] Enrollment data seeded for 2024-2025
- [ ] Can insert/update without errors

---

### PHASE 2: Backend Code Deployment (20 minutes)

#### Step 2.1: Code Review
- [ ] All department-related code removed from active paths
- [ ] No department imports in critical files:
  - [ ] src/pages/Dashboard.tsx
  - [ ] src/pages/AdminInput.tsx
  - [ ] src/lib/supabase/api.ts (departmentsApi removed)
  - [ ] src/hooks/useSupabase.ts (department hooks removed)
- [ ] All new API modules properly exported from src/lib/supabase/index.ts

#### Step 2.2: Build & Test
```bash
# Install dependencies (if needed)
npm ci

# Type check
npm run typecheck
# Expected: No TypeScript errors

# Build
npm run build
# Expected: Build successful, no errors

# If test suite exists
npm run test
# Expected: All tests pass
```
- [ ] No TypeScript errors
- [ ] Build completes successfully
- [ ] All tests pass (if applicable)

#### Step 2.3: Deploy Backend
```bash
# Option A: Docker
docker build -t carbon-tracker:latest .
docker push <registry>/carbon-tracker:latest

# Option B: Direct deploy
npm run build
# Copy dist folder to production server
# Update environment variables if needed
```
- [ ] Code deployed to staging
- [ ] Code deployed to production
- [ ] Verify no errors in logs

---

### PHASE 3: Frontend Deployment (20 minutes)

#### Step 3.1: Deploy Frontend Assets
```bash
# Build was done in Phase 2
# Deploy dist folder to CDN/hosting

# For Vercel:
vercel --prod

# For other hosts:
# Copy contents of dist/ to production hosting
```
- [ ] Frontend deployed to production
- [ ] Assets cached/invalidated in CDN

#### Step 3.2: Verify Production Deployment
```
https://yourdomain.com/dashboard
```
- [ ] Dashboard page loads
- [ ] No JavaScript errors in console
- [ ] No 404 errors for assets

---

### PHASE 4: Functional Testing (30 minutes)

#### Test 4.1: Dashboard
```
Navigate to: /dashboard
```
- [ ] Dashboard loads without errors
- [ ] Monthly view is default
- [ ] Academic Year toggle visible
- [ ] 4 KPI cards display (Total Emission, Per Capita, Highest Factor, Neutrality)
- [ ] Factor breakdown chart displays
- [ ] Trend chart displays
- [ ] "No data" message appears (expected on first deploy)

#### Test 4.2: Admin Input Form
```
Navigate to: /admin/input
```
- [ ] Form displays all fields
- [ ] Year dropdown shows 2024-2025
- [ ] Month dropdown shows 1-12
- [ ] Factor dropdown shows all 12 options
- [ ] Emission factor auto-populates when factor changes
- [ ] Unit auto-populates when factor changes
- [ ] Can enter activity data
- [ ] CO2e auto-calculates
- [ ] Can submit form

#### Test 4.3: Data Submission
```
1. Fill Admin Input form with test data:
   - Year: 2024
   - Month: 7 (July)
   - Factor: Electricity
   - Activity Data: 1000
   - Unit: kWh (auto-filled)
   - Emission Factor: 0.73 (auto-filled)
   - Expected CO2e: 730 kg

2. Click Submit
```
- [ ] Success toast notification appears
- [ ] No errors in console
- [ ] Form resets after submission

#### Test 4.4: Dashboard Data Display
```
Navigate back to /dashboard
```
- [ ] Data appears in dashboard
- [ ] KPIs update with new data
- [ ] Charts display submitted emissions
- [ ] Factor breakdown shows "Electricity"
- [ ] Per-capita calculation is correct (730 / 5000 = 0.146 kg)

#### Test 4.5: View Mode Toggle
```
1. Start in Monthly view
2. Click "Academic Year" toggle
```
- [ ] View switches to academic year
- [ ] Charts update to show academic year data
- [ ] No data appears (expected - only 1 month of data)

```
3. Click "Monthly" toggle
```
- [ ] View switches back to monthly
- [ ] Data reappears

#### Test 4.6: Multiple Submissions
```
Submit additional data:
- 2024, July, Diesel, 100 liters (2.68 factor) = 268 kg
- 2024, July, Water, 1000 liters (0.35 factor) = 350 kg
```
- [ ] All submissions succeed
- [ ] Dashboard shows total of 3 factors
- [ ] Total emission = 730 + 268 + 350 = 1,348 kg ✓
- [ ] Per-capita = 1,348 / 5000 = 0.2696 kg ✓
- [ ] Factor breakdown shows all 3 factors
- [ ] Highest factor correctly identified (Electricity at 730 kg)

#### Test 4.7: Neutrality Calculation
```
Add carbon offset:
- Month: 7, Year: 2024
- Offset type: reforestation
- Quantity: 100 trees
- CO2e offset: 500 kg
```
- [ ] Offset recorded in database
- [ ] Neutrality % updates: (500 / 1348) × 100 = 37.09% ✓

---

### PHASE 5: Performance Testing (15 minutes)

#### Test 5.1: Dashboard Load Time
```
Measure time to dashboard fully loaded
- Target: < 2 seconds with real data
- Acceptable: < 3 seconds
```
- [ ] Dashboard loads within acceptable time

#### Test 5.2: Form Submission Time
```
Measure time from form submit to success
- Target: < 1 second
- Acceptable: < 2 seconds
```
- [ ] Form submits quickly

#### Test 5.3: Chart Rendering
```
Verify charts render smoothly
- Pie chart loads
- Line chart loads
- No significant lag when switching views
```
- [ ] Charts render smoothly
- [ ] No performance issues

---

### PHASE 6: Data Integrity Testing (20 minutes)

#### Test 6.1: Database Constraints
```sql
-- Test UNIQUE constraint on monthly_audit_data
-- (year, month, factor_name must be unique)

-- This should work:
INSERT INTO monthly_audit_data (year, month, factor_name, activity_data, emission_factor)
VALUES (2024, 7, 'Electricity', 1000, 0.73);

-- This should fail (duplicate):
INSERT INTO monthly_audit_data (year, month, factor_name, activity_data, emission_factor)
VALUES (2024, 7, 'Electricity', 2000, 0.73);
-- Expected error: duplicate key value violates unique constraint
```
- [ ] Unique constraint works as expected
- [ ] Duplicate prevention working

#### Test 6.2: Generated Columns
```sql
-- Verify calculated_co2e_kg is auto-calculated
SELECT year, month, factor_name, activity_data, emission_factor, calculated_co2e_kg
FROM monthly_audit_data
WHERE year = 2024 AND month = 7;

-- Verify: calculated_co2e_kg = activity_data × emission_factor
```
- [ ] Calculated columns work
- [ ] Math is correct

#### Test 6.3: Timestamps
```sql
-- Verify created_at and updated_at are set
SELECT year, month, factor_name, created_at, updated_at
FROM monthly_audit_data
WHERE year = 2024 AND month = 7;

-- created_at should be when inserted
-- updated_at should initially equal created_at
```
- [ ] Timestamps auto-set correctly

---

### PHASE 7: Rollback Plan (In Case of Issues)

#### If Database Issues Occur
```bash
# 1. Stop application
# 2. Restore from backup
psql -h <host> -U <user> -d <database> < backup_20260218_120000.sql

# 3. Verify old schema
SELECT tablename FROM pg_tables WHERE tablename LIKE '%submissions%';
```
- [ ] Rollback procedure tested
- [ ] Backup restoration verified

#### If Frontend Issues Occur
```bash
# 1. Deploy previous version
git checkout <previous-commit>
npm run build
# Deploy dist folder

# Or if using Docker:
docker run <previous-image>:tag
```
- [ ] Version control tags in place
- [ ] Previous version accessible

---

## POST-DEPLOYMENT CHECKLIST

### Day 1: Immediate Checks
- [ ] Dashboard loads for all users
- [ ] No error messages in application
- [ ] Data submissions working
- [ ] Data appearing in dashboard
- [ ] Charts displaying correctly
- [ ] Calculations verified manually
- [ ] Database queries performing well
- [ ] No unusual logs or errors

### Day 2: Monitoring
- [ ] Error logs reviewed (should be minimal)
- [ ] Performance metrics checked
- [ ] User feedback collected
- [ ] Database backups running
- [ ] Data integrity spot-checks passed

### Week 1: Validation
- [ ] Multiple users tested successfully
- [ ] Various data types submitted
- [ ] Academic year view verified
- [ ] Neutrality calculations spot-checked
- [ ] Report generation tested (if applicable)
- [ ] Export functionality tested (if applicable)

### Week 2: Full Handoff
- [ ] Documentation reviewed with team
- [ ] Support procedures established
- [ ] Monitoring dashboards configured
- [ ] Incident response plans in place
- [ ] User training completed (if needed)

---

## SIGN-OFF

### Development Team
- [ ] Code review completed
- [ ] Testing completed
- [ ] Documentation reviewed
- **Signed by**: ___________________ **Date**: __________

### QA Team
- [ ] All test cases passed
- [ ] No blocking issues
- [ ] Ready for production
- **Signed by**: ___________________ **Date**: __________

### DevOps/Infrastructure
- [ ] Infrastructure prepared
- [ ] Databases backed up
- [ ] Rollback plan tested
- [ ] Monitoring configured
- **Signed by**: ___________________ **Date**: __________

### Project Manager
- [ ] Stakeholder approval obtained
- [ ] Deployment window scheduled
- [ ] User communication plan ready
- [ ] Post-deployment support planned
- **Signed by**: ___________________ **Date**: __________

---

## ADDITIONAL NOTES

### Known Limitations
- Legacy `carbon_submissions` table is not automatically migrated to new schema
- Per-capita calculation requires enrolled_students_config entry for academic year
- Dashboard initially shows "no data" until first monthly audit entry

### Future Improvements
- Consider migrating historical data from `carbon_submissions`
- Add data export/reporting features
- Implement predictive trending
- Add multi-year comparisons
- Add benchmark comparisons

### Support Contacts
- **Technical Issues**: development-team@institution.edu
- **Data Entry Support**: data-team@institution.edu
- **Dashboard Questions**: analytics-team@institution.edu

---

**Deployment Checklist Version**: 1.0  
**Last Updated**: February 2026  
**Status**: ✅ Ready for Production
