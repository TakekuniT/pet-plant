import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// POST /api/plants/join - Join a plant by invitation
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { plantId, role = 'member' } = body

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is already a member
    const { data: existingMember, error: existingError } = await supabase
      .from('plant_members')
      .select('id')
      .eq('plant_id', plantId)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'You are already a member of this plant' }, { status: 400 })
    }

    // Verify the plant exists
    const { data: plant, error: plantError } = await supabase
      .from('plants')
      .select('id, name')
      .eq('id', plantId)
      .single()

    if (plantError || !plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
    }

    // Add the user as a member
    const { data: newMember, error: addError } = await supabase
      .from('plant_members')
      .insert({
        plant_id: plantId,
        user_id: user.id,
        role: role
      })
      .select(`
        id,
        role,
        joined_at,
        users (
          id,
          name,
          email
        )
      `)
      .single()

    if (addError) {
      console.error('Error joining plant:', addError)
      return NextResponse.json({ error: 'Failed to join plant' }, { status: 500 })
    }

    return NextResponse.json({ 
      member: newMember,
      plant: { id: plant.id, name: plant.name }
    })
  } catch (error) {
    console.error('Error in POST /api/plants/join:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
