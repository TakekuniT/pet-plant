-- Disable RLS on all tables to fix authentication issues
-- This allows the app to work properly during development

-- Disable RLS on all tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_actions DISABLE ROW LEVEL SECURITY;

-- Note: In production, you would want to re-enable RLS with proper policies
-- For now, this allows the app to function correctly
