"use client"

import { useState, useEffect } from "react"
import { Heart, Droplets, Zap, Moon } from "lucide-react"

interface PlantData {
  name: string
  health: number
  happiness: number
  growth: number
  stage: string
  mood: string
}

interface SproutyMonsterProps {
  plantData: PlantData
}

export default function SproutyMonster({ plantData }: SproutyMonsterProps) {
  const [animation, setAnimation] = useState("idle")
  const [isGlowing, setIsGlowing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [showMessage, setShowMessage] = useState(false)

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

  // Handle click animation
  const handleClick = () => {
    setIsClicked(true)
    setShowMessage(true)
    setTimeout(() => setIsClicked(false), 200)
    setTimeout(() => setShowMessage(false), 1500)
  }

  const getPlantSize = () => {
    const baseSize = 120
    const growthMultiplier = 1 + (plantData.growth / 100) * 0.5
    return baseSize * growthMultiplier
  }

  const getMoodColor = () => {
    switch (plantData.mood) {
      case "happy":
        return "#10b981" // emerald-500
      case "sad":
        return "#6b7280" // gray-500
      case "excited":
        return "#f59e0b" // amber-500
      case "sleepy":
        return "#8b5cf6" // violet-500
      default:
        return "#10b981"
    }
  }

  const getStageHeight = () => {
    switch (plantData.stage) {
      case "seedling":
        return 60
      case "growing":
        return 80
      case "mature":
        return 100
      case "blooming":
        return 120
      default:
        return 60
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Sprouty Monster Visual */}
      <div className="relative">
        <div
          className={`transition-all duration-500 cursor-pointer ${
            isGlowing ? "drop-shadow-2xl" : "drop-shadow-lg"
          }`}
          style={{
            filter: isGlowing ? "drop-shadow(0 0 20px rgba(16, 185, 129, 0.5))" : "none"
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
        >
          <div
            className={`transform transition-all duration-300 ${
              animation === "bounce" ? "animate-bounce" : ""
            } ${animation === "droop" ? "rotate-12" : ""} ${
              animation === "sleep" ? "opacity-70" : ""
            } ${isHovered ? "scale-110" : ""} ${
              isClicked ? "scale-95 -translate-y-4" : ""
            }`}
          >
            <svg
              width={getPlantSize()}
              height={getPlantSize()}
              viewBox="0 0 120 120"
              className="transition-all duration-500"
            >
              {/* Cute Blob Body */}
              <ellipse
                cx="60"
                cy="75"
                rx="35"
                ry="25"
                fill={getMoodColor()}
                className="transition-all duration-500"
              />
              
              {/* Blob shadow for depth */}
              <ellipse
                cx="60"
                cy="78"
                rx="32"
                ry="20"
                fill="rgba(0,0,0,0.1)"
                className="transition-all duration-500"
              />
              
              {/* Sprout on head based on growth stage */}
              {plantData.stage === "seedling" && (
                <>
                  {/* Tiny sprout with 2 small leaves */}
                  <ellipse
                    cx="60"
                    cy="45"
                    rx="2"
                    ry="6"
                    fill="#22c55e"
                    className="transition-all duration-500"
                  />
                  {/* Two small leaves */}
                  <ellipse
                    cx="55"
                    cy="42"
                    rx="3"
                    ry="8"
                    fill="#16a34a"
                    transform="rotate(-25 55 42)"
                    className="transition-all duration-500"
                  />
                  <ellipse
                    cx="65"
                    cy="42"
                    rx="3"
                    ry="8"
                    fill="#16a34a"
                    transform="rotate(25 65 42)"
                    className="transition-all duration-500"
                  />
                </>
              )}
              
              {plantData.stage === "growing" && (
                <>
                  {/* Growing sprout with 2 prominent leaves */}
                  <ellipse
                    cx="60"
                    cy="40"
                    rx="3"
                    ry="8"
                    fill="#22c55e"
                    className="transition-all duration-500"
                  />
                  {/* Two prominent leaves */}
                  <ellipse
                    cx="52"
                    cy="35"
                    rx="4"
                    ry="12"
                    fill="#16a34a"
                    transform="rotate(-30 52 35)"
                    className="transition-all duration-500"
                  />
                  <ellipse
                    cx="68"
                    cy="35"
                    rx="4"
                    ry="12"
                    fill="#16a34a"
                    transform="rotate(30 68 35)"
                    className="transition-all duration-500"
                  />
                  <ellipse
                    cx="60"
                    cy="30"
                    rx="2"
                    ry="6"
                    fill="#15803d"
                    className="transition-all duration-500"
                  />
                </>
              )}
              
              {plantData.stage === "mature" && (
                <>
                  {/* Mature sprout with 2 big leaves */}
                  <ellipse
                    cx="60"
                    cy="35"
                    rx="4"
                    ry="10"
                    fill="#22c55e"
                    className="transition-all duration-500"
                  />
                  {/* Two big prominent leaves */}
                  <ellipse
                    cx="48"
                    cy="28"
                    rx="6"
                    ry="15"
                    fill="#16a34a"
                    transform="rotate(-35 48 28)"
                    className="transition-all duration-500"
                  />
                  <ellipse
                    cx="72"
                    cy="28"
                    rx="6"
                    ry="15"
                    fill="#16a34a"
                    transform="rotate(35 72 28)"
                    className="transition-all duration-500"
                  />
                  <ellipse
                    cx="60"
                    cy="22"
                    rx="3"
                    ry="8"
                    fill="#15803d"
                    className="transition-all duration-500"
                  />
                  {/* Small center leaf */}
                  <ellipse
                    cx="60"
                    cy="18"
                    rx="2"
                    ry="6"
                    fill="#14532d"
                    className="transition-all duration-500"
                  />
                </>
              )}
              
              {plantData.stage === "blooming" && (
                <>
                  {/* Blooming sprout with 2 big leaves and flower */}
                  <ellipse
                    cx="60"
                    cy="30"
                    rx="5"
                    ry="12"
                    fill="#22c55e"
                    className="transition-all duration-500"
                  />
                  {/* Two big beautiful leaves */}
                  <ellipse
                    cx="45"
                    cy="22"
                    rx="8"
                    ry="18"
                    fill="#16a34a"
                    transform="rotate(-40 45 22)"
                    className="transition-all duration-500"
                  />
                  <ellipse
                    cx="75"
                    cy="22"
                    rx="8"
                    ry="18"
                    fill="#16a34a"
                    transform="rotate(40 75 22)"
                    className="transition-all duration-500"
                  />
                  <ellipse
                    cx="60"
                    cy="18"
                    rx="4"
                    ry="10"
                    fill="#15803d"
                    className="transition-all duration-500"
                  />
                  
                  {/* Flower on top */}
                  <circle
                    cx="60"
                    cy="8"
                    r="5"
                    fill="#fbbf24"
                    className="transition-all duration-500"
                  />
                  <circle
                    cx="56"
                    cy="10"
                    r="3"
                    fill="#f59e0b"
                    className="transition-all duration-500"
                  />
                  <circle
                    cx="64"
                    cy="10"
                    r="3"
                    fill="#f59e0b"
                    className="transition-all duration-500"
                  />
                  <circle
                    cx="60"
                    cy="12"
                    r="3"
                    fill="#f59e0b"
                    className="transition-all duration-500"
                  />
                  <circle
                    cx="60"
                    cy="5"
                    r="2"
                    fill="#fbbf24"
                    className="transition-all duration-500"
                  />
                </>
              )}
              
              {/* Cute Eyes - just black circles with white highlights */}
              <circle
                cx="52"
                cy="65"
                r="4"
                fill="#1f2937"
                className="transition-all duration-300"
              />
              <circle
                cx="68"
                cy="65"
                r="4"
                fill="#1f2937"
                className="transition-all duration-300"
              />
              
              {/* Eye highlights */}
              <circle
                cx="52.8"
                cy="64.2"
                r="1"
                fill="#ffffff"
                className="transition-all duration-300"
              />
              <circle
                cx="68.8"
                cy="64.2"
                r="1"
                fill="#ffffff"
                className="transition-all duration-300"
              />
              
              {/* Mouth based on mood */}
              {plantData.mood === "happy" && (
                <path
                  d="M 52 78 Q 60 85 68 78"
                  stroke="#1f2937"
                  strokeWidth="2"
                  fill="none"
                  className="transition-all duration-300"
                />
              )}
              
              {plantData.mood === "sad" && (
                <path
                  d="M 52 85 Q 60 78 68 85"
                  stroke="#1f2937"
                  strokeWidth="2"
                  fill="none"
                  className="transition-all duration-300"
                />
              )}
              
              {plantData.mood === "excited" && (
                <ellipse
                  cx="60"
                  cy="82"
                  rx="4"
                  ry="3"
                  fill="#1f2937"
                  className="transition-all duration-300"
                />
              )}
              
              {plantData.mood === "sleepy" && (
                <path
                  d="M 55 80 L 65 80"
                  stroke="#1f2937"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
              )}
              
              {/* Blob cheeks when happy */}
              {plantData.mood === "happy" && (
                <>
                  <circle cx="45" cy="70" r="3" fill="#fbbf24" className="transition-all duration-300" />
                  <circle cx="75" cy="70" r="3" fill="#fbbf24" className="transition-all duration-300" />
                </>
              )}
            </svg>
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
        
        {/* Click particles */}
        {isClicked && (
          <>
            <div className="absolute top-1/4 left-1/4 animate-ping">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
            <div className="absolute top-1/3 right-1/4 animate-ping" style={{ animationDelay: '0.1s' }}>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="absolute top-1/2 left-1/3 animate-ping" style={{ animationDelay: '0.2s' }}>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
            <div className="absolute top-2/3 right-1/3 animate-ping" style={{ animationDelay: '0.3s' }}>
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            </div>
          </>
        )}
        
        {/* Hover sparkles */}
        {isHovered && (
          <>
            <div className="absolute -top-2 left-1/4 animate-bounce">
              <div className="w-1 h-1 bg-yellow-300 rounded-full"></div>
            </div>
            <div className="absolute -top-1 right-1/3 animate-bounce" style={{ animationDelay: '0.2s' }}>
              <div className="w-1 h-1 bg-green-300 rounded-full"></div>
            </div>
            <div className="absolute -top-3 left-2/3 animate-bounce" style={{ animationDelay: '0.4s' }}>
              <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
            </div>
          </>
        )}
        
        {/* Click message */}
        {showMessage && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg animate-bounce">
            <p className="text-sm font-medium text-gray-800">
              {plantData.mood === "happy" && "Yay!"}
              {plantData.mood === "sad" && "Thanks for the love!"}
              {plantData.mood === "excited" && "Wheee!"}
              {plantData.mood === "sleepy" && "Zzz..."}
            </p>
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
          <span className={`text-sm font-bold ${
            plantData.health > 70 ? "text-green-500" : 
            plantData.health > 40 ? "text-yellow-500" : "text-red-500"
          }`}>
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
          <span className={`text-sm font-bold ${
            plantData.happiness > 70 ? "text-blue-500" : 
            plantData.happiness > 40 ? "text-purple-500" : "text-gray-500"
          }`}>
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
