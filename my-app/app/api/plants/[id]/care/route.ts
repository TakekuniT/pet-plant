import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/plants/[id]/care - Perform a care action on a plant
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const plantId = params.id
    const body = await request.json()
    const { action } = body

    if (!action || !['water', 'feed', 'play'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Check if user has access to this plant
    const { data: plant, error: plantError } = await supabase
      .from('plants')
      .select(`
        *,
        plant_members!inner(user_id)
      `)
      .eq('id', plantId)
      .or(`owner_id.eq.${user.id},plant_members.user_id.eq.${user.id}`)
      .single()

    if (plantError || !plant) {
      return NextResponse.json({ error: 'Plant not found or access denied' }, { status: 404 })
    }

    // Calculate new plant stats based on action
    let updates: any = {}
    const now = new Date().toISOString()

    switch (action) {
      case 'water':
        updates = {
          last_watered: now,
          health: Math.min(100, plant.health + 15),
          happiness: Math.min(100, plant.happiness + 5)
        }
        break
      case 'feed':
        updates = {
          last_fed: now,
          health: Math.min(100, plant.health + 10),
          growth: Math.min(100, plant.growth + 5)
        }
        break
      case 'play':
        updates = {
          last_played: now,
          happiness: Math.min(100, plant.happiness + 20),
          health: Math.min(100, plant.health + 5)
        }
        break
    }

    // Update plant
    const { data: updatedPlant, error: updateError } = await supabase
      .from('plants')
      .update(updates)
      .eq('id', plantId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating plant:', updateError)
      return NextResponse.json({ error: 'Failed to update plant' }, { status: 500 })
    }

    // Record the care action
    const { error: actionError } = await supabase
      .from('care_actions')
      .insert({
        plant_id: plantId,
        user_id: user.id,
        action
      })

    if (actionError) {
      console.error('Error recording care action:', actionError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ plant: updatedPlant })
  } catch (error) {
    console.error('Error in POST /api/plants/[id]/care:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
