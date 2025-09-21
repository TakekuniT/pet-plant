"use client"

import { useState } from 'react'
import { Plus, Edit3, Trash2, Check, X, Users, Settings } from 'lucide-react'
import { usePlants, Plant } from '@/hooks/usePlants'

interface PlantManagerProps {
  onPlantSelect?: (plant: Plant) => void
}

export default function PlantManager({ onPlantSelect }: PlantManagerProps) {
  const { plants, currentPlant, createPlant, updatePlant, deletePlant, setCurrentPlant, loading, error } = usePlants()
  const [isCreating, setIsCreating] = useState(false)
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null)
  const [newPlantName, setNewPlantName] = useState('')
  const [editPlantName, setEditPlantName] = useState('')

  const handleCreatePlant = async () => {
    if (!newPlantName.trim()) return

    const plant = await createPlant({ name: newPlantName.trim() })
    if (plant) {
      setNewPlantName('')
      setIsCreating(false)
      onPlantSelect?.(plant)
    }
  }

  const handleUpdatePlant = async () => {
    if (!editingPlant || !editPlantName.trim()) return

    const updated = await updatePlant(editingPlant.id, { name: editPlantName.trim() })
    if (updated) {
      setEditingPlant(null)
      setEditPlantName('')
    }
  }

  const handleDeletePlant = async (plant: Plant) => {
    if (!confirm(`Are you sure you want to delete "${plant.name}"? This action cannot be undone.`)) {
      return
    }

    await deletePlant(plant.id)
  }

  const handleSelectPlant = (plant: Plant) => {
    setCurrentPlant(plant)
    onPlantSelect?.(plant)
  }

  const startEditing = (plant: Plant) => {
    setEditingPlant(plant)
    setEditPlantName(plant.name)
  }

  const cancelEditing = () => {
    setEditingPlant(null)
    setEditPlantName('')
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Plant Manager</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>New Plant</span>
          </button>
        </div>
      </div>

      {/* Create New Plant */}
      {isCreating && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-900 mb-2">Create New Plant</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newPlantName}
              onChange={(e) => setNewPlantName(e.target.value)}
              placeholder="Enter plant name..."
              className="flex-1 px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && handleCreatePlant()}
            />
            <button
              onClick={handleCreatePlant}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsCreating(false)
                setNewPlantName('')
              }}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-800 text-sm">Error: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p>Loading plants...</p>
        </div>
      )}

      {/* Plants List */}
      <div className="space-y-3">
        {!loading && plants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No plants yet. Create your first plant to get started!</p>
          </div>
        ) : !loading ? (
          plants.map((plant) => (
            <div
              key={plant.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                currentPlant?.id === plant.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              {editingPlant?.id === plant.id ? (
                // Edit Mode
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editPlantName}
                    onChange={(e) => setEditPlantName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    onKeyPress={(e) => e.key === 'Enter' && handleUpdatePlant()}
                  />
                  <button
                    onClick={handleUpdatePlant}
                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleSelectPlant(plant)}
                        className="text-left flex-1"
                      >
                        <h4 className="font-medium text-gray-900">{plant.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>Health: {plant.health}%</span>
                          <span>Happiness: {plant.happiness}%</span>
                          <span>Growth: {plant.growth}%</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Stage: {plant.stage} • Mood: {plant.mood}
                        </div>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEditing(plant)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlant(plant)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : null}
      </div>

      {/* Current Plant Info */}
      {currentPlant && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Currently Selected</h4>
          <p className="text-blue-800">
            <strong>{currentPlant.name}</strong> - {currentPlant.stage} stage, {currentPlant.mood} mood
          </p>
        </div>
      )}
    </div>
  )
}
