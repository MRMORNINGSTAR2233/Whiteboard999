"use client"

import { useCursorSync, type CursorPosition } from "@/hooks/use-cursor-sync"

interface RemoteCursorsProps {
  whiteboardId: string
  currentUserId: string
  onCursorMove?: (x: number, y: number, userName: string, userAvatar?: string) => void
}

export function RemoteCursors({ whiteboardId, currentUserId, onCursorMove }: RemoteCursorsProps) {
  const { cursors } = useCursorSync(whiteboardId, currentUserId)

  return (
    <>
      {cursors.map((cursor) => (
        <RemoteCursor key={cursor.userId} cursor={cursor} />
      ))}
    </>
  )
}

interface RemoteCursorProps {
  cursor: CursorPosition
}

function RemoteCursor({ cursor }: RemoteCursorProps) {
  return (
    <div
      className="absolute pointer-events-none z-50 transition-transform duration-100"
      style={{
        left: `${cursor.x}px`,
        top: `${cursor.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Cursor SVG */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
      >
        <path
          d="M5.65376 12.3673L11.6538 18.3673C12.0443 18.7578 12.6775 18.7578 13.068 18.3673L19.068 12.3673C19.4585 11.9768 19.4585 11.3436 19.068 10.9531L13.068 4.95312C12.6775 4.56259 12.0443 4.56259 11.6538 4.95312L5.65376 10.9531C5.26323 11.3436 5.26323 11.9768 5.65376 12.3673Z"
          fill={cursor.color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>

      {/* User Name Label */}
      <div
        className="absolute top-6 left-2 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap"
        style={{
          backgroundColor: cursor.color,
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        {cursor.userName}
      </div>
    </div>
  )
}
