"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { getPusherClient } from "@/lib/pusher-client"
import type { Channel } from "pusher-js"

export interface CursorPosition {
  userId: string
  userName: string
  userAvatar?: string
  x: number
  y: number
  color: string
}

const USER_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#FFA07A", // Orange
  "#98D8C8", // Mint
  "#F7DC6F", // Yellow
  "#BB8FCE", // Purple
  "#85C1E2", // Sky Blue
]

export function useCursorSync(whiteboardId: string, currentUserId: string) {
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map())
  const channelRef = useRef<Channel | null>(null)
  const throttleRef = useRef<NodeJS.Timeout | null>(null)

  // Broadcast cursor position (throttled)
  const broadcastCursor = useCallback(
    (x: number, y: number, userName: string, userAvatar?: string) => {
      if (!channelRef.current) return

      // Throttle cursor updates to every 50ms
      if (throttleRef.current) {
        clearTimeout(throttleRef.current)
      }

      throttleRef.current = setTimeout(() => {
        // Assign a consistent color based on user ID
        const colorIndex = currentUserId.charCodeAt(0) % USER_COLORS.length
        const color = USER_COLORS[colorIndex]

        channelRef.current?.trigger("client-cursor-move", {
          userId: currentUserId,
          userName,
          userAvatar,
          x,
          y,
          color,
        })
      }, 50)
    },
    [currentUserId]
  )

  useEffect(() => {
    const pusher = getPusherClient()
    const channelName = `private-whiteboard-${whiteboardId}`

    // Subscribe to private channel
    const channel = pusher.subscribe(channelName)
    channelRef.current = channel

    // Listen for cursor movements from other users
    channel.bind("client-cursor-move", (data: CursorPosition) => {
      // Ignore own cursor
      if (data.userId === currentUserId) return

      setCursors((prev) => {
        const newCursors = new Map(prev)
        newCursors.set(data.userId, data)
        return newCursors
      })

      // Remove cursor after 3 seconds of inactivity
      setTimeout(() => {
        setCursors((prev) => {
          const newCursors = new Map(prev)
          newCursors.delete(data.userId)
          return newCursors
        })
      }, 3000)
    })

    // Cleanup on unmount
    return () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current)
      }
      channel.unbind_all()
      pusher.unsubscribe(channelName)
      channelRef.current = null
    }
  }, [whiteboardId, currentUserId])

  return {
    cursors: Array.from(cursors.values()),
    broadcastCursor,
  }
}
