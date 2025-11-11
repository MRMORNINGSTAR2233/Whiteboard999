"use client"

import { useEffect, useState } from "react"
import { getPusherClient } from "@/lib/pusher-client"
import type { PresenceChannel } from "pusher-js"

export interface PresenceUser {
  id: string
  name: string
  avatar?: string
}

export function usePresence(whiteboardId: string) {
  const [users, setUsers] = useState<PresenceUser[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const pusher = getPusherClient()
    const channelName = `presence-whiteboard-${whiteboardId}`
    
    // Subscribe to presence channel
    const channel = pusher.subscribe(channelName) as PresenceChannel

    // Handle successful subscription
    channel.bind("pusher:subscription_succeeded", (members: any) => {
      setIsConnected(true)
      const membersList: PresenceUser[] = []
      
      members.each((member: any) => {
        membersList.push({
          id: member.id,
          name: member.info.name,
          avatar: member.info.avatar,
        })
      })
      
      setUsers(membersList)
    })

    // Handle member added
    channel.bind("pusher:member_added", (member: any) => {
      setUsers((prev) => {
        // Avoid duplicates
        if (prev.some((u) => u.id === member.id)) {
          return prev
        }
        
        return [
          ...prev,
          {
            id: member.id,
            name: member.info.name,
            avatar: member.info.avatar,
          },
        ]
      })
    })

    // Handle member removed
    channel.bind("pusher:member_removed", (member: any) => {
      setUsers((prev) => prev.filter((u) => u.id !== member.id))
    })

    // Handle subscription error
    channel.bind("pusher:subscription_error", (error: any) => {
      console.error("Presence subscription error:", error)
      setIsConnected(false)
    })

    // Cleanup on unmount
    return () => {
      channel.unbind_all()
      pusher.unsubscribe(channelName)
      setIsConnected(false)
    }
  }, [whiteboardId])

  return { users, isConnected }
}
