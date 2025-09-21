"use client"

import { useState } from 'react'
import { Users, UserPlus, Crown, Shield, User, Mail, Trash2, Edit3, Check, X } from 'lucide-react'
import { usePlantMembers, PlantMember } from '@/hooks/usePlantMembers'

interface CareTeamProps {
  plantId: string
  currentUserId?: string
  plantName?: string
  currentUserName?: string
  currentUserEmail?: string
}

export default function CareTeam({ 
  plantId, 
  currentUserId, 
  plantName = 'Your Plant',
  currentUserName = 'A friend',
  currentUserEmail = 'friend@example.com'
}: CareTeamProps) {
  const { 
    members, 
    loading, 
    error, 
    addMember, 
    removeMember, 
    updateMemberRole 
  } = usePlantMembers(plantId)
  
  const [isInviting, setIsInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [editingMember, setEditingMember] = useState<PlantMember | null>(null)
  const [newRole, setNewRole] = useState<'admin' | 'member'>('member')

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return

    try {
      // First add the member to the database
      const member = await addMember(inviteEmail.trim())
      if (member) {
        // Send email invitation
        const response = await fetch('/api/send-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: inviteEmail.trim(),
            plantName: plantName,
            inviterName: currentUserName,
            inviterEmail: currentUserEmail
          }),
        })

        if (response.ok) {
          const result = await response.json()
          console.log('Email invitation sent:', result.message)
          alert('Invitation sent successfully! 🌱')
        } else {
          console.error('Failed to send email invitation')
          alert('Member added but email invitation failed to send.')
        }

        setInviteEmail('')
        setIsInviting(false)
      }
    } catch (error) {
      console.error('Error inviting member:', error)
      alert('Failed to send invitation. Please try again.')
    }
  }

  const handleRemoveMember = async (member: PlantMember) => {
    if (window.confirm(`Are you sure you want to remove ${member.users.name} from the care team?`)) {
      await removeMember(member.users.id)
    }
  }

  const handleUpdateRole = async () => {
    if (!editingMember) return

    await updateMemberRole(editingMember.users.id, newRole)
    setEditingMember(null)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const canManageMembers = (member: PlantMember) => {
    if (!currentUserId) return false
    const currentUserMember = members.find(m => m.users.id === currentUserId)
    if (!currentUserMember) return false
    
    // Owners can manage everyone except other owners
    if (currentUserMember.role === 'owner' && member.role !== 'owner') return true
    // Admins can manage members (but not other admins or owners)
    if (currentUserMember.role === 'admin' && member.role === 'member') return true
    // Users can remove themselves
    if (member.users.id === currentUserId) return true
    
    return false
  }

  // Debug: Log member management permissions
  console.log('CareTeam Debug:', {
    currentUserId,
    members: members.map(m => ({ id: m.users.id, name: m.users.name, role: m.role })),
    canManage: members.map(m => ({ name: m.users.name, canManage: canManageMembers(m) }))
  })

  if (!plantId) {
    return null
  }

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Bloom Buddies</h3>
        </div>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading bloom buddies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Bloom Buddies</h3>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={() => setIsInviting(true)}
          className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Invite Member Form */}
      {isInviting && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-gray-900 mb-3">Invite a Friend</h4>
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter friend's email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-700 text-gray-900"
              />
            </div>
            <button
              onClick={handleInviteMember}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
            >
              <Mail className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsInviting(false)
                setInviteEmail('')
              }}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="p-3 bg-white/50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-medium">
                  {member.users.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{member.users.name}</h4>
                    {getRoleIcon(member.role)}
                  </div>
                  <p className="text-sm text-gray-700">{member.users.email}</p>
                  <p className="text-xs text-gray-600">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(member.role)}`}>
                  {member.role}
                </span>
                
                {canManageMembers(member) && (
                  <div className="flex items-center space-x-1">
                    {member.role !== 'owner' && (
                      <button
                        onClick={() => {
                          setEditingMember(member)
                          setNewRole(member.role === 'admin' ? 'member' : 'admin')
                        }}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                        title="Change role"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {member.users.id !== currentUserId && (
                      <button
                        onClick={() => handleRemoveMember(member)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Change Role for {editingMember.users.name}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'admin' | 'member')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleUpdateRole}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Check className="w-4 h-4 inline mr-2" />
                  Update Role
                </button>
                <button
                  onClick={() => setEditingMember(null)}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

          {members.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-700">No bloom buddies yet</p>
              <p className="text-sm text-gray-600">Invite friends to help care for your plant!</p>
            </div>
          )}
    </div>
  )
}
