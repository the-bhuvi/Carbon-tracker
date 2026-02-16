# 🌍 Carbon Tracker - Complete Supabase Backend

> **Status:** ✅ COMPLETE & READY TO USE

A comprehensive, production-ready Supabase backend for tracking and analyzing carbon emissions across departments with automatic calculations, smart suggestions, and role-based security.

---

## 📑 Table of Contents

1. [Quick Start](#quick-start)
2. [What's Included](#whats-included)
3. [Documentation](#documentation)
4. [File Structure](#file-structure)
5. [Key Features](#key-features)
6. [Setup Guide](#setup-guide)
7. [Usage Examples](#usage-examples)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Add your Supabase credentials to .env
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. Run migrations in Supabase Dashboard (SQL Editor)
# - 001_initial_schema.sql
# - 002_calculation_functions.sql
# - 003_row_level_security.sql
# - 004_seed_data.sql

# 5. Start coding!
npm run dev
```

**📖 Detailed Instructions:** See [QUICK_START.md](QUICK_START.md)

---

## 📦 What's Included

### ✅ Database Schema (PostgreSQL via Supabase)
- **4 Tables:** departments, users, carbon_submissions, emission_factors
- **Auto-calculations:** Carbon totals, scores, tree equivalents, suggestions
- **Analytics Functions:** Department summaries, monthly trends, per-capita emissions
- **Security:** Row-Level Security (RLS) for role-based access

### ✅ TypeScript Integration
- Complete type definitions for all tables and API responses
- Type-safe API functions and React hooks
- IntelliSense support in your IDE

### ✅ React Query Hooks
- `useCarbonSubmissions` - Fetch user submissions
- `useCreateCarbonSubmission` - Create new submission
- `useDepartmentSummary` - Get analytics
- `useMonthlyTrends` - Get trend data
- And 15+ more hooks ready to use!

### ✅ Authentication
- Email/password authentication
- Role-based access (student/admin)
- Session management
- Password reset functionality

### ✅ Utilities & Helpers
- Format carbon amounts
- Calculate percentages
- Validate submission data
- Group and aggregate data

### ✅ Sample Data
- 5 departments (CS, EE, ME, CE, Business)
- 13 users (3 admins + 10 students)
- 15 sample submissions

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[QUICK_START.md](QUICK_START.md)** | Get started in 5 minutes |
| **[BACKEND_GUIDE.md](BACKEND_GUIDE.md)** | Complete implementation guide |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System architecture & data flow |
| **[supabase/README.md](supabase/README.md)** | Supabase setup instructions |
| **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** | What was built |

---

## 📁 File Structure

```
Carbon-tracker/
├── 📄 Documentation
│   ├── README.md (this file)
│   ├── QUICK_START.md
│   ├── BACKEND_GUIDE.md
│   ├── ARCHITECTURE.md
│   └── IMPLEMENTATION_SUMMARY.md
│
├── 🗄️ Database (supabase/)
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_calculation_functions.sql
│   │   ├── 003_row_level_security.sql
│   │   └── 004_seed_data.sql
│   └── README.md
│
├── 💻 Source Code (src/)
│   ├── types/
│   │   └── database.ts           # TypeScript types
│   ├── lib/supabase/
│   │   ├── client.ts              # Supabase client
│   │   ├── auth.ts                # Authentication
│   │   ├── api.ts                 # CRUD operations
│   │   ├── utils.ts               # Helper functions
│   │   └── index.ts               # Exports
│   └── hooks/
│       └── useSupabase.ts         # React Query hooks
│
├── ⚙️ Configuration
│   ├── .env.example               # Environment template
│   ├── .env                       # Your credentials (create this)
│   ├── .gitignore                 # Updated
│   └── package.json               # Updated with dependencies
│
└── 📱 Pages (integrate with these!)
    ├── Dashboard.tsx              # → Use useDepartmentSummary()
    ├── StudentSurvey.tsx          # → Use useCreateCarbonSubmission()
    ├── History.tsx                # → Use useCarbonSubmissions()
    └── AdminInput.tsx             # → Use useDepartments()
```

---

## ⭐ Key Features

### 🤖 Automatic Carbon Calculations
Every submission automatically calculates:
- **Total Carbon Emissions** - Weighted sum of all inputs
- **Carbon Score** - Green (<100kg), Moderate (100-500kg), High (>500kg)
- **Tree Equivalent** - Trees needed to offset annually (total ÷ 21kg)
- **Smart Suggestions** - Context-aware tips based on consumption

### 📊 Advanced Analytics
Built-in PostgreSQL functions:
- **Department Summary** - Total/avg emissions, trends per department
- **Monthly Trends** - 12-month historical data
- **Per Capita Emissions** - Emissions per student by department

### 🔒 Enterprise-Grade Security
- **Row-Level Security (RLS)** - Students see only their data
- **Role-Based Access** - Admin vs student permissions
- **JWT Authentication** - Secure session management
- **SQL Injection Protection** - Parameterized queries

### 🎯 Developer Experience
- **Type Safety** - Full TypeScript support
- **Auto-complete** - IntelliSense in VS Code
- **React Query** - Automatic caching, refetching, optimistic updates
- **Error Handling** - Comprehensive error messages

---

## 🔧 Setup Guide

### Prerequisites
- Node.js & npm installed
- Supabase account (free tier works!)
- 10 minutes of your time

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Name: "Carbon Tracker"
3. Database Password: (choose strong password)
4. Region: (closest to you)
5. Wait ~2 minutes for creation

### Step 2: Get Credentials
1. Dashboard → Settings → API
2. Copy:
   - **Project URL** (starts with https://)
   - **anon public key** (long string)

### Step 3: Configure Environment
```bash
cp .env.example .env
# Edit .env and paste your credentials
```

### Step 4: Run Migrations
1. Supabase Dashboard → SQL Editor
2. Create new query
3. Paste and run each file in order:
   - `supabase/migrations/001_initial_schema.sql` ✓
   - `supabase/migrations/002_calculation_functions.sql` ✓
   - `supabase/migrations/003_row_level_security.sql` ✓
   - `supabase/migrations/004_seed_data.sql` ✓

### Step 5: Enable Authentication
Dashboard → Authentication → Settings → Enable Email

### Step 6: Verify
Check "Table Editor" - you should see:
- ✅ departments (5 rows)
- ✅ users (13 rows)
- ✅ carbon_submissions (15 rows)
- ✅ emission_factors (1 row)

🎉 **You're ready!**

---

## 💡 Usage Examples

### Create a Carbon Submission
```typescript
import { useCreateCarbonSubmission } from '@/hooks/useSupabase';

function SubmitForm() {
  const { mutate: submitData } = useCreateCarbonSubmission();
  
  const handleSubmit = () => {
    submitData({
      user_id: currentUser.id,
      department_id: currentUser.department_id,
      electricity_kwh: 450,
      diesel_liters: 20,
      travel_km: 80,
      water_liters: 8000,
      paper_kg: 12
    });
  };
}
```

### Display Analytics
```typescript
import { useDepartmentSummary, useMonthlyTrends } from '@/hooks/useSupabase';

function Dashboard() {
  const { data: summary } = useDepartmentSummary();
  const { data: trends } = useMonthlyTrends();
  
  return (
    <div>
      {summary?.map(dept => (
        <div key={dept.department_id}>
          <h3>{dept.department_name}</h3>
          <p>Total: {dept.total_carbon} kg CO₂</p>
          <p>Trend: {dept.carbon_trend}</p>
        </div>
      ))}
    </div>
  );
}
```

### Authentication
```typescript
import { auth } from '@/lib/supabase';

// Sign in
await auth.signIn(email, password);

// Get current user
const user = await auth.getUser();

// Sign out
await auth.signOut();
```

**More Examples:** See [BACKEND_GUIDE.md](BACKEND_GUIDE.md#usage-examples)

---

## 📖 API Reference

### React Query Hooks

#### Data Fetching
- `useCarbonSubmissions(userId)` - Get user's submissions
- `useDepartments()` - Get all departments
- `useCurrentUser()` - Get logged-in user
- `useDepartmentSummary()` - Get analytics summary
- `useMonthlyTrends(deptId?)` - Get 12-month trends
- `usePerCapitaEmissions()` - Get per-student emissions
- `useEmissionFactors()` - Get current conversion factors

#### Mutations
- `useCreateCarbonSubmission()` - Create submission
- `useUpdateCarbonSubmission()` - Update submission
- `useDeleteCarbonSubmission()` - Delete submission
- `useCreateDepartment()` - Create department (admin)
- `useUpdateDepartment()` - Update department (admin)
- `useUpdateEmissionFactors()` - Update factors (admin)

### Direct API
```typescript
import { 
  carbonSubmissionsApi,
  departmentsApi,
  usersApi,
  analyticsApi,
  emissionFactorsApi
} from '@/lib/supabase';

// All CRUD operations available
await carbonSubmissionsApi.create(data);
await carbonSubmissionsApi.getByUserId(userId);
await analyticsApi.getDepartmentSummary();
```

**Full API Docs:** See [BACKEND_GUIDE.md](BACKEND_GUIDE.md#api-usage-examples)

---

## 🐛 Troubleshooting

### Common Issues

**❌ "Missing Supabase environment variables"**
- Ensure `.env` file exists in project root
- Variables must start with `VITE_`
- Restart dev server after adding variables

**❌ "relation does not exist"**
- Run all 4 migration files in SQL Editor
- Check for errors in migration output
- Verify tables exist in Table Editor

**❌ Authentication not working**
- Enable Email provider in Supabase Dashboard
- Check RLS policies are applied
- Verify user exists in `auth.users` table

**❌ CORS errors**
- Add your domain to Supabase allowed origins
- Settings → API → CORS allowed origins

**Need more help?** Check [supabase/README.md](supabase/README.md#troubleshooting)

---

## 🎯 Next Steps

### 1. Integrate with Pages
- **Dashboard.tsx** → Add `useDepartmentSummary()` and charts
- **StudentSurvey.tsx** → Connect form with `useCreateCarbonSubmission()`
- **History.tsx** → Display data with `useCarbonSubmissions()`
- **AdminInput.tsx** → Add department management

### 2. Add Authentication UI
- Create login/signup pages
- Use `auth` helpers from `@/lib/supabase`
- Protect routes based on user role

### 3. Enhance Visualizations
- Use Recharts with analytics data
- Show trends and comparisons
- Add export functionality

### 4. Deploy
- Push to GitHub
- Deploy frontend (Vercel/Netlify)
- Your Supabase backend is already live!

---

## 🌟 Features Checklist

✅ Complete database schema with 4 tables  
✅ Automatic carbon calculations via triggers  
✅ Smart suggestions based on consumption  
✅ Row-Level Security for data protection  
✅ Analytics functions (summaries, trends)  
✅ TypeScript types for type safety  
✅ React Query hooks for easy data fetching  
✅ Authentication helpers  
✅ Utility functions for formatting  
✅ Seed data for testing  
✅ Comprehensive documentation  

---

## 📈 What Gets Calculated Automatically

When you create a submission, the database automatically:

1. **Calculates Total Carbon**
   ```
   total = (electricity × 0.82) + (diesel × 2.68) + 
           (petrol × 2.31) + (travel × 0.12) + ...
   ```

2. **Assigns Carbon Score**
   - Green: < 100 kg CO₂
   - Moderate: 100-500 kg CO₂
   - High: > 500 kg CO₂

3. **Calculates Tree Equivalent**
   ```
   trees = total_carbon / 21 kg per tree per year
   ```

4. **Generates Smart Suggestions**
   - High electricity → "Switch to LED bulbs"
   - High travel → "Use public transport"
   - High water → "Install water-saving fixtures"
   - And more contextual tips!

**No manual calculations needed!** 🎉

---

## 🤝 Support & Resources

- **Documentation:** Check the docs folder
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **React Query:** [tanstack.com/query](https://tanstack.com/query)
- **TypeScript:** [typescriptlang.org](https://typescriptlang.org)

---

## 📄 License

This backend implementation is part of the Carbon Tracker project.

---

**Built with:** 
- 🟢 Supabase (PostgreSQL + Auth + Storage)
- ⚛️ React Query (Data fetching & caching)
- 📘 TypeScript (Type safety)
- 🎨 Tailwind CSS (already in your project)

**Ready to track some carbon!** 🌱

---

*Last Updated: 2026-02-15*
