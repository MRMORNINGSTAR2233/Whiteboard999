"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getSafeTextColor } from "@/lib/contrast-utils"

interface Cursor {
  id: string
  x: number
  y: number
  color: string
  userName: string
  userAvatar: string
}

interface LiveCursorsProps {
  cursors: Cursor[]
  containerRef: React.RefObject<HTMLDivElement>
}

export function LiveCursors({ cursors, containerRef }: LiveCursorsProps) {
  const [visibleCursors, setVisibleCursors] = useState<Cursor[]>([])

  useEffect(() => {
    // Filter cursors that are within the visible area
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const filtered = cursors.filter(
        (cursor) => cursor.x >= 0 && cursor.x <= rect.width && cursor.y >= 0 && cursor.y <= rect.height,
      )
      setVisibleCursors(filtered)
    }
  }, [cursors, containerRef])

  return (
    <>
      {visibleCursors.map((cursor) => {
        const textColor = getSafeTextColor(cursor.color, "#ffffff")

        return (
          <div
            key={cursor.id}
            className="absolute pointer-events-none z-50 transition-all duration-100"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: "translate(-2px, -2px)",
            }}
          >
            {/* Cursor Arrow */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="drop-shadow-sm">
              <path d="M2 2L18 8L8 10L6 18L2 2Z" fill={cursor.color} stroke="white" strokeWidth="1" />
            </svg>

            {/* User Label */}
            <div
              className="absolute top-5 left-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-lg"
              style={{
                backgroundColor: cursor.color,
                color: textColor,
              }}
            >
              {cursor.userName}
            </div>
          </div>
        )
      })}
    </>
  )
}
