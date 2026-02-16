-- Fix RLS policy to allow users to insert their own record during signup
-- This replaces the overly restrictive "Only admins can insert users" policy

DROP POLICY IF EXISTS "Only admins can insert users" ON users;

CREATE POLICY "Users can insert their own profile or admins can insert any"
ON users FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow users to insert their own record (id matches auth.uid())
  id = auth.uid() 
  OR
  -- OR allow admins to insert any user
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
