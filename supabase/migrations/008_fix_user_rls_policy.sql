-- Drop the circular dependency policy
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- Create a simpler policy that allows users to view their own profile
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Create a separate policy for admins to view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);
