# Carbon Tracker Backend - Supabase Setup Guide

## 📋 Overview
This project uses Supabase as the backend, providing PostgreSQL database, authentication, and real-time capabilities.

## 🚀 Quick Start

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Carbon Tracker
   - **Database Password**: (choose a strong password)
   - **Region**: (select closest to you)
4. Wait for the project to be created (~2 minutes)

### 2. Get Your Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

### 3. Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Run Database Migrations
In the Supabase dashboard:
1. Go to **SQL Editor**
2. Create a new query
3. Run the migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_calculation_functions.sql`
   - `supabase/migrations/003_row_level_security.sql`
   - `supabase/migrations/004_seed_data.sql`

### 5. Install Dependencies
```bash
npm install @supabase/supabase-js
```

## 📊 Database Schema

### Tables
- **departments** - Department information (CS, EE, etc.)
- **users** - User profiles (students and admins)
- **carbon_submissions** - Carbon emission data entries
- **emission_factors** - Conversion factors for calculations

### Key Features
- ✅ Automatic carbon calculations via triggers
- ✅ Row-level security (RLS) for data protection
- ✅ Department analytics functions
- ✅ Monthly trend analysis
- ✅ Per-capita emissions tracking

## 🔐 Authentication Setup

### Enable Email Auth
1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Under "Auth Providers", ensure **Email** is enabled
3. Configure email templates if needed

### User Roles
- **student** - Can view/create their own submissions
- **admin** - Can view all data and manage departments

## 📱 Usage in Your App

### Import and Use
```typescript
import { 
  supabase, 
  auth,
  carbonSubmissionsApi,
  departmentsApi,
  usersApi,
  analyticsApi 
} from '@/lib/supabase';

// Using React hooks
import { 
  useCarbonSubmissions,
  useCreateCarbonSubmission,
  useDepartmentSummary 
} from '@/hooks/useSupabase';
```

### Example: Create a Submission
```typescript
const { mutate: createSubmission } = useCreateCarbonSubmission();

createSubmission({
  user_id: 'user-uuid',
  department_id: 'dept-uuid',
  electricity_kwh: 450,
  diesel_liters: 20,
  travel_km: 80,
  // ... other fields
});
```

### Example: Get Analytics
```typescript
const { data: summary } = useDepartmentSummary();
const { data: trends } = useMonthlyTrends();
```

## 🧪 Test Data
The `004_seed_data.sql` migration includes:
- 5 departments
- 13 users (3 admins + 10 students)
- 15 sample carbon submissions
- Default emission factors

## 🔧 Advanced Features

### Custom Functions
- `get_department_summary()` - Department-wise carbon summary
- `get_monthly_trends(dept_id?)` - Monthly emission trends
- `get_per_capita_emissions()` - Per-student emissions
- `calculate_carbon_metrics()` - Auto-triggered carbon calculations

### Real-time Subscriptions
```typescript
const subscription = supabase
  .channel('carbon-submissions')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'carbon_submissions' },
    (payload) => console.log('New submission:', payload)
  )
  .subscribe();
```

## 📈 Row Level Security Policies

### Students Can:
- ✅ View their own submissions
- ✅ Create their own submissions
- ✅ Update their own submissions
- ✅ View all departments

### Admins Can:
- ✅ View all submissions
- ✅ Create/update departments
- ✅ Manage users
- ✅ Update emission factors

## 🛠 Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` file exists in project root
- Check variable names start with `VITE_`
- Restart dev server after adding variables

### "relation does not exist"
- Run all migration files in order
- Check SQL Editor for any errors
- Verify tables exist in Table Editor

### Authentication Issues
- Confirm email auth is enabled in Supabase dashboard
- Check RLS policies are properly set
- Verify user exists in `auth.users` table

## 📚 Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🤝 Support
For issues or questions:
1. Check Supabase dashboard logs
2. Review migration files for errors
3. Verify environment variables are correct
