-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- The simple "Users can view their own profile" policy is sufficient
-- Users read their own record (id = auth.uid()), then the app checks their role
