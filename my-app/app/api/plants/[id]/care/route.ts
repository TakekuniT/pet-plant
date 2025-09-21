import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// POST /api/plants/[id]/care - Perform care action on a plant
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { actionType } = body

    if (!actionType || !['water', 'feed', 'play'].includes(actionType)) {
      return NextResponse.json({ error: 'Invalid action type' }, { status: 400 })
    }

    // Check if user has access to this plant
    const { data: plant, error: fetchError } = await supabase
      .from('plants')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
    }

    // Check if user is owner or member
    const { data: member } = await supabase
      .from('plant_members')
      .select('role')
      .eq('plant_id', id)
      .eq('user_id', user.id)
      .single()

    if (plant.owner_id !== user.id && !member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Calculate new plant stats based on action
    let updates: any = {}
    const now = new Date().toISOString()

    switch (actionType) {
      case 'water':
        updates.health = Math.min(100, plant.health + 15)
        updates.happiness = Math.min(100, plant.happiness + 5)
        updates.last_watered = now
        break
      case 'feed':
        updates.health = Math.min(100, plant.health + 10)
        updates.happiness = Math.min(100, plant.happiness + 10)
        updates.growth = Math.min(100, plant.growth + 5)
        updates.last_fed = now
        break
      case 'play':
        updates.happiness = Math.min(100, plant.happiness + 20)
        updates.health = Math.min(100, plant.health + 5)
        updates.last_played = now
        break
    }

    // Update mood based on happiness
    if (updates.happiness >= 80) {
      updates.mood = 'happy'
    } else if (updates.happiness >= 60) {
      updates.mood = 'excited'
    } else if (updates.happiness >= 40) {
      updates.mood = 'sleepy'
    } else {
      updates.mood = 'sad'
    }

    // Update growth stage based on growth
    if (updates.growth >= 80) {
      updates.stage = 'blooming'
    } else if (updates.growth >= 60) {
      updates.stage = 'mature'
    } else if (updates.growth >= 30) {
      updates.stage = 'growing'
    } else {
      updates.stage = 'seedling'
    }

    // Update the plant
    const { data: updatedPlant, error: updateError } = await supabase
      .from('plants')
      .update(updates)
      .eq('id', id)
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
        plant_id: id,
        user_id: user.id,
        action: actionType
      })

    if (actionError) {
      console.error('Error recording care action:', actionError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json(updatedPlant)
  } catch (error) {
    console.error('Error in POST /api/plants/[id]/care:', error)
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
}