"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Plant {
  id: string
  name: string
  health: number
  happiness: number
  growth: number
  stage: 'seedling' | 'growing' | 'mature' | 'blooming'
  mood: 'happy' | 'sad' | 'excited' | 'sleepy'
  last_watered: string
  last_fed: string
  last_played: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface CreatePlantData {
  name?: string
}

export interface UpdatePlantData {
  name?: string
  health?: number
  happiness?: number
  growth?: number
  stage?: 'seedling' | 'growing' | 'mature' | 'blooming'
  mood?: 'happy' | 'sad' | 'excited' | 'sleepy'
}

export function usePlants() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [currentPlant, setCurrentPlant] = useState<Plant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load plants from localStorage on mount
  useEffect(() => {
    const savedPlants = localStorage.getItem('plants')
    if (savedPlants) {
      try {
        const parsedPlants = JSON.parse(savedPlants)
        setPlants(parsedPlants)
        if (parsedPlants.length > 0 && !currentPlant) {
          setCurrentPlant(parsedPlants[0])
        }
      } catch (error) {
        console.error('Error parsing saved plants:', error)
      }
    }
  }, [])

  // Save plants to localStorage whenever plants change (but not on initial load)
  useEffect(() => {
    if (plants.length > 0) {
      localStorage.setItem('plants', JSON.stringify(plants))
    }
  }, [plants])

  // Fetch all plants for the current user
  const fetchPlants = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: HeadersInit = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('/api/plants', { headers })
      if (!response.ok) {
        throw new Error('Failed to fetch plants')
      }

      const data = await response.json()
      setPlants(data.plants || [])
      
      // Set the first plant as current if none is selected
      if (data.plants && data.plants.length > 0 && !currentPlant) {
        setCurrentPlant(data.plants[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching plants:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch a specific plant
  const fetchPlant = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/plants/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch plant')
      }

      const data = await response.json()
      setCurrentPlant(data.plant)
      return data.plant
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching plant:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Create a new plant
  const createPlant = async (plantData: CreatePlantData) => {
    try {
      setError(null)

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('/api/plants', {
        method: 'POST',
        headers,
        body: JSON.stringify(plantData),
      })

      if (!response.ok) {
        throw new Error('Failed to create plant')
      }

      const data = await response.json()
      const newPlant = data.plant

      setPlants(prev => [...prev, newPlant])
      setCurrentPlant(newPlant)
      
      return newPlant
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error creating plant:', err)
      return null
    }
  }

  // Update a plant
  const updatePlant = async (id: string, plantData: UpdatePlantData) => {
    try {
      setError(null)

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/plants/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(plantData),
      })

      if (!response.ok) {
        throw new Error('Failed to update plant')
      }

      const data = await response.json()
      const updatedPlant = data.plant

      setPlants(prev => prev.map(plant => 
        plant.id === id ? updatedPlant : plant
      ))
      
      if (currentPlant?.id === id) {
        setCurrentPlant(updatedPlant)
      }

      return updatedPlant
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error updating plant:', err)
      return null
    }
  }

  // Delete a plant
  const deletePlant = async (id: string) => {
    try {
      setError(null)

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: HeadersInit = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/plants/${id}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        throw new Error('Failed to delete plant')
      }

      setPlants(prev => prev.filter(plant => plant.id !== id))
      
      if (currentPlant?.id === id) {
        setCurrentPlant(plants.length > 1 ? plants.find(p => p.id !== id) || null : null)
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error deleting plant:', err)
      return false
    }
  }

  // Perform care action on a plant
  const performCareAction = async (plantId: string, action: 'water' | 'feed' | 'play') => {
    try {
      setError(null)

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/plants/${plantId}/care`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ actionType: action }),
      })

      if (!response.ok) {
        throw new Error('Failed to perform care action')
      }

      const data = await response.json()
      const updatedPlant = data.plant

      setPlants(prev => prev.map(plant => 
        plant.id === plantId ? updatedPlant : plant
      ))
      
      if (currentPlant?.id === plantId) {
        setCurrentPlant(updatedPlant)
      }

      return updatedPlant
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error performing care action:', err)
      return null
    }
  }

  // Load plants on mount
  useEffect(() => {
    fetchPlants()
  }, [])

  return {
    plants,
    currentPlant,
    loading,
    error,
    fetchPlants,
    fetchPlant,
    createPlant,
    updatePlant,
    deletePlant,
    performCareAction,
    setCurrentPlant,
  }
}
