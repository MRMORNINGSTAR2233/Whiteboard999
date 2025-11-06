"use client"

import { useState, useCallback } from "react"
import type { WhiteboardElement } from "@/types/whiteboard"

interface HistoryState {
  elements: WhiteboardElement[]
  timestamp: number
}

export function useWhiteboardHistory(initialElements: WhiteboardElement[] = []) {
  const [history, setHistory] = useState<HistoryState[]>([{ elements: initialElements, timestamp: Date.now() }])
  const [currentIndex, setCurrentIndex] = useState(0)

  const addToHistory = useCallback(
    (elements: WhiteboardElement[]) => {
      setHistory((prev) => {
        // Remove any future history if we're not at the end
        const newHistory = prev.slice(0, currentIndex + 1)
        // Add new state
        newHistory.push({ elements: [...elements], timestamp: Date.now() })
        // Limit history to 50 entries
        if (newHistory.length > 50) {
          newHistory.shift()
          return newHistory
        }
        return newHistory
      })
      setCurrentIndex((prev) => Math.min(prev + 1, 49))
    },
    [currentIndex],
  )

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      return history[currentIndex - 1].elements
    }
    return null
  }, [currentIndex, history])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      return history[currentIndex + 1].elements
    }
    return null
  }, [currentIndex, history])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    currentElements: history[currentIndex]?.elements || [],
  }
}
