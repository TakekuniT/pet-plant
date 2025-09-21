import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/plants - Get all plants for the current user
export async function GET(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get plants where user is owner or member
    const { data: plants, error } = await supabase
      .from('plants')
      .select(`
        *,
        plant_members!inner(user_id)
      `)
      .or(`owner_id.eq.${user.id},plant_members.user_id.eq.${user.id}`)

    if (error) {
      console.error('Error fetching plants:', error)
      return NextResponse.json({ error: 'Failed to fetch plants' }, { status: 500 })
    }

    return NextResponse.json({ plants })
  } catch (error) {
    console.error('Error in GET /api/plants:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/plants - Create a new plant
export async function POST(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name = 'Sprouty' } = body

    // Create the plant
    const { data: plant, error: plantError } = await supabase
      .from('plants')
      .insert({
        name,
        owner_id: user.id
      })
      .select()
      .single()

    if (plantError) {
      console.error('Error creating plant:', plantError)
      return NextResponse.json({ error: 'Failed to create plant' }, { status: 500 })
    }

    // Add owner as a member
    const { error: memberError } = await supabase
      .from('plant_members')
      .insert({
        plant_id: plant.id,
        user_id: user.id,
        role: 'owner'
      })

    if (memberError) {
      console.error('Error adding owner as member:', memberError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ plant })
  } catch (error) {
    console.error('Error in POST /api/plants:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
