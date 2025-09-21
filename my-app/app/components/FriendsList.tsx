"use client"

import { Users, UserPlus, Circle, User } from "lucide-react"

interface Friend {
  id: number
  name: string
  avatar: string
  lastCare: string
}

interface FriendsListProps {
  friends: Friend[]
}

export default function FriendsList({ friends }: FriendsListProps) {
  const getAvatarColor = (avatar: string) => {
    switch (avatar) {
      case "user1":
        return "from-pink-400 to-rose-500"
      case "user2":
        return "from-blue-400 to-cyan-500"
      case "user3":
        return "from-green-400 to-emerald-500"
      default:
        return "from-gray-400 to-gray-500"
    }
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Care Team</span>
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1">
          <UserPlus className="w-4 h-4" />
          <span>Invite</span>
        </button>
      </div>
      
      <div className="space-y-3">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
          >
            <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(friend.avatar)} rounded-full flex items-center justify-center shadow-md`}>
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{friend.name}</p>
              <p className="text-xs text-gray-500">Last care: {friend.lastCare}</p>
            </div>
            <div className="flex items-center space-x-1">
              <Circle className="w-2 h-2 fill-green-400 text-green-400" />
              <span className="text-xs text-gray-500">Online</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Team Stats</p>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Total Care Actions: 47</span>
            <span>Streak: 5 days</span>
          </div>
        </div>
      </div>
    </div>
  )
}
