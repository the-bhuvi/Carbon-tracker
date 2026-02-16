# 👥 How to Create Users with Roles

## 🎯 Quick Answer:

Users have **TWO parts** in Supabase:
1. **Auth User** (for login) - created in Authentication tab
2. **Database User** (for role & data) - created in users table

---

## 📝 Step-by-Step: Create a User

### **Step 1: Create Auth User (for login)**

1. Open **Supabase Dashboard**
2. Go to **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Enter:
   ```
   Email: admin@university.edu
   Password: YourSecurePassword123
   Auto Confirm User: ✅ (check this box)
   ```
5. Click **Create user**
6. **Copy the UUID** that appears (you'll need this!)

---

### **Step 2: Create Database User (for role)**

1. Go to **Table Editor** → **users** table
2. Click **Insert** → **Insert row**
3. Fill in:

```
id:            [PASTE THE UUID FROM STEP 1]
name:          Admin User
email:         admin@university.edu
role:          admin           ← THIS SETS THE ROLE!
department_id: 11111111-1111-1111-1111-111111111111
```

4. Click **Save**

**That's it!** This user can now login as an admin.

---

## 🎭 Creating Different Role Types:

### **Admin User:**
```sql
-- In Table Editor → users table
role: admin
```
**Gets access to:**
- Survey Management
- Data Entry
- All analytics
- All responses

---

### **Student User:**
```sql
-- In Table Editor → users table
role: student
```
**Gets access to:**
- Student Survey
- Personal history
- Dashboard

---

### **Faculty User:**
```sql
-- In Table Editor → users table  
role: faculty
```
**Gets access to:**
- Faculty Survey
- Personal history
- Dashboard

---

## 🔧 Change Existing User's Role:

1. Go to **Table Editor** → **users** table
2. Find the user by email or name
3. Click on the **role** field
4. Change to `admin`, `student`, or `faculty`
5. Click **Save**
6. User must **logout and login again** for changes to take effect

---

## 📋 Quick SQL Method (Advanced):

If you prefer SQL, run this in **SQL Editor**:

### Create Admin:
```sql
INSERT INTO users (id, name, email, role, department_id)
VALUES (
  'your-auth-uuid-here',
  'Admin Name',
  'admin@university.edu',
  'admin',
  '11111111-1111-1111-1111-111111111111'
);
```

### Create Student:
```sql
INSERT INTO users (id, name, email, role, department_id)
VALUES (
  'your-auth-uuid-here',
  'Student Name', 
  'student@university.edu',
  'student',
  '11111111-1111-1111-1111-111111111111'
);
```

### Update Existing User's Role:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'user@university.edu';
```

---

## ⚠️ Important Notes:

1. **UUID Must Match:** The `id` in `users` table MUST match the UUID from Authentication
2. **Email Must Match:** Use the same email in both places
3. **Logout Required:** Users must logout/login after role changes
4. **Department Required:** Every user needs a department_id (use existing ones from seed data)

---

## 🧪 Test Users (Pre-loaded in Database):

These users are **already in the `users` table** from seed data:

| Email | Role | UUID | Status |
|-------|------|------|--------|
| admin@university.edu | admin | a1111111-1111-1111-1111-111111111111 | In database only |
| john.doe@student.edu | student | b1111111-1111-1111-1111-111111111111 | In database only |
| jane.smith@student.edu | student | b2222222-2222-2222-2222-222222222222 | In database only |

**To use them:**
1. Create auth users with these emails in Authentication
2. Use the **same UUID** when creating the auth user
3. OR: Just use their existing database records by matching the email

---

## 🎯 Recommended Setup for Testing:

**Create 3 test accounts:**

1. **Admin Account:**
   - Auth: admin@test.com / password123
   - Database: role = `admin`

2. **Student Account:**
   - Auth: student@test.com / password123
   - Database: role = `student`

3. **Faculty Account:**
   - Auth: faculty@test.com / password123
   - Database: role = `faculty`

Then test the different UIs for each role!

---

**Quick Tip:** You can check a user's current role by viewing the `users` table in Table Editor.
