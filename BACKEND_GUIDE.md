# Carbon Tracker - Complete Backend Implementation Guide

## 🎯 What's Been Created

### Database Schema (Supabase/PostgreSQL)
Complete schema with 4 main tables:
- **departments** - Department/college information
- **users** - User profiles with role-based access
- **carbon_submissions** - Carbon emission tracking data
- **emission_factors** - Configurable conversion factors

### Automated Features
- ✅ Auto-calculation of carbon emissions via database triggers
- ✅ Carbon score categorization (Green/Moderate/High)
- ✅ Tree equivalent calculations
- ✅ Smart suggestions based on consumption patterns
- ✅ Row-Level Security (RLS) for data protection

### Analytics Functions
- Department summaries with trends
- Monthly emission trends
- Per-capita emissions by department

## 📁 File Structure

```
Carbon-tracker/
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql       # Tables, indexes, triggers
│   │   ├── 002_calculation_functions.sql # Carbon calculations & analytics
│   │   ├── 003_row_level_security.sql   # Security policies
│   │   └── 004_seed_data.sql            # Sample data
│   └── README.md                         # Setup instructions
├── src/
│   ├── types/
│   │   └── database.ts                   # TypeScript types for all tables
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts                 # Supabase client config
│   │       ├── auth.ts                   # Authentication helpers
│   │       ├── api.ts                    # API functions for all tables
│   │       └── index.ts                  # Exports
│   └── hooks/
│       └── useSupabase.ts                # React Query hooks
├── .env.example                          # Environment variables template
└── package.json                          # Updated with @supabase/supabase-js
```

## 🚀 Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose name, password, and region
4. Wait ~2 minutes for project creation

### Step 3: Configure Environment Variables
1. Copy `.env.example` to `.env`
2. Get your credentials from Supabase Dashboard → Settings → API
3. Update `.env`:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: Run Database Migrations
In Supabase Dashboard → SQL Editor, run each migration file in order:
1. `001_initial_schema.sql`
2. `002_calculation_functions.sql`
3. `003_row_level_security.sql`
4. `004_seed_data.sql`

### Step 5: Enable Authentication
In Supabase Dashboard → Authentication → Settings:
- Enable Email provider
- Configure email templates (optional)

## 📊 API Usage Examples

### Using React Hooks (Recommended)

```typescript
import {
  useCarbonSubmissions,
  useCreateCarbonSubmission,
  useDepartmentSummary,
  useMonthlyTrends
} from '@/hooks/useSupabase';

function MyComponent() {
  // Fetch data
  const { data: submissions, isLoading } = useCarbonSubmissions(userId);
  const { data: summary } = useDepartmentSummary();
  const { data: trends } = useMonthlyTrends();
  
  // Mutations
  const { mutate: createSubmission } = useCreateCarbonSubmission();
  
  const handleSubmit = (formData) => {
    createSubmission({
      user_id: userId,
      department_id: deptId,
      electricity_kwh: 450,
      diesel_liters: 20,
      petrol_liters: 30,
      travel_km: 80,
      water_liters: 8000,
      paper_kg: 12,
      ewaste_kg: 5
    });
  };
  
  return (
    // Your JSX
  );
}
```

### Direct API Usage

```typescript
import { 
  carbonSubmissionsApi, 
  analyticsApi,
  auth 
} from '@/lib/supabase';

// Create submission
const submission = await carbonSubmissionsApi.create({
  user_id: 'user-uuid',
  department_id: 'dept-uuid',
  electricity_kwh: 450,
  // ... other fields
});

// Get analytics
const summary = await analyticsApi.getDepartmentSummary();
const trends = await analyticsApi.getMonthlyTrends();
const perCapita = await analyticsApi.getPerCapitaEmissions();

// Authentication
await auth.signIn(email, password);
const user = await auth.getUser();
await auth.signOut();
```

## 🔐 Security & Permissions

### Row Level Security (RLS)
All tables have RLS enabled with the following policies:

**Students can:**
- View/create/update their own submissions
- View all departments
- View their own profile

**Admins can:**
- View all submissions
- Create/update departments
- Manage users
- Update emission factors

### Auth Integration
User roles are stored in the `users` table and linked to Supabase Auth:
```typescript
const { data } = await auth.signUp(email, password, {
  name: 'John Doe',
  role: 'student',
  department_id: 'dept-uuid'
});
```

## 📈 Carbon Calculation Logic

Automatic calculations triggered on every submission:

```typescript
// Automatic calculation formula:
total_carbon = 
  (electricity_kwh × 0.82) +
  (diesel_liters × 2.68) +
  (petrol_liters × 2.31) +
  (lpg_kg × 2.98) +
  (png_m3 × 2.75) +
  (travel_km × 0.12) +
  (water_liters × 0.0003) +
  (ewaste_kg × 1.5)

// Score categorization:
Green: < 100 kg CO2
Moderate: 100-500 kg CO2
High: > 500 kg CO2

// Tree equivalent: total_carbon / 21 kg/year
```

### Smart Suggestions
The system generates contextual suggestions:
- High electricity → "Switch to LED bulbs"
- High fuel usage → "Explore renewable alternatives"
- High travel → "Use public transport"
- High water → "Install water-saving fixtures"
- High e-waste → "Recycle through certified facilities"
- High paper → "Go digital"

## 🎨 Sample Test Data

After running seed migration, you'll have:
- **5 departments**: CS, EE, ME, CE, Business
- **13 users**: 3 admins + 10 students
- **15 submissions**: Spanning last 90 days

Test accounts:
```
Admin: admin@university.edu
Student: john.doe@student.edu
(You'll need to set passwords via Supabase Auth)
```

## 🔧 Advanced Features

### Real-time Subscriptions
```typescript
import { supabase } from '@/lib/supabase';

const channel = supabase
  .channel('carbon-updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'carbon_submissions'
  }, (payload) => {
    console.log('New submission:', payload.new);
  })
  .subscribe();
```

### Custom Queries
```typescript
const { data } = await supabase
  .from('carbon_submissions')
  .select(`
    *,
    user:users(*),
    department:departments(*)
  `)
  .eq('carbon_score', 'High')
  .gte('submission_date', '2024-01-01');
```

### Analytics Functions
```typescript
// Department summary
const summary = await supabase.rpc('get_department_summary');

// Monthly trends for specific department
const trends = await supabase.rpc('get_monthly_trends', {
  dept_id: 'dept-uuid'
});

// Per capita emissions
const perCapita = await supabase.rpc('get_per_capita_emissions');
```

## 🐛 Troubleshooting

### Common Issues

**"Missing Supabase environment variables"**
- Ensure `.env` file exists
- Variables must start with `VITE_`
- Restart dev server after changes

**"relation does not exist"**
- Run all migration files in SQL Editor
- Check for errors in migration output
- Verify tables in Table Editor

**Authentication errors**
- Enable Email auth in dashboard
- Check RLS policies are applied
- Verify user exists in auth.users

**CORS issues**
- Add your domain to Supabase allowed origins
- Settings → API → CORS

## 📚 Next Steps

1. **Set up Authentication UI**
   - Create login/signup pages
   - Use the `auth` helpers from `@/lib/supabase`

2. **Integrate with Existing Pages**
   - Update Dashboard to use `useDepartmentSummary()`
   - Update History to use `useCarbonSubmissions()`
   - Update StudentSurvey to use `useCreateCarbonSubmission()`

3. **Add Data Visualization**
   - Use Recharts with analytics data
   - Show trends and comparisons

4. **Implement Admin Features**
   - Department management
   - User management
   - Emission factor configuration

## 🎓 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Reference](https://supabase.com/docs/reference/javascript)
- [React Query Docs](https://tanstack.com/query/latest)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Need Help?** Check the `supabase/README.md` for detailed setup instructions.
