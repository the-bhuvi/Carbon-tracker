# 🚀 Carbon Tracker - Supabase Backend Quick Reference

## 📁 Files Created

### Database (supabase/migrations/)
- `001_initial_schema.sql` - Tables, indexes, triggers
- `002_calculation_functions.sql` - Carbon calculations & analytics  
- `003_row_level_security.sql` - Security policies
- `004_seed_data.sql` - Test data

### TypeScript (src/)
- `types/database.ts` - All type definitions
- `lib/supabase/client.ts` - Supabase client
- `lib/supabase/auth.ts` - Auth helpers
- `lib/supabase/api.ts` - CRUD operations
- `lib/supabase/utils.ts` - Helper functions
- `lib/supabase/index.ts` - Exports
- `hooks/useSupabase.ts` - React Query hooks

### Documentation
- `BACKEND_GUIDE.md` - Complete guide
- `IMPLEMENTATION_SUMMARY.md` - This summary
- `supabase/README.md` - Setup instructions
- `.env.example` - Environment template

---

## ⚡ Quick Commands

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

---

## 🔑 Environment Variables

Add to `.env`:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get from: Supabase Dashboard → Settings → API

---

## 📊 Common Imports

```typescript
// React Query Hooks
import {
  useCarbonSubmissions,
  useCreateCarbonSubmission,
  useDepartmentSummary,
  useMonthlyTrends,
  useCurrentUser
} from '@/hooks/useSupabase';

// Direct API
import {
  carbonSubmissionsApi,
  departmentsApi,
  analyticsApi,
  auth
} from '@/lib/supabase';

// Types
import type {
  CarbonSubmission,
  Department,
  User
} from '@/types/database';

// Utils
import {
  formatCarbon,
  getCarbonScoreColor,
  formatTreeMessage
} from '@/lib/supabase/utils';
```

---

## 💻 Code Snippets

### Fetch Submissions
```typescript
const { data, isLoading } = useCarbonSubmissions(userId);
```

### Create Submission
```typescript
const { mutate } = useCreateCarbonSubmission();

mutate({
  user_id: userId,
  department_id: deptId,
  electricity_kwh: 450,
  travel_km: 80
});
```

### Get Analytics
```typescript
const { data: summary } = useDepartmentSummary();
const { data: trends } = useMonthlyTrends();
```

### Authentication
```typescript
await auth.signIn(email, password);
const user = await auth.getUser();
await auth.signOut();
```

---

## 🎯 Database Schema Quick Ref

### Tables
- **departments** (id, name, building_area, student_count)
- **users** (id, name, email, role, department_id)
- **carbon_submissions** (all emission data + calculated fields)
- **emission_factors** (conversion factors)

### Automatic Calculations
On every submission INSERT/UPDATE:
- ✅ `total_carbon` - Sum of all emissions
- ✅ `carbon_score` - Green/Moderate/High
- ✅ `tree_equivalent` - Trees needed
- ✅ `suggestions[]` - Smart tips

### Analytics Functions
- `get_department_summary()` - Dept totals & trends
- `get_monthly_trends(dept_id?)` - 12-month trends
- `get_per_capita_emissions()` - Per-student emissions

---

## 🔒 Security (RLS Enabled)

### Students Can:
- ✅ View/create/update own submissions
- ✅ View all departments
- ✅ View own profile

### Admins Can:
- ✅ View ALL submissions
- ✅ Manage departments
- ✅ Manage users
- ✅ Update emission factors

---

## 🧪 Test Data Included

After running migrations:
- 5 departments (CS, EE, ME, CE, Business)
- 13 users (3 admins, 10 students)
- 15 submissions (last 90 days)

Test emails:
- `admin@university.edu` (admin)
- `john.doe@student.edu` (student)

---

## 🛠 Troubleshooting

**"Missing environment variables"**
- Create `.env` file
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server

**"relation does not exist"**
- Run all 4 migration files in Supabase SQL Editor
- Check for errors in SQL output

**Auth not working**
- Enable Email provider in Supabase Dashboard
- Authentication → Settings → Enable Email

---

## 📖 Learn More

- Full Guide: `BACKEND_GUIDE.md`
- Setup Steps: `supabase/README.md`
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)

---

## ✅ Checklist

- [ ] Run `npm install`
- [ ] Create Supabase project
- [ ] Copy `.env.example` to `.env`
- [ ] Add Supabase credentials to `.env`
- [ ] Run 4 migration files in SQL Editor
- [ ] Enable Email auth in dashboard
- [ ] Restart dev server
- [ ] Start building! 🎉

---

**Everything is ready! Just set up Supabase and you're good to go!**
