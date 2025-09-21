"use client"

import { useEffect, useRef } from 'react'
import { Droplets, Utensils, Gamepad2, Clock, RefreshCw } from 'lucide-react'
import { usePlantMembers, CareAction } from '@/hooks/usePlantMembers'

interface CareHistoryProps {
  plantId: string
}

export default function CareHistory({ plantId }: CareHistoryProps) {
  const { careHistory, loading, error, fetchCareHistory } = usePlantMembers(plantId)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-refresh care history every 5 seconds
  useEffect(() => {
    if (plantId) {
      // Clear any existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
      
      // Set up new interval
      refreshIntervalRef.current = setInterval(() => {
        fetchCareHistory()
      }, 1000) // Refresh every 1 second
    }

    // Cleanup interval on unmount or plantId change
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
    }
  }, [plantId, fetchCareHistory])

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'water':
        return <Droplets className="w-4 h-4 text-blue-500" />
      case 'feed':
        return <Utensils className="w-4 h-4 text-green-500" />
      case 'play':
        return <Gamepad2 className="w-4 h-4 text-purple-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'water':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'feed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'play':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days !== 1 ? 's' : ''} ago`
    }
  }

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Care History</h3>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading care history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Care History</h3>
        <button
          onClick={fetchCareHistory}
          className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="Refresh care history"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {careHistory.map((action) => (
          <div key={action.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {action.users.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{action.users.name}</span>
                  {getActionIcon(action.action)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getActionColor(action.action)}`}>
                    {action.action}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{formatTimeAgo(action.created_at)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {careHistory.length === 0 && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No care actions yet</p>
          <p className="text-sm text-gray-500">Start caring for your plant to see history!</p>
        </div>
      )}
    </div>
  )
}