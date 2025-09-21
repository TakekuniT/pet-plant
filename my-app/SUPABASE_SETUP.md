# 🚀 Supabase Setup Guide for GrowTogether

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up/login
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `plant-monster-pet`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
6. Click "Create new project"
7. Wait for the project to be ready (2-3 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. In your project root, create a `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace the values with your actual Supabase credentials

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of `database/schema.sql`
4. Click "Run" to execute the schema

This will create:
- ✅ Users table
- ✅ Plants table  
- ✅ Plant members table
- ✅ Care actions table
- ✅ Row Level Security policies
- ✅ Triggers and functions

## Step 5: Enable Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add: `http://localhost:3001`
3. Under **Redirect URLs**, add: `http://localhost:3001/**`
4. Save changes

## Step 6: Test Your Setup

1. Start your Next.js app: `npm run dev`
2. Go to `http://localhost:3001`
3. Try signing up with a test email
4. Check your Supabase dashboard → **Authentication** → **Users** to see the new user

## 🎯 What You Get

### ✅ **User Authentication**
- Sign up/Sign in with email
- Automatic user profile creation
- Secure session management

### ✅ **Plant Management**
- Create and manage plants
- Collaborative care system
- Real-time updates

### ✅ **Care Actions**
- Water, feed, and play actions
- Automatic stat calculations
- Care history tracking

### ✅ **Friend System**
- Invite friends to care for plants
- Role-based permissions
- Member management

## 🔧 API Endpoints

- `GET /api/plants` - Get user's plants
- `POST /api/plants` - Create new plant
- `POST /api/plants/[id]/care` - Perform care action
- `GET /api/plants/[id]/members` - Get plant members
- `POST /api/plants/[id]/members` - Add member

## 🚨 Troubleshooting

### "Invalid API key" error
- Check your `.env.local` file has the correct values
- Make sure you copied the **anon public** key, not the service role key

### "Row Level Security" errors
- Make sure you ran the complete `schema.sql` file
- Check that RLS policies are enabled

### Authentication not working
- Verify your Site URL and Redirect URLs in Supabase settings
- Check browser console for errors

## 🎉 Next Steps

Once setup is complete, you can:
1. Add the Auth component to your app
2. Connect your existing plant data to the database
3. Add real-time features with Supabase subscriptions
4. Deploy to Vercel with environment variables

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
