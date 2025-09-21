import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// GET /api/plants - Get all plants for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    console.log('Fetching plants...')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    console.log('Auth header:', authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth header, returning empty plants')
      return NextResponse.json({ plants: [] })
    }
    
    const token = authHeader.split(' ')[1]
    
    // Set the session for this request
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    console.log('User auth result:', { user: user?.id, error: authError })
    
    if (authError || !user) {
      console.log('No authenticated user, returning empty plants')
      return NextResponse.json({ plants: [] })
    }

    // Get plants where user is owner
    const { data: plants, error } = await supabase
      .from('plants')
      .select('*')
      .eq('owner_id', user.id)

    if (error) {
      console.error('Error fetching plants:', error)
      return NextResponse.json({ plants: [] })
    }

    console.log('Found plants:', plants)
    return NextResponse.json({ plants: plants || [] })
  } catch (error) {
    console.error('Error in GET /api/plants:', error)
    return NextResponse.json({ plants: [] })
  }
}

// POST /api/plants - Create a new plant
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { name = 'Sprouty' } = body

    console.log('Creating plant with name:', name)

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    console.log('Auth header:', authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth header, creating mock plant')
      // If no user, create a mock plant for testing
      const mockPlant = {
        id: 'mock-' + Date.now(),
        name,
        health: 80,
        happiness: 75,
        growth: 25,
        stage: 'seedling',
        mood: 'happy',
        last_watered: new Date().toISOString(),
        last_fed: new Date().toISOString(),
        last_played: new Date().toISOString(),
        owner_id: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return NextResponse.json({ plant: mockPlant })
    }
    
    const token = authHeader.split(' ')[1]
    
    // Set the session for this request
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    console.log('User auth result:', { user: user?.id, error: authError })
    
    if (authError || !user) {
      console.log('No authenticated user, creating mock plant')
      // If no user, create a mock plant for testing
      const mockPlant = {
        id: 'mock-' + Date.now(),
        name,
        health: 80,
        happiness: 75,
        growth: 25,
        stage: 'seedling',
        mood: 'happy',
        last_watered: new Date().toISOString(),
        last_fed: new Date().toISOString(),
        last_played: new Date().toISOString(),
        owner_id: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return NextResponse.json({ plant: mockPlant })
    }

    console.log('Creating plant in database for user:', user.id)
    console.log('Plant data to insert:', { name, owner_id: user.id })

    // First, let's verify the user exists in our users table
    const { data: userCheck, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    console.log('User check result:', { userCheck, userCheckError })

    if (userCheckError || !userCheck) {
      console.log('User not found in users table, creating profile...')
      
      // Create user profile automatically
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
        })
        .select()
        .single()

      if (createUserError) {
        console.error('Error creating user profile:', createUserError)
        return NextResponse.json({ error: 'Failed to create user profile', details: createUserError }, { status: 500 })
      }

      console.log('User profile created successfully:', newUser)
    }

    // Create the plant in the database
    const { data: plant, error: plantError } = await supabase
      .from('plants')
      .insert({
        name,
        owner_id: user.id
      })
      .select()
      .single()

    console.log('Plant creation result:', { plant, plantError })

    if (plantError) {
      console.error('Error creating plant:', plantError)
      return NextResponse.json({ error: 'Failed to create plant', details: plantError }, { status: 500 })
    }

    console.log('Plant created successfully:', plant)

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
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
}
