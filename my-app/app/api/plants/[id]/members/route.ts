import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// GET /api/plants/[id]/members - Get all members of a plant
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

    // Check if user has access to this plant
    const { data: member, error: memberError } = await supabase
      .from('plant_members')
      .select('id')
      .eq('plant_id', plantId)
      .eq('user_id', user.id)
      .single()

    if (memberError) {
      return NextResponse.json({ error: 'Access denied to this plant' }, { status: 403 })
    }

    // Get all members with user details
    const { data: members, error: membersError } = await supabase
      .from('plant_members')
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
      .eq('plant_id', plantId)
      .order('joined_at', { ascending: true })

    if (membersError) {
      console.error('Error fetching plant members:', membersError)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient()
    const { id: plantId } = await params
    const body = await request.json()
    const { email, role = 'member' } = body

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

    // Check if user is owner or admin of this plant
    const { data: currentMember, error: memberError } = await supabase
      .from('plant_members')
      .select('role')
      .eq('plant_id', plantId)
      .eq('user_id', user.id)
      .single()

    if (memberError || !['owner', 'admin'].includes(currentMember?.role)) {
      return NextResponse.json({ error: 'Only owners and admins can add members' }, { status: 403 })
    }

    // Find user by email
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is already a member
    const { data: existingMember, error: existingError } = await supabase
      .from('plant_members')
      .select('id')
      .eq('plant_id', plantId)
      .eq('user_id', targetUser.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member of this plant' }, { status: 400 })
    }

    // Add the member
    const { data: newMember, error: addError } = await supabase
      .from('plant_members')
      .insert({
        plant_id: plantId,
        user_id: targetUser.id,
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
      console.error('Error adding plant member:', addError)
      return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
    }

    return NextResponse.json({ member: newMember })
  } catch (error) {
    console.error('Error in POST /api/plants/[id]/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}