# Carbon Tracker - Supabase Integration Complete! 🎉

Your Carbon Tracker app is now fully integrated with Supabase for backend and database functionality.

## ✅ What's Been Set Up

### 1. **Database Schema**
- ✅ 5 tables created in Supabase:
  - `profiles` - User accounts with admin/student roles
  - `admin_facility_data` - Campus facility carbon data
  - `student_survey_responses` - Student carbon footprint surveys
  - `carbon_footprint_history` - Historical tracking
  - `carbon_reduction_goals` - Reduction goals
- ✅ Row Level Security (RLS) enabled
- ✅ Automatic triggers and functions

### 2. **Authentication System**
- ✅ Auth context with login/signup
- ✅ Role-based access (admin/student)
- ✅ Protected routes
- ✅ User profile management

### 3. **Pages Integrated**
- ✅ **Admin Input** - Saves facility data to Supabase
- ✅ **Student Survey Form** - New direct survey (no Google Forms needed!)
- ✅ **Auth Page** - Login/Signup with role selection
- ✅ Navigation with user dropdown

### 4. **API Functions**
All CRUD operations ready in `src/lib/api.ts`:
- Save/get admin facility data
- Save/get student surveys
- Carbon history tracking
- Goal management

## 🚀 How to Use

### For Admins:

1. **Create Admin Account**
   - Go to `/auth`
   - Click "Sign Up" tab
   - Select "Admin" role
   - Fill in details and create account

2. **Submit Facility Data**
   - Go to `/admin` (Admin Input page)
   - Fill in campus infrastructure data
   - Add electricity, water, waste, fuel consumption
   - Click "Calculate & Save Carbon Footprint"
   - Data is saved to Supabase automatically!

### For Students:

1. **Create Student Account**
   - Go to `/auth`
   - Click "Sign Up" tab  
   - Select "Student" role
   - Create account

2. **Submit Carbon Survey**
   - Go to `/survey/form` (Student Survey Form)
   - Fill in your:
     - Transportation habits
     - Energy consumption
     - Diet preferences
     - Recycling habits
   - Click "Calculate & Submit"
   - Your footprint is calculated and saved!

## 📁 New Files Created

```
src/
├── contexts/
│   └── AuthContext.tsx          # Authentication context
├── lib/
│   ├── supabase.ts             # Supabase client setup
│   ├── database.types.ts       # TypeScript types
│   └── api.ts                  # All API functions
├── pages/
│   ├── Auth.tsx                # Login/Signup page
│   └── StudentSurveyForm.tsx   # Direct student survey
├── .env                        # Your Supabase credentials
├── .env.example               # Template
└── supabase-schema.sql        # Database schema (already run)
```

## 🔑 Environment Variables

Your `.env` file is already configured with:
```env
VITE_SUPABASE_URL=https://hynwnvyfsrmmitstgfui.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎯 Routes Available

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Dashboard | Everyone |
| `/auth` | Login/Signup | Public |
| `/admin` | Admin facility input | Admin only |
| `/survey` | Survey info page | Everyone |
| `/survey/form` | Student survey form | Students |
| `/history` | Carbon history | Logged in users |

## 💡 Key Features

### Authentication
- Email/password authentication via Supabase Auth
- Role-based access control (admin/student)
- Protected pages with auto-redirect
- User dropdown in navigation

### Data Storage
- All data saved to Supabase PostgreSQL
- Automatic carbon calculations
- Historical tracking
- Secure with Row Level Security

### Carbon Calculations

**Admin (Facility):**
- Infrastructure emissions (classrooms, buildings, hostels)
- Direct emissions (electricity, water, waste, fuel)
- Food emissions based on type

**Student (Personal):**
- Transportation (mode, distance, frequency)
- Energy usage (electricity, heating/cooling)
- Diet (vegan to meat-eater)
- Waste/recycling habits

## 🔒 Security

- Row Level Security ensures users only see their own data
- Admins can view aggregated student data
- Passwords hashed by Supabase Auth
- HTTPS connections only

## 📊 Next Steps

1. **Test the System**
   - Create test accounts (admin & student)
   - Submit sample data
   - Verify data appears in Supabase dashboard

2. **Customize Dashboard**
   - Update `/pages/Dashboard.tsx` to display Supabase data
   - Use `getCarbonHistory()` and `getAggregatedStats()`

3. **Update History Page**
   - Show past submissions from database
   - Add charts and visualizations

4. **Add Features** (Optional)
   - Email verification
   - Password reset
   - Profile editing
   - Data export

## 🐛 Troubleshooting

**Can't log in?**
- Check Supabase dashboard → Authentication → Users
- Verify email provider is enabled
- Check console for errors

**Data not saving?**
- Open browser console for error messages
- Verify you're logged in
- Check Supabase logs in dashboard

**Role issues?**
- After signup, check `profiles` table in Supabase
- Role should be set to 'admin' or 'student'

## 📚 Useful Commands

```bash
# Start development server
npm run dev

# Check Supabase connection in browser console
console.log(await supabase.auth.getSession())

# View all data in Supabase
# Go to: https://app.supabase.com → Table Editor
```

## 🎓 Learn More

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Your Carbon Tracker is ready to track emissions! 🌱**

Start by creating an account at `/auth` and exploring the features!
