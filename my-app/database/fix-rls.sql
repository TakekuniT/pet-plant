-- Temporarily disable RLS to fix the infinite recursion issue
-- This allows us to test the basic functionality first

-- Disable RLS on plants table
ALTER TABLE public.plants DISABLE ROW LEVEL SECURITY;

-- Disable RLS on plant_members table  
ALTER TABLE public.plant_members DISABLE ROW LEVEL SECURITY;

-- Disable RLS on care_actions table
ALTER TABLE public.care_actions DISABLE ROW LEVEL SECURITY;

-- Keep RLS on users table for security
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
