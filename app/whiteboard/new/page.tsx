"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NewWhiteboardPage() {
  const router = useRouter()

  useEffect(() => {
    const newId = Date.now().toString()
    router.replace(`/whiteboard/${newId}`)
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
        <div className="text-lg font-medium text-gray-700">Creating new whiteboard...</div>
      </div>
    </div>
  )
}
