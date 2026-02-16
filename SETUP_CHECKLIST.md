# Carbon Tracker - Setup Checklist

## ✅ Complete Setup Guide

Follow these steps in order to get the application running:

### Step 1: Verify Supabase Configuration

**1.1 Check your .env file**
- ✅ File exists at project root
- ✅ Contains `VITE_SUPABASE_URL`
- ✅ Contains `VITE_SUPABASE_ANON_KEY`

**1.2 Verify Supabase Project**
- Go to https://app.supabase.com
- Confirm your project is active
- Note your project URL matches `.env` file

### Step 2: Run Database Migrations

**2.1 Open Supabase SQL Editor**
- Go to your Supabase Dashboard
- Click "SQL Editor" in the sidebar
- Click "New query"

**2.2 Run migrations in order:**

```sql
-- Run each file from supabase/migrations/ folder:
-- 1. 001_initial_schema.sql
-- 2. 002_calculation_functions.sql  
-- 3. 003_row_level_security.sql
-- 4. 004_seed_data.sql (optional - sample data)
```

Copy and paste each file's content, then click "Run"

**2.3 Verify tables were created**
- Go to "Table Editor" in Supabase Dashboard
- You should see: `departments`, `users`, `carbon_submissions`, `emission_factors`

### Step 3: Enable Authentication

**3.1 Enable Email Provider**
- Go to Authentication → Providers
- Find "Email" provider
- Toggle it ON if not already enabled
- Click Save

**3.2 Disable Email Confirmations (for testing)**
- Go to Authentication → Settings
- Scroll to "Email Confirmations"
- Toggle OFF "Enable email confirmations" (for easier testing)
- Click Save

### Step 4: Create Test Users

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to Authentication → Users
2. Click "Add user"
3. Choose "Create new user"
4. Enter:
   - Email: `admin@test.com`
   - Password: `test123456`
   - Auto confirm user: ✅ ON
5. Click "Create user"

**Option B: Using SQL**
```sql
-- Create test admin user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'admin@test.com',
  crypt('test123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
```

**4.1 Create User Profile**

After creating auth user, create matching profile:
```sql
-- Get the user ID from auth.users table
SELECT id FROM auth.users WHERE email = 'admin@test.com';

-- Then insert into users table (replace the UUID below)
INSERT INTO users (id, name, email, role, department_id)
VALUES (
  'your-user-id-from-above',  -- Replace with actual ID
  'Test Admin',
  'admin@test.com',
  'admin',
  NULL
);
```

### Step 5: Verify Everything Works

**5.1 Start the development server**
```bash
npm install
npm run dev
```

**5.2 Test Login**
1. Open http://localhost:5173
2. You should be redirected to `/login`
3. Enter:
   - Email: `admin@test.com`
   - Password: `test123456`
4. Click "Sign In"
5. You should be redirected to Dashboard

**5.3 Test Data Submission**
1. Go to "Admin Input" page
2. Select a department from dropdown
3. Enter some test values:
   - Electricity: 100
   - Diesel: 10
   - Travel: 50
4. Click "Submit Carbon Data"
5. Should see success message with calculated CO₂e

**5.4 Verify Dashboard**
1. Go to Dashboard
2. Should see department summary cards
3. Should see charts with your submitted data

**5.5 Check History**
1. Go to History page
2. Should see your submission in the table

## 🐛 Troubleshooting

### Error: 401 Unauthorized

**Problem**: Login returns 401 error

**Solutions**:
1. ✅ Check email provider is enabled (Step 3.1)
2. ✅ Verify user exists in Authentication → Users
3. ✅ Try creating user with "Auto confirm" enabled
4. ✅ Check password is at least 6 characters
5. ✅ Disable email confirmations for testing

### Error: "Missing Supabase environment variables"

**Problem**: App shows error about missing variables

**Solutions**:
1. ✅ Ensure `.env` file exists at project root
2. ✅ Variables must start with `VITE_` prefix
3. ✅ Restart dev server after changing `.env`
4. ✅ Check no extra spaces in values

### Error: "relation does not exist"

**Problem**: Database queries fail

**Solutions**:
1. ✅ Run all migration files in SQL Editor (Step 2)
2. ✅ Check for errors in migration output
3. ✅ Verify tables exist in Table Editor
4. ✅ Run migrations in correct order

### Error: "No data showing on Dashboard"

**Problem**: Dashboard is empty

**Solutions**:
1. ✅ Submit data first via Admin Input
2. ✅ Check if seed data was loaded (004_seed_data.sql)
3. ✅ Verify RLS policies allow reading (003_row_level_security.sql)
4. ✅ Check browser console for API errors

### Error: "Cannot read property of undefined"

**Problem**: App crashes or shows blank page

**Solutions**:
1. ✅ Check all migrations are run
2. ✅ Verify user profile exists in `users` table
3. ✅ Check browser console for specific error
4. ✅ Clear browser cache and reload

## 📋 Quick Test Credentials

After setup, you should have these test accounts:

**Admin Account:**
- Email: `admin@test.com`
- Password: `test123456`
- Role: admin

**Create More Users:**
Use the same process in Step 4 to create student accounts or additional admins.

## ✨ Success Indicators

You'll know everything is working when:
- ✅ Login redirects to Dashboard (not login page)
- ✅ Navigation shows "Sign Out" button
- ✅ Dashboard displays department cards and charts
- ✅ Admin Input shows department dropdown
- ✅ Submitting data shows success toast
- ✅ History page shows your submissions

## 🔗 Useful Links

- **Supabase Dashboard**: https://app.supabase.com
- **Auth Docs**: https://supabase.com/docs/guides/auth
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **SQL Editor**: Dashboard → SQL Editor
- **Table Editor**: Dashboard → Table Editor
- **Auth Users**: Dashboard → Authentication → Users

---

**Need Help?** Check the error message in browser console (F12) and match it with the troubleshooting section above.
