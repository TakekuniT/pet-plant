"use client"

import { History, Droplets, Sprout, Gamepad2 } from "lucide-react"

interface CareAction {
  id: number
  friend: string
  action: string
  time: string
  emoji: string
}

interface CareHistoryProps {
  history: CareAction[]
}

export default function CareHistory({ history }: CareHistoryProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
        <History className="w-5 h-5" />
        <span>Care History</span>
      </h3>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {history.map((action) => (
          <div
            key={action.id}
            className="flex items-center space-x-3 p-2 bg-white/50 rounded-lg"
          >
            <div className="w-6 h-6">
              {(action.action === "watered" || action.emoji === "water") && <Droplets className="w-6 h-6 text-blue-500" />}
              {(action.action === "fed" || action.emoji === "feed") && <Sprout className="w-6 h-6 text-green-500" />}
              {(action.action === "played" || action.emoji === "play") && <Gamepad2 className="w-6 h-6 text-purple-500" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                {action.friend} {action.action}
              </p>
              <p className="text-xs text-gray-500">{action.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      {history.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No care actions yet</p>
          <p className="text-xs">Start taking care of your plant!</p>
        </div>
      )}
    </div>
  )
}
