"use client"

import { useEffect, useRef, useCallback } from "react"
import { getPusherClient } from "@/lib/pusher-client"
import type { Channel } from "pusher-js"
import type { Editor, TLRecord } from "tldraw"

export interface ShapeEvent {
  action: "create" | "update" | "delete"
  records: TLRecord[]
  userId: string
}

export function useShapeSync(
  whiteboardId: string,
  currentUserId: string,
  editor: Editor | null
) {
  const channelRef = useRef<Channel | null>(null)
  const isApplyingRemoteChange = useRef(false)

  // Broadcast shape changes
  const broadcastShapeChange = useCallback(
    (action: "create" | "update" | "delete", records: TLRecord[]) => {
      if (!channelRef.current || isApplyingRemoteChange.current) return

      channelRef.current.trigger("client-shape-change", {
        action,
        records,
        userId: currentUserId,
      })
    },
    [currentUserId]
  )

  useEffect(() => {
    if (!editor) return

    const pusher = getPusherClient()
    const channelName = `private-whiteboard-${whiteboardId}`

    // Subscribe to private channel
    const channel = pusher.subscribe(channelName)
    channelRef.current = channel

    // Listen for shape changes from other users
    channel.bind("client-shape-change", (data: ShapeEvent) => {
      // Ignore own changes
      if (data.userId === currentUserId) return

      // Apply remote changes
      isApplyingRemoteChange.current = true

      try {
        switch (data.action) {
          case "create":
            editor.store.put(data.records)
            break
          case "update":
            editor.store.put(data.records)
            break
          case "delete":
            editor.store.remove(data.records.map((r) => r.id))
            break
        }
      } catch (error) {
        console.error("Failed to apply remote shape change:", error)
      } finally {
        isApplyingRemoteChange.current = false
      }
    })

    // Listen to local editor changes
    const handleChange = (changes: any) => {
      if (isApplyingRemoteChange.current) return

      const { added, updated, removed } = changes

      // Broadcast created shapes
      if (Object.keys(added).length > 0) {
        const records = Object.values(added) as TLRecord[]
        broadcastShapeChange("create", records)
      }

      // Broadcast updated shapes
      if (Object.keys(updated).length > 0) {
        const records = Object.entries(updated).map(([id, [from, to]]) => to) as TLRecord[]
        broadcastShapeChange("update", records)
      }

      // Broadcast deleted shapes
      if (Object.keys(removed).length > 0) {
        const records = Object.values(removed) as TLRecord[]
        broadcastShapeChange("delete", records)
      }
    }

    // Subscribe to editor changes
    const unsubscribe = editor.store.listen(handleChange, {
      source: "user",
      scope: "document",
    })

    // Cleanup on unmount
    return () => {
      unsubscribe()
      channel.unbind_all()
      pusher.unsubscribe(channelName)
      channelRef.current = null
    }
  }, [whiteboardId, currentUserId, editor, broadcastShapeChange])

  return {
    broadcastShapeChange,
  }
}
