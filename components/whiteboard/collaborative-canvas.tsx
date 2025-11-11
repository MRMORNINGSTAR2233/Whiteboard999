"use client"

import { useEffect, useRef, useState } from "react"
import { Tldraw, Editor } from "tldraw"
import { useCursorSync } from "@/hooks/use-cursor-sync"
import { useShapeSync } from "@/hooks/use-shape-sync"
import { RemoteCursors } from "./remote-cursors"

interface CollaborativeCanvasProps {
  whiteboardId: string
  userId: string
  userName: string
  userAvatar?: string
  initialData?: any
  onSave?: (data: any) => void
}

export function CollaborativeCanvas({
  whiteboardId,
  userId,
  userName,
  userAvatar,
  initialData,
  onSave,
}: CollaborativeCanvasProps) {
  const [editor, setEditor] = useState<Editor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Real-time cursor synchronization
  const { broadcastCursor } = useCursorSync(whiteboardId, userId)

  // Real-time shape synchronization
  useShapeSync(whiteboardId, userId, editor)

  // Handle mouse move for cursor sync
  useEffect(() => {
    if (!containerRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      broadcastCursor(x, y, userName, userAvatar)
    }

    const container = containerRef.current
    container.addEventListener("mousemove", handleMouseMove)

    return () => {
      container.removeEventListener("mousemove", handleMouseMove)
    }
  }, [broadcastCursor, userName, userAvatar])

  // Auto-save changes
  useEffect(() => {
    if (!editor || !onSave) return

    const handleChange = () => {
      const snapshot = editor.store.getSnapshot()
      onSave(snapshot)
    }

    // Debounce saves
    let timeoutId: NodeJS.Timeout
    const debouncedSave = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleChange, 2000)
    }

    const unsubscribe = editor.store.listen(debouncedSave, {
      source: "user",
      scope: "document",
    })

    return () => {
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [editor, onSave])

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <Tldraw
        onMount={setEditor}
        snapshot={initialData}
        autoFocus
      />
      <RemoteCursors
        whiteboardId={whiteboardId}
        currentUserId={userId}
      />
    </div>
  )
}
