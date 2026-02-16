# 🧪 Testing the New Authentication System

## Server is Running
Your dev server is running at: **http://localhost:8082/**

## What Was Fixed

The blank page issue was caused by:
1. `useCurrentUser` hook trying to fetch user data even when no user was authenticated
2. Potential infinite redirect loop in AdminRoute
3. Background styling conflicts

### Fixes Applied:
✅ Made `useCurrentUser` check for authenticated user before querying database  
✅ Fixed AdminRoute redirect to point to `/dashboard` instead of `/`  
✅ Moved background styling to protected routes only  
✅ Added error handling to auth session check  

## Test Checklist

### 1. Test Landing Page
- [ ] Visit http://localhost:8082/
- [ ] Should see "Carbon Tracker" heading
- [ ] Should see two cards: Students and Administrators
- [ ] Should see "Login" and "Sign Up" buttons under Students
- [ ] Should see "Admin Login" button under Administrators

### 2. Test Student Signup
- [ ] Click "Sign Up" under Students card
- [ ] Fill in:
  - Full Name: Test Student
  - Email: teststudent@test.com
  - Password: password123
  - Confirm Password: password123
- [ ] Click "Sign Up"
- [ ] Should redirect to Student Login page
- [ ] Should see success message

### 3. Test Student Login
- [ ] Enter email: teststudent@test.com
- [ ] Enter password: password123
- [ ] Click "Sign In"
- [ ] Should redirect to Dashboard
- [ ] Should see navigation with: Dashboard, History, Student Survey

### 4. Test Student Access Control
- [ ] While logged in as student
- [ ] Try to visit: http://localhost:8082/admin/input
- [ ] Should be redirected back to /dashboard
- [ ] Should NOT see admin menu items

### 5. Test Admin Login
- [ ] Logout (if logged in)
- [ ] Visit http://localhost:8082/admin/login
- [ ] Login with admin credentials:
  - Email: admin@university.edu (or your admin email)
  - Password: your-admin-password
- [ ] Should redirect to Dashboard
- [ ] Should see admin menu items: Data Entry, Survey Management

### 6. Test Admin Access
- [ ] Visit /admin/input
- [ ] Should have access
- [ ] Visit /admin/surveys
- [ ] Should have access

### 7. Test Navigation Links
- [ ] Click "Student Login" link on admin login page
- [ ] Should navigate to student login
- [ ] Click "Admin Login" link on student login page
- [ ] Should navigate to admin login
- [ ] Click "Sign up here" on student login
- [ ] Should navigate to signup page

## Expected Behaviors

### When NOT logged in:
- `/` → Redirects to `/landing`
- `/landing` → Shows landing page
- `/student/login` → Shows student login
- `/admin/login` → Shows admin login
- `/student/signup` → Shows signup form
- `/dashboard` → Redirects to `/student/login`
- `/admin/input` → Redirects to `/admin/login`

### When logged in as STUDENT:
- `/` → Redirects to `/dashboard`
- `/dashboard` → Shows dashboard
- `/student-survey` → Shows survey
- `/history` → Shows history
- `/admin/input` → Redirects to `/dashboard` (no access)
- `/admin/surveys` → Redirects to `/dashboard` (no access)

### When logged in as ADMIN:
- `/` → Redirects to `/dashboard`
- `/dashboard` → Shows dashboard
- `/admin/input` → Shows data entry form
- `/admin/surveys` → Shows survey management
- All routes accessible

## Troubleshooting

### If page is still blank:
1. Open browser console (F12)
2. Check for error messages
3. Check Network tab for failed requests
4. Try clearing browser cache (Ctrl+Shift+R)

### If signup doesn't work:
1. Check Supabase Auth settings
2. Ensure email confirmation is disabled for testing
3. Check browser console for errors

### If can't login:
1. Verify user exists in Supabase Auth
2. Verify user exists in users table
3. Check that role is set correctly
4. Try resetting password

## Next Steps After Testing

1. ✅ Verify all tests pass
2. ✅ Create admin users in Supabase
3. ✅ Deploy to production
4. ✅ Add environment variables to deployment platform
5. ✅ Test production deployment

---

**Current Server:** http://localhost:8082/  
**Status:** Ready for testing 🚀
