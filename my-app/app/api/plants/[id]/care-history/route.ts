import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// GET /api/plants/[id]/care-history - Get care history for a plant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient()
    const { id: plantId } = await params

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

    // Check if user has access to this plant (owner or member)
    const { data: plant, error: plantError } = await supabase
      .from('plants')
      .select('owner_id')
      .eq('id', plantId)
      .single()

    if (plantError || !plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
    }

    // Check if user is owner or member
    const { data: member } = await supabase
      .from('plant_members')
      .select('id')
      .eq('plant_id', plantId)
      .eq('user_id', user.id)
      .single()

    if (plant.owner_id !== user.id && !member) {
      return NextResponse.json({ error: 'Access denied to this plant' }, { status: 403 })
    }

    // Get care history with user details
    const { data: careHistory, error: historyError } = await supabase
      .from('care_actions')
      .select(`
        id,
        action,
        created_at,
        users (
          id,
          name,
          email
        )
      `)
      .eq('plant_id', plantId)
      .order('created_at', { ascending: false })
      .limit(50) // Limit to last 50 actions

    if (historyError) {
      console.error('Error fetching care history:', historyError)
      return NextResponse.json({ error: 'Failed to fetch care history' }, { status: 500 })
    }

    return NextResponse.json({ careHistory })
  } catch (error) {
    console.error('Error in GET /api/plants/[id]/care-history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
