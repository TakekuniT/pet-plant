"use client"

import { useState, useEffect } from "react"
import { Sprout, Users, History, Heart, Droplets, Zap, Moon } from "lucide-react"
import SproutyMonster from "./components/SproutyMonster"
import CarePanel from "./components/CarePanel"
import FriendsList from "./components/FriendsList"
import CareHistory from "./components/CareHistory"

export default function Home() {
  const [plantData, setPlantData] = useState({
    name: "Sprouty",
    health: 80,
    happiness: 75,
    growth: 25,
    lastWatered: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    lastFed: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
    lastPlayed: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
    stage: "seedling", // seedling, growing, mature, blooming
    mood: "happy" // happy, sad, excited, sleepy
  })

  const [friends] = useState([
    { id: 1, name: "Sarah", avatar: "user1", lastCare: "2 hours ago" },
    { id: 2, name: "Mike", avatar: "user2", lastCare: "1 hour ago" },
    { id: 3, name: "Emma", avatar: "user3", lastCare: "30 min ago" }
  ])

  const [careHistory, setCareHistory] = useState([
    { id: 1, friend: "Emma", action: "watered", time: "30 min ago", emoji: "water" },
    { id: 2, friend: "Mike", action: "fed", time: "1 hour ago", emoji: "feed" },
    { id: 3, friend: "Sarah", action: "played", time: "2 hours ago", emoji: "play" },
    { id: 4, friend: "You", action: "watered", time: "3 hours ago", emoji: "water" }
  ])

  // Simulate plant needs over time
  useEffect(() => {
    const interval = setInterval(() => {
      setPlantData(prev => {
        const now = Date.now()
        const timeSinceWatered = now - prev.lastWatered
        const timeSinceFed = now - prev.lastFed
        const timeSincePlayed = now - prev.lastPlayed

        let newHealth = prev.health
        let newHappiness = prev.happiness
        let newMood = prev.mood

        // Health decreases over time without care
        if (timeSinceWatered > 6 * 60 * 60 * 1000) { // 6 hours
          newHealth = Math.max(0, prev.health - 1)
        }
        if (timeSinceFed > 8 * 60 * 60 * 1000) { // 8 hours
          newHealth = Math.max(0, prev.health - 1)
        }

        // Happiness decreases without play
        if (timeSincePlayed > 4 * 60 * 60 * 1000) { // 4 hours
          newHappiness = Math.max(0, prev.happiness - 2)
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

        return {
          ...prev,
          health: newHealth,
          happiness: newHappiness,
          mood: newMood
        }
      })
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleCare = (action: string) => {
    const now = Date.now()
    const newHistoryEntry = {
      id: careHistory.length + 1,
      friend: "You",
      action: action,
      time: "just now",
      emoji: action
    }

    setCareHistory(prev => [newHistoryEntry, ...prev.slice(0, 9)]) // Keep last 10 entries

    setPlantData(prev => {
      let updates: any = {}
      
      if (action === "water") {
        updates = {
          lastWatered: now,
          health: Math.min(100, prev.health + 15),
          happiness: Math.min(100, prev.happiness + 5)
        }
      } else if (action === "feed") {
        updates = {
          lastFed: now,
          health: Math.min(100, prev.health + 10),
          growth: Math.min(100, prev.growth + 5)
        }
      } else if (action === "play") {
        updates = {
          lastPlayed: now,
          happiness: Math.min(100, prev.happiness + 20),
          health: Math.min(100, prev.health + 5)
        }
      }

      return { ...prev, ...updates }
    })
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
                <p className="text-sm font-medium text-gray-900">{plantData.name}</p>
                <p className="text-xs text-gray-500">Level {Math.floor(plantData.growth / 20) + 1}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Plant Monster Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center justify-center space-x-2">
                  <Sprout className="w-6 h-6 text-green-600" />
                  <span>Meet {plantData.name}!</span>
                </h2>
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <div className="w-5 h-5">
                    {plantData.mood === "happy" && <Heart className="w-5 h-5 text-green-500" />}
                    {plantData.mood === "sad" && <Droplets className="w-5 h-5 text-blue-400" />}
                    {plantData.mood === "excited" && <Zap className="w-5 h-5 text-yellow-500" />}
                    {plantData.mood === "sleepy" && <Moon className="w-5 h-5 text-purple-400" />}
                  </div>
                  <span>
                    {plantData.mood === "happy" && "I'm feeling great! Thanks for taking care of me!"}
                    {plantData.mood === "sad" && "I'm not feeling well... I need some love!"}
                    {plantData.mood === "excited" && "I'm so excited! Let's play together!"}
                    {plantData.mood === "sleepy" && "I'm feeling a bit tired... maybe some rest?"}
                  </span>
                </div>
              </div>
              
              <SproutyMonster plantData={plantData} />
              
              <CarePanel plantData={plantData} onCare={handleCare} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Friends List */}
            <FriendsList friends={friends} />
            
            {/* Care History */}
            <CareHistory history={careHistory} />
          </div>
        </div>
      </main>
    </div>
  )
}
