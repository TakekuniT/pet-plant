import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// GET /api/plants/[id] - Get a specific plant
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
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

    const { id } = params

    // Get plant with members and care actions
    const { data: plant, error } = await supabase
      .from('plants')
      .select(`
        *,
        plant_members(
          user_id,
          role,
          users(name, email)
        ),
        care_actions(
          id,
          action,
          created_at,
          users(name, email)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching plant:', error)
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
    }

    // Check if user has access to this plant
    const hasAccess = plant.owner_id === user.id || 
      plant.plant_members.some((member: any) => member.user_id === user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ plant })
  } catch (error) {
    console.error('Error in GET /api/plants/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/plants/[id] - Update a plant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
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

    const { id } = params
    const body = await request.json()
    const { name, health, happiness, growth, stage, mood } = body

    // Check if user owns the plant
    const { data: plant, error: fetchError } = await supabase
      .from('plants')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (fetchError || !plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
    }

    if (plant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only the owner can update this plant' }, { status: 403 })
    }

    // Update the plant
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (health !== undefined) updateData.health = Math.max(0, Math.min(100, health))
    if (happiness !== undefined) updateData.happiness = Math.max(0, Math.min(100, happiness))
    if (growth !== undefined) updateData.growth = Math.max(0, Math.min(100, growth))
    if (stage !== undefined) updateData.stage = stage
    if (mood !== undefined) updateData.mood = mood

    const { data: updatedPlant, error: updateError } = await supabase
      .from('plants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating plant:', updateError)
      return NextResponse.json({ error: 'Failed to update plant' }, { status: 500 })
    }

    return NextResponse.json({ plant: updatedPlant })
  } catch (error) {
    console.error('Error in PUT /api/plants/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/plants/[id] - Delete a plant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
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

    const { id } = params

    // Check if user owns the plant
    const { data: plant, error: fetchError } = await supabase
      .from('plants')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (fetchError || !plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
    }

    if (plant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only the owner can delete this plant' }, { status: 403 })
    }

    // Delete the plant (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('plants')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting plant:', deleteError)
      return NextResponse.json({ error: 'Failed to delete plant' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Plant deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/plants/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
