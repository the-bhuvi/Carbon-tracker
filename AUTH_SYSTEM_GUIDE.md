# 🔐 Authentication System Guide

## Overview

The Carbon Tracker now has a complete authentication system with:
- **Separate login pages** for Students and Admins
- **Student self-registration** (sign up)
- **Landing page** to choose login type
- **Role-based access control**

---

## 🌐 Available Routes

### Public Routes (No Login Required)

| Route | Description |
|-------|-------------|
| `/` or `/landing` | Landing page with Student/Admin options |
| `/student/login` | Student login page |
| `/student/signup` | Student self-registration |
| `/admin/login` | Admin login page |

### Protected Routes (Login Required)

| Route | Description | Access |
|-------|-------------|--------|
| `/dashboard` | Main dashboard | All authenticated users |
| `/student-survey` | Student carbon survey | Students only |
| `/faculty-survey` | Faculty carbon survey | Faculty only |
| `/history` | Response history | All authenticated users |
| `/admin/input` | Manual data entry | Admins only |
| `/admin/surveys` | Survey management | Admins only |

---

## 👨‍🎓 Student Sign Up Flow

### For New Students:

1. **Visit** `/` or `/landing`
2. **Click** "Sign Up" under Students section
3. **Fill in:**
   - Full Name
   - Email
   - Password (min 6 characters)
   - Confirm Password
4. **Submit** - Account is created automatically!
5. **Redirected to** Student Login
6. **Login** with your credentials

### What Happens Behind the Scenes:
- Creates authentication user in Supabase Auth
- Automatically creates database user record with `student` role
- Assigns to default department
- User can immediately login and access student features

---

## 🔑 Login Flows

### Student Login (`/student/login`)
- Clean, student-friendly interface
- Green theme
- Links to sign up
- Link to admin login
- Redirects to dashboard after successful login

### Admin Login (`/admin/login`)
- Professional, admin-focused interface
- Slate/gray theme
- No sign up option (admins created manually)
- Link to student login
- Redirects to dashboard after successful login

---

## 🛡️ Creating Admin Users

Admins **cannot** self-register. They must be created manually:

### Option 1: Supabase Dashboard (Recommended)

1. **Go to** Supabase Dashboard → Authentication → Users
2. **Click** "Add User" → "Create new user"
3. **Enter:**
   ```
   Email: admin@university.edu
   Password: SecurePassword123
   Auto Confirm User: ✅
   ```
4. **Copy the UUID** generated
5. **Go to** Table Editor → `users` table
6. **Insert row:**
   ```
   id: [paste UUID from step 4]
   name: Admin Name
   email: admin@university.edu
   role: admin
   department_id: 11111111-1111-1111-1111-111111111111
   ```

### Option 2: SQL Editor

```sql
-- Step 1: Create auth user manually in Authentication UI
-- Step 2: Run this SQL (replace the UUID with the one from step 1)

INSERT INTO users (id, name, email, role, department_id)
VALUES (
  'your-auth-uuid-here',
  'Admin Name',
  'admin@university.edu',
  'admin',
  '11111111-1111-1111-1111-111111111111'
);
```

---

## 🎭 User Roles

### Student
- Can access: Dashboard, Student Survey, History
- Can self-register via signup page
- Cannot access admin features

### Faculty
- Can access: Dashboard, Faculty Survey, History
- Cannot self-register (must be created by admin)
- Cannot access admin features

### Admin
- Can access: Everything
- Must be manually created
- Has access to Data Entry and Survey Management

---

## 🚀 Deployment: Environment Variables

For deployment (Vercel, Netlify, etc.), you **MUST** set these environment variables:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### How to Add Environment Variables:

**Vercel:**
1. Project Settings → Environment Variables
2. Add both variables
3. Redeploy

**Netlify:**
1. Site Settings → Environment Variables
2. Add both variables
3. Trigger redeploy

**Other Platforms:**
- Look for "Environment Variables" or "Build Configuration"
- Add the variables exactly as shown (case-sensitive)
- Redeploy the application

---

## 🧪 Testing the System

### Test Student Registration:
1. Visit `http://localhost:8081/`
2. Click "Sign Up" under Students
3. Create account with test email
4. Verify you're redirected to login
5. Login and verify dashboard access

### Test Student Login:
1. Visit `http://localhost:8081/student/login`
2. Login with student credentials
3. Verify access to student survey
4. Verify NO access to admin routes

### Test Admin Login:
1. Visit `http://localhost:8081/admin/login`
2. Login with admin credentials
3. Verify access to all features
4. Verify admin routes are accessible

### Test Role-Based Access:
1. Login as student
2. Try to access `/admin/input` directly
3. Should be redirected back to dashboard
4. Logout
5. Login as admin
6. Access admin routes successfully

---

## 🔧 Customization

### Change Default Department for New Students:

Edit `src/pages/StudentSignup.tsx`, line 67:
```typescript
department_id: 'your-department-uuid-here'
```

### Modify Password Requirements:

Edit `src/pages/StudentSignup.tsx`, lines 37-43:
```typescript
if (password.length < 8) { // Change from 6 to 8
  toast({
    title: 'Weak password',
    description: 'Password must be at least 8 characters long.',
    variant: 'destructive',
  });
  return;
}
```

### Change Color Themes:

**Student Login Theme:**
- Edit `src/pages/StudentLogin.tsx`
- Change `text-green-600` to your preferred color

**Admin Login Theme:**
- Edit `src/pages/AdminLogin.tsx`
- Change `bg-slate-700` to your preferred color

---

## ⚠️ Important Security Notes

1. **Never commit `.env` file** to Git
2. **Use strong passwords** for production
3. **Enable email confirmation** in Supabase for production:
   - Supabase Dashboard → Authentication → Settings
   - Enable "Confirm email" option
4. **Set up RLS policies** in Supabase to secure data access
5. **Use HTTPS** in production (automatic on Vercel/Netlify)

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- **Solution:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to deployment platform
- See "Deployment: Environment Variables" section above

### Student signup creates auth user but not database record
- **Check:** Supabase RLS policies on `users` table
- **Solution:** Ensure `INSERT` policy allows authenticated users to create their own record

### Can't access routes after login
- **Solution:** Check user's `role` in database matches their actual role
- Logout and login again after role changes

### Redirected to login immediately after signup
- **Expected behavior:** Students must login after signup
- **Check:** Email confirmation is disabled in Supabase Auth settings

---

## 📝 Summary

✅ **Students** can self-register and login at `/student/login`  
✅ **Admins** must be created manually and login at `/admin/login`  
✅ **Landing page** provides clear navigation for both user types  
✅ **Role-based routing** ensures proper access control  
✅ **Environment variables** must be set for deployment  

For more details, see:
- `USER_ROLES_GUIDE.md` - How to create users
- `BACKEND_GUIDE.md` - Database setup
- `SETUP_CHECKLIST.md` - Initial setup steps
