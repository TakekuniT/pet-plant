import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Plant {
  id: string
  name: string
  health: number
  happiness: number
  growth: number
  stage: 'seedling' | 'growing' | 'mature' | 'blooming'
  mood: 'happy' | 'sad' | 'excited' | 'sleepy'
  last_watered: string
  last_fed: string
  last_played: string
  created_at: string
  updated_at: string
  owner_id: string
}

export interface CareAction {
  id: string
  plant_id: string
  user_id: string
  action: 'water' | 'feed' | 'play'
  created_at: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

export interface PlantMember {
  id: string
  plant_id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
}
