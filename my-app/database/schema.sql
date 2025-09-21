-- Plant Monster Pet Database Schema
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plants table
CREATE TABLE public.plants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Sprouty',
  health INTEGER NOT NULL DEFAULT 80 CHECK (health >= 0 AND health <= 100),
  happiness INTEGER NOT NULL DEFAULT 75 CHECK (happiness >= 0 AND happiness <= 100),
  growth INTEGER NOT NULL DEFAULT 25 CHECK (growth >= 0 AND growth <= 100),
  stage TEXT NOT NULL DEFAULT 'seedling' CHECK (stage IN ('seedling', 'growing', 'mature', 'blooming')),
  mood TEXT NOT NULL DEFAULT 'happy' CHECK (mood IN ('happy', 'sad', 'excited', 'sleepy')),
  last_watered TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_fed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID REFERENCES public.users(id) NOT NULL
);

-- Create plant_members table (for collaborative care)
CREATE TABLE public.plant_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plant_id, user_id)
);

-- Create care_actions table (history of all care actions)
CREATE TABLE public.care_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('water', 'feed', 'play')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_plants_owner_id ON public.plants(owner_id);
CREATE INDEX idx_plant_members_plant_id ON public.plant_members(plant_id);
CREATE INDEX idx_plant_members_user_id ON public.plant_members(user_id);
CREATE INDEX idx_care_actions_plant_id ON public.care_actions(plant_id);
CREATE INDEX idx_care_actions_created_at ON public.care_actions(created_at DESC);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_actions ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can view plants they own or are members of
CREATE POLICY "Users can view plants they own or are members of" ON public.plants
  FOR SELECT USING (
    auth.uid() = owner_id OR 
    auth.uid() IN (
      SELECT user_id FROM public.plant_members 
      WHERE plant_id = plants.id
    )
  );

-- Only plant owners can update plant data
CREATE POLICY "Only owners can update plants" ON public.plants
  FOR UPDATE USING (auth.uid() = owner_id);

-- Only owners can insert new plants
CREATE POLICY "Only authenticated users can create plants" ON public.plants
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Plant members can view membership info
CREATE POLICY "Users can view plant memberships" ON public.plant_members
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT owner_id FROM public.plants 
      WHERE id = plant_members.plant_id
    )
  );

-- Plant owners can add members
CREATE POLICY "Plant owners can add members" ON public.plant_members
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM public.plants 
      WHERE id = plant_members.plant_id
    )
  );

-- Users can view care actions for plants they have access to
CREATE POLICY "Users can view care actions for accessible plants" ON public.care_actions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.plant_members 
      WHERE plant_id = care_actions.plant_id
    ) OR
    auth.uid() IN (
      SELECT owner_id FROM public.plants 
      WHERE id = care_actions.plant_id
    )
  );

-- Users can add care actions for plants they have access to
CREATE POLICY "Users can add care actions for accessible plants" ON public.care_actions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      auth.uid() IN (
        SELECT user_id FROM public.plant_members 
        WHERE plant_id = care_actions.plant_id
      ) OR
      auth.uid() IN (
        SELECT owner_id FROM public.plants 
        WHERE id = care_actions.plant_id
      )
    )
  );

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plants_updated_at
  BEFORE UPDATE ON public.plants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
