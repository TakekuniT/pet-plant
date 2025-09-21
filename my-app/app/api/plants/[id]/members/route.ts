import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/plants/[id]/members - Get all members of a plant
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const plantId = params.id

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

    // Get all members
    const { data: members, error: membersError } = await supabase
      .from('plant_members')
      .select(`
        *,
        users!inner(id, name, email, avatar_url)
      `)
      .eq('plant_id', plantId)

    if (membersError) {
      console.error('Error fetching members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error in GET /api/plants/[id]/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/plants/[id]/members - Add a member to a plant
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
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user is the owner of this plant
    const { data: plant, error: plantError } = await supabase
      .from('plants')
      .select('*')
      .eq('id', plantId)
      .eq('owner_id', user.id)
      .single()

    if (plantError || !plant) {
      return NextResponse.json({ error: 'Plant not found or you are not the owner' }, { status: 404 })
    }

    // Find user by email
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('plant_members')
      .select('id')
      .eq('plant_id', plantId)
      .eq('user_id', targetUser.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 })
    }

    // Add member
    const { data: member, error: memberError } = await supabase
      .from('plant_members')
      .insert({
        plant_id: plantId,
        user_id: targetUser.id,
        role: 'member'
      })
      .select(`
        *,
        users!inner(id, name, email, avatar_url)
      `)
      .single()

    if (memberError) {
      console.error('Error adding member:', memberError)
      return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Error in POST /api/plants/[id]/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
