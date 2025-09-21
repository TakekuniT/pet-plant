"use client"

import { useState, useEffect } from "react"
import { Sprout, TreePine, Flower2, Droplets, Heart, Zap, Moon } from "lucide-react"

interface PlantData {
  name: string
  health: number
  happiness: number
  growth: number
  stage: string
  mood: string
}

interface PlantMonsterProps {
  plantData: PlantData
}

export default function PlantMonster({ plantData }: PlantMonsterProps) {
  const [animation, setAnimation] = useState("idle")
  const [isGlowing, setIsGlowing] = useState(false)

  // Trigger animations based on mood
  useEffect(() => {
    if (plantData.mood === "excited") {
      setAnimation("bounce")
      setTimeout(() => setAnimation("idle"), 2000)
    } else if (plantData.mood === "sad") {
      setAnimation("droop")
    } else if (plantData.mood === "sleepy") {
      setAnimation("sleep")
    } else {
      setAnimation("idle")
    }
  }, [plantData.mood])

  // Glow effect when health is high
  useEffect(() => {
    setIsGlowing(plantData.health > 80)
  }, [plantData.health])

  const getPlantIcon = () => {
    const iconClass = `w-24 h-24 transition-all duration-500 ${
      plantData.mood === "sad" ? "text-gray-500" : 
      plantData.mood === "excited" ? "text-green-500" : 
      "text-green-600"
    }`
    
    if (plantData.stage === "seedling") {
      return <Sprout className={iconClass} />
    } else if (plantData.stage === "growing") {
      return <TreePine className={iconClass} />
    } else if (plantData.stage === "mature") {
      return <TreePine className={iconClass} />
    } else {
      return <Flower2 className={iconClass} />
    }
  }

  const getPlantSize = () => {
    const baseSize = 120
    const growthMultiplier = 1 + (plantData.growth / 100) * 0.5
    return baseSize * growthMultiplier
  }

  const getHealthColor = () => {
    if (plantData.health > 70) return "text-green-500"
    if (plantData.health > 40) return "text-yellow-500"
    return "text-red-500"
  }

  const getHappinessColor = () => {
    if (plantData.happiness > 70) return "text-blue-500"
    if (plantData.happiness > 40) return "text-purple-500"
    return "text-gray-500"
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Plant Monster Visual */}
      <div className="relative">
        <div
          className={`transition-all duration-500 ${
            isGlowing ? "drop-shadow-2xl" : "drop-shadow-lg"
          }`}
          style={{
            filter: isGlowing ? "drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))" : "none"
          }}
        >
          <div
            className={`transform transition-all duration-300 ${
              animation === "bounce" ? "animate-bounce" : ""
            } ${animation === "droop" ? "rotate-12" : ""} ${
              animation === "sleep" ? "opacity-70" : ""
            }`}
          >
            {getPlantIcon()}
          </div>
        </div>
        
        {/* Floating hearts when happy */}
        {plantData.mood === "happy" && (
          <div className="absolute -top-4 -right-4 animate-pulse">
            <Heart className="w-6 h-6 text-green-500" />
          </div>
        )}
        
        {/* Sad tears when sad */}
        {plantData.mood === "sad" && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <Droplets className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* Stats Bars */}
      <div className="w-full max-w-md space-y-3">
        {/* Health Bar */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700 w-16">Health</span>
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                plantData.health > 70
                  ? "bg-green-500"
                  : plantData.health > 40
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${plantData.health}%` }}
            />
          </div>
          <span className={`text-sm font-bold ${getHealthColor()}`}>
            {plantData.health}%
          </span>
        </div>

        {/* Happiness Bar */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700 w-16">Happy</span>
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                plantData.happiness > 70
                  ? "bg-blue-500"
                  : plantData.happiness > 40
                  ? "bg-purple-500"
                  : "bg-gray-500"
              }`}
              style={{ width: `${plantData.happiness}%` }}
            />
          </div>
          <span className={`text-sm font-bold ${getHappinessColor()}`}>
            {plantData.happiness}%
          </span>
        </div>

        {/* Growth Bar */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700 w-16">Growth</span>
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
              style={{ width: `${plantData.growth}%` }}
            />
          </div>
          <span className="text-sm font-bold text-green-600">
            {plantData.growth}%
          </span>
        </div>
      </div>

      {/* Mood Indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-1">Current Mood</p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-6 h-6">
            {plantData.mood === "happy" && <Heart className="w-6 h-6 text-green-500" />}
            {plantData.mood === "sad" && <Droplets className="w-6 h-6 text-blue-400" />}
            {plantData.mood === "excited" && <Zap className="w-6 h-6 text-yellow-500" />}
            {plantData.mood === "sleepy" && <Moon className="w-6 h-6 text-purple-400" />}
          </div>
          <span className="text-sm font-medium text-gray-700 capitalize">
            {plantData.mood}
          </span>
        </div>
      </div>
    </div>
  )
}
