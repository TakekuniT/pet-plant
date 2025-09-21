"use client"

import { useState, useEffect } from "react"
import { Sprout, Heart, Droplets, Zap, Moon, LogOut, Settings, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Auth from "./components/Auth"
import SproutyMonster from "./components/SproutyMonster"
import CarePanel from "./components/CarePanel"
import CareHistory from "./components/CareHistory"
import CareTeam from "./components/CareTeam"
import PlantManager from "./components/PlantManager"
import { usePlants, Plant } from "@/hooks/usePlants"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showPlantManager, setShowPlantManager] = useState(false)
  const { 
    plants, 
    currentPlant, 
    createPlant, 
    updatePlant, 
    deletePlant, 
    setCurrentPlant, 
    performCareAction, 
    loading: plantsLoading, 
    error: plantsError 
  } = usePlants()


  // Check authentication status
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Convert Plant to the format expected by components
  const getPlantData = () => {
    if (!currentPlant) {
      return {
        id: null,
        name: "No Plant Selected",
        health: 80,
        happiness: 75,
        growth: 25,
        lastWatered: Date.now() - 2 * 60 * 60 * 1000,
        lastFed: Date.now() - 4 * 60 * 60 * 1000,
        lastPlayed: Date.now() - 1 * 60 * 60 * 1000,
        stage: "seedling",
        mood: "happy"
      }
    }

    return {
      id: currentPlant.id,
      name: currentPlant.name,
      health: currentPlant.health,
      happiness: currentPlant.happiness,
      growth: currentPlant.growth,
      lastWatered: new Date(currentPlant.last_watered).getTime(),
      lastFed: new Date(currentPlant.last_fed).getTime(),
      lastPlayed: new Date(currentPlant.last_played).getTime(),
      stage: currentPlant.stage,
      mood: currentPlant.mood
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // Simulate plant needs over time - ALWAYS call this hook
  useEffect(() => {
    if (!currentPlant) return

    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceWatered = now - new Date(currentPlant.last_watered).getTime()
      const timeSinceFed = now - new Date(currentPlant.last_fed).getTime()
      const timeSincePlayed = now - new Date(currentPlant.last_played).getTime()

      let newHealth = currentPlant.health
      let newHappiness = currentPlant.happiness
      let newMood = currentPlant.mood

      // Health decreases over time without care
      if (timeSinceWatered > 6 * 60 * 60 * 1000) { // 6 hours
        newHealth = Math.max(0, currentPlant.health - 1)
      }
      if (timeSinceFed > 8 * 60 * 60 * 1000) { // 8 hours
        newHealth = Math.max(0, currentPlant.health - 1)
      }

      // Happiness decreases without play
      if (timeSincePlayed > 4 * 60 * 60 * 1000) { // 4 hours
        newHappiness = Math.max(0, currentPlant.happiness - 2)
      }

      // Update mood based on health and happiness
      if (newHealth > 80 && newHappiness > 80) {
        newMood = "happy"
      } else if (newHealth < 30 || newHappiness < 30) {
        newMood = "sad"
      } else if (newHappiness > 70) {
        newMood = "excited"
      } else {
        newMood = "sleepy"
      }

      // Update plant if stats changed
      if (newHealth !== currentPlant.health || newHappiness !== currentPlant.happiness || newMood !== currentPlant.mood) {
        updatePlant(currentPlant.id, {
          health: newHealth,
          happiness: newHappiness,
          mood: newMood as any
        })
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [currentPlant, updatePlant])

  // Show auth screen if not logged in - AFTER all hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Sprout className="w-12 h-12 text-green-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  const handleCare = async (action: string) => {
    if (!currentPlant) return

    // Use the new CRUD operation
    await performCareAction(currentPlant.id, action as 'water' | 'feed' | 'play')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sprout className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Plant Monster Pet</h1>
                <p className="text-sm text-gray-600">Keep your virtual pet alive with friends!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{getPlantData().name}</p>
                <p className="text-xs text-gray-500">Level {Math.floor(getPlantData().growth / 20) + 1}</p>
              </div>
              <button
                onClick={() => setShowPlantManager(!showPlantManager)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Manage Plants</span>
              </button>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showPlantManager ? (
          /* Plant Manager View */
          <div className="max-w-4xl mx-auto">
            <PlantManager 
              plants={plants}
              currentPlant={currentPlant}
              createPlant={createPlant}
              updatePlant={updatePlant}
              deletePlant={deletePlant}
              setCurrentPlant={setCurrentPlant}
              loading={plantsLoading}
              error={plantsError}
              onPlantSelect={(plant) => setShowPlantManager(false)} 
            />
          </div>
        ) : (
          /* Main Plant Care View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Plant Monster Area */}
            <div className="lg:col-span-2">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                {!currentPlant ? (
                  /* No Plant Selected */
                  <div className="text-center py-12">
                    <Sprout className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Plant Selected</h2>
                    <p className="text-gray-600 mb-6">Create your first plant monster to get started!</p>
                    <button
                      onClick={() => setShowPlantManager(true)}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create Your First Plant</span>
                    </button>
                  </div>
                ) : (
                  /* Plant Care Interface */
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center justify-center space-x-2">
                        <Sprout className="w-6 h-6 text-green-600" />
                        <span>Meet {getPlantData().name}!</span>
                      </h2>
                      <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <div className="w-5 h-5">
                          {getPlantData().mood === "happy" && <Heart className="w-5 h-5 text-green-500" />}
                          {getPlantData().mood === "sad" && <Droplets className="w-5 h-5 text-blue-400" />}
                          {getPlantData().mood === "excited" && <Zap className="w-5 h-5 text-yellow-500" />}
                          {getPlantData().mood === "sleepy" && <Moon className="w-5 h-5 text-purple-400" />}
                        </div>
                        <span>
                          {getPlantData().mood === "happy" && "I'm feeling great! Thanks for taking care of me!"}
                          {getPlantData().mood === "sad" && "I'm not feeling well... I need some love!"}
                          {getPlantData().mood === "excited" && "I'm so excited! Let's play together!"}
                          {getPlantData().mood === "sleepy" && "I'm feeling a bit tired... maybe some rest?"}
                        </span>
                      </div>
                    </div>
                    
                    <SproutyMonster plantData={getPlantData()} />
                    
                    <CarePanel plantData={getPlantData()} onCare={handleCare} />
                  </>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Care Team */}
              {currentPlant && (
                <CareTeam plantId={currentPlant.id} currentUserId={user?.id} />
              )}
              
              {/* Care History */}
              {currentPlant && (
                <CareHistory plantId={currentPlant.id} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
