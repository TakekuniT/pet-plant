"use client"

import { useState } from "react"
import { Droplets, Sprout, Gamepad2, CheckCircle, AlertTriangle, AlertCircle, Lightbulb } from "lucide-react"

interface PlantData {
  name: string
  health: number
  happiness: number
  growth: number
  lastWatered: number
  lastFed: number
  lastPlayed: number
  stage: string
  mood: string
}

interface CarePanelProps {
  plantData: PlantData
  onCare: (action: string) => void
}

export default function CarePanel({ plantData, onCare }: CarePanelProps) {
  const [isWatering, setIsWatering] = useState(false)
  const [isFeeding, setIsFeeding] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const getTimeSince = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`
    } else {
      return `${minutes}m ago`
    }
  }

  const handleCareAction = async (action: string) => {
    if (action === "water") {
      setIsWatering(true)
      setTimeout(() => setIsWatering(false), 1000)
    } else if (action === "feed") {
      setIsFeeding(true)
      setTimeout(() => setIsFeeding(false), 1000)
    } else if (action === "play") {
      setIsPlaying(true)
      setTimeout(() => setIsPlaying(false), 1000)
    }
    
    onCare(action)
  }

  const getCareStatus = (timestamp: number, threshold: number) => {
    const timeSince = Date.now() - timestamp
    const hoursSince = timeSince / (1000 * 60 * 60)
    
    if (hoursSince < threshold / 2) {
      return { status: "good", color: "text-green-600", bg: "bg-green-100" }
    } else if (hoursSince < threshold) {
      return { status: "okay", color: "text-yellow-600", bg: "bg-yellow-100" }
    } else {
      return { status: "needs", color: "text-red-600", bg: "bg-red-100" }
    }
  }

  const waterStatus = getCareStatus(plantData.lastWatered, 6)
  const feedStatus = getCareStatus(plantData.lastFed, 8)
  const playStatus = getCareStatus(plantData.lastPlayed, 4)

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        Take Care of {plantData.name}! 🌱
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Water Button */}
        <div className="text-center">
          <button
            onClick={() => handleCareAction("water")}
            disabled={isWatering}
            className={`w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              waterStatus.bg
            } ${waterStatus.color} border-2 border-transparent hover:border-current disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="mb-2">
              <Droplets className={`w-8 h-8 mx-auto ${isWatering ? "animate-bounce" : ""}`} />
            </div>
            <div className="font-semibold">Water</div>
            <div className="text-xs mt-1">
              Last: {getTimeSince(plantData.lastWatered)}
            </div>
            <div className={`text-xs mt-1 font-medium ${waterStatus.color} flex items-center justify-center space-x-1`}>
              {waterStatus.status === "good" && (
                <>
                  <CheckCircle className="w-3 h-3" />
                  <span>Well hydrated</span>
                </>
              )}
              {waterStatus.status === "okay" && (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  <span>Getting thirsty</span>
                </>
              )}
              {waterStatus.status === "needs" && (
                <>
                  <AlertCircle className="w-3 h-3" />
                  <span>Needs water!</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Feed Button */}
        <div className="text-center">
          <button
            onClick={() => handleCareAction("feed")}
            disabled={isFeeding}
            className={`w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              feedStatus.bg
            } ${feedStatus.color} border-2 border-transparent hover:border-current disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="mb-2">
              <Sprout className={`w-8 h-8 mx-auto ${isFeeding ? "animate-bounce" : ""}`} />
            </div>
            <div className="font-semibold">Feed</div>
            <div className="text-xs mt-1">
              Last: {getTimeSince(plantData.lastFed)}
            </div>
            <div className={`text-xs mt-1 font-medium ${feedStatus.color} flex items-center justify-center space-x-1`}>
              {feedStatus.status === "good" && (
                <>
                  <CheckCircle className="w-3 h-3" />
                  <span>Well fed</span>
                </>
              )}
              {feedStatus.status === "okay" && (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  <span>Getting hungry</span>
                </>
              )}
              {feedStatus.status === "needs" && (
                <>
                  <AlertCircle className="w-3 h-3" />
                  <span>Needs food!</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Play Button */}
        <div className="text-center">
          <button
            onClick={() => handleCareAction("play")}
            disabled={isPlaying}
            className={`w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              playStatus.bg
            } ${playStatus.color} border-2 border-transparent hover:border-current disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="mb-2">
              <Gamepad2 className={`w-8 h-8 mx-auto ${isPlaying ? "animate-bounce" : ""}`} />
            </div>
            <div className="font-semibold">Play</div>
            <div className="text-xs mt-1">
              Last: {getTimeSince(plantData.lastPlayed)}
            </div>
            <div className={`text-xs mt-1 font-medium ${playStatus.color} flex items-center justify-center space-x-1`}>
              {playStatus.status === "good" && (
                <>
                  <CheckCircle className="w-3 h-3" />
                  <span>Happy & active</span>
                </>
              )}
              {playStatus.status === "okay" && (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  <span>Getting bored</span>
                </>
              )}
              {playStatus.status === "needs" && (
                <>
                  <AlertCircle className="w-3 h-3" />
                  <span>Needs playtime!</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Care Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center space-x-2">
          <Lightbulb className="w-4 h-4" />
          <span>Care Tips</span>
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Water every 6 hours to keep {plantData.name} hydrated</li>
          <li>• Feed every 8 hours for healthy growth</li>
          <li>• Play every 4 hours to keep spirits high</li>
          <li>• Work together with friends for the best results!</li>
        </ul>
      </div>
    </div>
  )
}
