import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// PUT /api/plants/[id]/members/[userId] - Update member role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, userId: string }> }
) {
  try {
    const supabase = createClient()
    const { id: plantId, userId } = await params
    const body = await request.json()
    const { role } = body

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

    // Check if user is owner of this plant
    const { data: currentMember, error: memberError } = await supabase
      .from('plant_members')
      .select('role')
      .eq('plant_id', plantId)
      .eq('user_id', user.id)
      .single()

    if (memberError || currentMember?.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can change member roles' }, { status: 403 })
    }

    // Prevent changing owner role
    if (role === 'owner') {
      return NextResponse.json({ error: 'Cannot change role to owner' }, { status: 400 })
    }

    // Update the member role
    const { data: updatedMember, error: updateError } = await supabase
      .from('plant_members')
      .update({ role })
      .eq('plant_id', plantId)
      .eq('user_id', userId)
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

    if (updateError) {
      console.error('Error updating member role:', updateError)
      return NextResponse.json({ error: 'Failed to update member role' }, { status: 500 })
    }

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('Error in PUT /api/plants/[id]/members/[userId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/plants/[id]/members/[userId] - Remove a member from a plant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, userId: string }> }
) {
  try {
    const supabase = createClient()
    const { id: plantId, userId } = await params

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

    // Check if user is owner or admin, or if they're removing themselves
    const { data: currentMember, error: memberError } = await supabase
      .from('plant_members')
      .select('role')
      .eq('plant_id', plantId)
      .eq('user_id', user.id)
      .single()

    if (memberError) {
      return NextResponse.json({ error: 'Access denied to this plant' }, { status: 403 })
    }

    const isOwner = currentMember?.role === 'owner'
    const isAdmin = currentMember?.role === 'admin'
    const isRemovingSelf = user.id === userId

    if (!isOwner && !isAdmin && !isRemovingSelf) {
      return NextResponse.json({ error: 'Insufficient permissions to remove this member' }, { status: 403 })
    }

    // Prevent owner from removing themselves if they're the only owner
    if (isOwner && isRemovingSelf) {
      const { data: owners, error: ownersError } = await supabase
        .from('plant_members')
        .select('id')
        .eq('plant_id', plantId)
        .eq('role', 'owner')

      if (ownersError || owners.length <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last owner' }, { status: 400 })
      }
    }

    // Remove the member
    const { error: deleteError } = await supabase
      .from('plant_members')
      .delete()
      .eq('plant_id', plantId)
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Error removing plant member:', deleteError)
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/plants/[id]/members/[userId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
