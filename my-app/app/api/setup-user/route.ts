import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Setting up user profile for:', user.id, user.email)

    // Check if user profile already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existingUser) {
      console.log('User profile already exists')
      return NextResponse.json({ message: 'User profile already exists', user: existingUser })
    }

    // Create user profile
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating user profile:', createError)
      return NextResponse.json({ error: 'Failed to create user profile', details: createError }, { status: 500 })
    }

    console.log('User profile created successfully:', newUser)
    return NextResponse.json({ message: 'User profile created successfully', user: newUser })

  } catch (error) {
    console.error('Error in setup-user:', error)
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
}
