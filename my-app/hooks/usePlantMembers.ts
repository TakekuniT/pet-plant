import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface PlantMember {
  id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  users: {
    id: string
    name: string
    email: string
  }
}

export interface CareAction {
  id: string
  action: 'water' | 'feed' | 'play'
  created_at: string
  users: {
    id: string
    name: string
    email: string
  }
}

export function usePlantMembers(plantId: string | null) {
  const [members, setMembers] = useState<PlantMember[]>([])
  const [careHistory, setCareHistory] = useState<CareAction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch plant members
  const fetchMembers = async () => {
    if (!plantId) return

    try {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: HeadersInit = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/plants/${plantId}/members`, { headers })
      if (!response.ok) {
        throw new Error('Failed to fetch plant members')
      }

      const data = await response.json()
      setMembers(data.members || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching plant members:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch care history
  const fetchCareHistory = async () => {
    if (!plantId) return

    try {
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: HeadersInit = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/plants/${plantId}/care-history`, { headers })
      if (!response.ok) {
        throw new Error('Failed to fetch care history')
      }

      const data = await response.json()
      setCareHistory(data.careHistory || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching care history:', err)
    }
  }

  // Add a member to the plant
  const addMember = async (email: string, role: 'admin' | 'member' = 'member') => {
    if (!plantId) return null

    try {
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/plants/${plantId}/members`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, role }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add member')
      }

      const data = await response.json()
      await fetchMembers() // Refresh members list
      return data.member
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error adding member:', err)
      return null
    }
  }

  // Remove a member from the plant
  const removeMember = async (userId: string) => {
    if (!plantId) return false

    try {
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: HeadersInit = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/plants/${plantId}/members/${userId}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove member')
      }

      await fetchMembers() // Refresh members list
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error removing member:', err)
      return false
    }
  }

  // Update member role
  const updateMemberRole = async (userId: string, role: 'admin' | 'member') => {
    if (!plantId) return null

    try {
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/plants/${plantId}/members/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update member role')
      }

      const data = await response.json()
      await fetchMembers() // Refresh members list
      return data.member
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error updating member role:', err)
      return null
    }
  }

  // Join a plant
  const joinPlant = async (plantId: string, role: 'admin' | 'member' = 'member') => {
    try {
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('/api/plants/join', {
        method: 'POST',
        headers,
        body: JSON.stringify({ plantId, role }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to join plant')
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error joining plant:', err)
      return null
    }
  }

  // Fetch data when plantId changes
  useEffect(() => {
    if (plantId) {
      fetchMembers()
      fetchCareHistory()
    } else {
      setMembers([])
      setCareHistory([])
    }
  }, [plantId])

  return {
    members,
    careHistory,
    loading,
    error,
    addMember,
    removeMember,
    updateMemberRole,
    joinPlant,
    fetchMembers,
    fetchCareHistory
  }
}
