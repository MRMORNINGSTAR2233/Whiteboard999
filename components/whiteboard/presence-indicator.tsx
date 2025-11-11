"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Wifi, WifiOff } from "lucide-react"
import { usePresence, type PresenceUser } from "@/hooks/use-presence"

interface PresenceIndicatorProps {
  whiteboardId: string
  maxVisible?: number
}

export function PresenceIndicator({ whiteboardId, maxVisible = 5 }: PresenceIndicatorProps) {
  const { users, isConnected } = usePresence(whiteboardId)
  
  const visibleUsers = users.slice(0, maxVisible)
  const hiddenCount = Math.max(0, users.length - maxVisible)

  return (
    <div className="flex items-center gap-2">
      {/* Connection Status */}
      <div className="flex items-center gap-1">
        {isConnected ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-gray-400" />
        )}
      </div>

      {/* User Avatars */}
      <div className="flex -space-x-2">
        {visibleUsers.map((user, index) => (
          <div key={user.id} className="relative group">
            <Avatar
              className="w-8 h-8 border-2 border-background ring-1 ring-border hover:z-10 transition-all cursor-pointer"
              style={{ zIndex: visibleUsers.length - index }}
            >
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs bg-blue-600 text-white">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Online Status Indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background bg-green-500" />

            {/* Hover Card */}
            <Card className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs bg-blue-600 text-white">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-sm">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-muted-foreground">Online</span>
                    </div>
                  </div>
                </div>
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
      {users.length > 0 && (
        <Badge variant="secondary" className="text-xs">
          {users.length} online
        </Badge>
      )}
    </div>
  )
}
