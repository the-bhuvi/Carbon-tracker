# Carbon Tracker - Frontend-Backend Integration

## ✅ Integration Complete!

The frontend is now fully connected to the Supabase backend. All pages have been updated to use real database data instead of localStorage.

## 🎯 What Was Changed

### 1. Authentication System
- **Created**: `src/components/AuthContext.tsx` - Auth provider with user state management
- **Created**: `src/pages/Login.tsx` - Login page
- **Updated**: `src/App.tsx` - Added protected routes and auth provider
- **Updated**: `src/components/Navigation.tsx` - Added sign out button

### 2. Admin Input Page (`src/pages/AdminInput.tsx`)
- ❌ **Removed**: localStorage-based data storage  
- ✅ **Added**: Supabase integration with `useCreateCarbonSubmission` hook
- ✅ **Added**: Department selection from database
- ✅ **Added**: Real-time carbon calculation via database triggers
- ✅ **Added**: Proper error handling and success messages

### 3. Dashboard Page (`src/pages/Dashboard.tsx`)
- ❌ **Removed**: localStorage data reading
- ✅ **Added**: Real department summary analytics using `useDepartmentSummary`
- ✅ **Added**: Monthly trends chart using `useMonthlyTrends`
- ✅ **Added**: Department comparison table with carbon scores
- ✅ **Added**: Loading states

### 4. History Page (`src/pages/History.tsx`)
- ❌ **Removed**: localStorage-based history
- ✅ **Added**: User-specific submissions using `useCarbonSubmissions`
- ✅ **Added**: Detailed submission table with all metrics
- ✅ **Added**: Mobile-friendly card view
- ✅ **Added**: Summary statistics

## 🚀 How to Test

### Step 1: Ensure Supabase is Set Up
Make sure you have:
1. Created a Supabase project
2. Run all migrations in `supabase/migrations/` folder
3. Configured `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Step 2: Start the Development Server
```bash
npm install
npm run dev
```

### Step 3: Test the Flow
1. **Login** - Visit http://localhost:5173 and you'll be redirected to `/login`
   - Use credentials from your Supabase Auth users
   
2. **Submit Data** - Go to "Admin Input" or "Student Survey"
   - Select a department
   - Enter consumption data
   - Submit and see the carbon calculation

3. **View Dashboard** - Go to "Dashboard"
   - See department summaries
   - View monthly trends
   - Check highest emitting department

4. **Check History** - Go to "History"
   - View all your submissions
   - See carbon scores and tree equivalents

## 📊 Data Flow

```
User Input (Admin Input Page)
  ↓
Supabase API (useCreateCarbonSubmission hook)
  ↓
Database Trigger (calculate_carbon_metrics)
  ↓
Calculated Fields (total_carbon, carbon_score, tree_equivalent, suggestions)
  ↓
Dashboard & History Pages (useDepartmentSummary, useCarbonSubmissions)
  ↓
Charts & Tables Display
```

## 🔧 Available Hooks

All hooks are defined in `src/hooks/useSupabase.ts`:

### Submissions
- `useCarbonSubmissions(userId)` - Get user's submissions
- `useCreateCarbonSubmission()` - Submit new data
- `useUpdateCarbonSubmission()` - Update existing submission
- `useDeleteCarbonSubmission()` - Delete submission

### Analytics
- `useDepartmentSummary()` - Get all department stats
- `useMonthlyTrends(departmentId?)` - Get monthly emission trends
- `usePerCapitaEmissions()` - Get per-student emissions

### Departments & Users
- `useDepartments()` - Get all departments
- `useCurrentUser()` - Get logged-in user
- `useUsers()` - Get all users (admin only)

## 🔐 Authentication

The app uses Supabase Auth with Row Level Security (RLS):
- **Students** can only view/create their own submissions
- **Admins** can view all submissions and manage users
- Automatic user profile creation on signup

## 📝 Next Steps

1. **Create User Accounts** - Use Supabase Dashboard → Authentication to create test users
2. **Seed Data** - Run `004_seed_data.sql` to populate sample departments and data
3. **Customize** - Modify emission factors in the database as needed
4. **Deploy** - Deploy to production when ready

## 🐛 Troubleshooting

**"Missing Supabase environment variables"**
- Check `.env` file exists and has correct values
- Restart dev server after changing `.env`

**"No data showing on Dashboard"**
- Submit some data first via Admin Input
- Check browser console for API errors
- Verify migrations are run in Supabase

**"Login not working"**
- Create user in Supabase Dashboard → Authentication
- Check email/password are correct
- Verify Email auth provider is enabled in Supabase

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [Backend Guide](./BACKEND_GUIDE.md)

---

**Status**: ✅ Frontend-Backend Integration Complete!
