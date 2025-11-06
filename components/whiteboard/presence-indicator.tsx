"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Crown, Edit, Eye, Wifi, WifiOff, Clock } from "lucide-react"

interface User {
  id: string
  name: string
  avatar: string
  role: "owner" | "editor" | "viewer"
  status: "online" | "away" | "offline"
  lastSeen?: Date
  currentAction?: string
}

interface PresenceIndicatorProps {
  users: User[]
  maxVisible?: number
}

export function PresenceIndicator({ users, maxVisible = 5 }: PresenceIndicatorProps) {
  const onlineUsers = users.filter((u) => u.status === "online")
  const visibleUsers = onlineUsers.slice(0, maxVisible)
  const hiddenCount = Math.max(0, onlineUsers.length - maxVisible)

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-3 h-3 text-yellow-500" />
      case "editor":
        return <Edit className="w-3 h-3 text-blue-500" />
      case "viewer":
        return <Eye className="w-3 h-3 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <Wifi className="w-3 h-3 text-green-500" />
      case "away":
        return <Clock className="w-3 h-3 text-yellow-500" />
      case "offline":
        return <WifiOff className="w-3 h-3 text-gray-400" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* User Avatars */}
      <div className="flex -space-x-2">
        {visibleUsers.map((user, index) => (
          <div key={user.id} className="relative group">
            <Avatar
              className="w-8 h-8 border-2 border-background ring-1 ring-border hover:z-10 transition-all cursor-pointer"
              style={{ zIndex: visibleUsers.length - index }}
            >
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            {/* Status Indicator */}
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`}
            />

            {/* Hover Card */}
            <Card className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-sm">{user.name}</span>
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(user.status)}
                      <span className="text-xs text-muted-foreground capitalize">{user.status}</span>
                    </div>
                  </div>
                </div>

                {user.currentAction && <div className="text-xs text-muted-foreground">{user.currentAction}</div>}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Hidden Users Count */}
        {hiddenCount > 0 && (
          <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">+{hiddenCount}</span>
          </div>
        )}
      </div>

      {/* Online Count Badge */}
      <Badge variant="secondary" className="text-xs">
        {onlineUsers.length} online
      </Badge>
    </div>
  )
}
