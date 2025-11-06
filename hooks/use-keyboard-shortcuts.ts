"use client"

import { useEffect } from "react"
import type { Tool } from "@/types/whiteboard"

interface KeyboardShortcutsProps {
  onToolChange: (tool: Tool) => void
  onUndo: () => void
  onRedo: () => void
  onCopy: () => void
  onPaste: () => void
  onDelete: () => void
  onSelectAll: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onSave: () => void
  onLoad?: () => void // Added optional load handler
  onNew?: () => void // Added optional new handler
}

export function useKeyboardShortcuts({
  onToolChange,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onDelete,
  onSelectAll,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onSave,
  onLoad, // Added load parameter
  onNew, // Added new parameter
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const isCtrl = e.ctrlKey || e.metaKey
      const isShift = e.shiftKey

      // Tool shortcuts
      if (!isCtrl && !isShift) {
        switch (e.key.toLowerCase()) {
          case "v":
            e.preventDefault()
            onToolChange("select")
            break
          case "h":
            e.preventDefault()
            onToolChange("pan")
            break
          case "r":
            e.preventDefault()
            onToolChange("rectangle")
            break
          case "o":
            e.preventDefault()
            onToolChange("circle")
            break
          case "t":
            e.preventDefault()
            onToolChange("text")
            break
          case "a":
            e.preventDefault()
            onToolChange("arrow")
            break
          case "p":
            e.preventDefault()
            onToolChange("pen")
            break
          case "l":
            e.preventDefault()
            onToolChange("line")
            break
          case "s":
            e.preventDefault()
            onToolChange("sticky-note")
            break
          case "e":
            e.preventDefault()
            onToolChange("eraser")
            break
          case "escape":
            e.preventDefault()
            onToolChange("select")
            break
        }
      }

      // Ctrl/Cmd shortcuts
      if (isCtrl) {
        switch (e.key.toLowerCase()) {
          case "z":
            e.preventDefault()
            if (isShift) {
              onRedo()
            } else {
              onUndo()
            }
            break
          case "y":
            e.preventDefault()
            onRedo()
            break
          case "c":
            e.preventDefault()
            onCopy()
            break
          case "v":
            e.preventDefault()
            onPaste()
            break
          case "a":
            e.preventDefault()
            onSelectAll()
            break
          case "s":
            e.preventDefault()
            onSave()
            break
          case "o": // Added Ctrl+O for load/open
            e.preventDefault()
            if (onLoad) {
              onLoad()
            }
            break
          case "n": // Added Ctrl+N for new whiteboard
            e.preventDefault()
            if (onNew) {
              onNew()
            }
            break
          case "=":
          case "+":
            e.preventDefault()
            onZoomIn()
            break
          case "-":
            e.preventDefault()
            onZoomOut()
            break
          case "0":
            e.preventDefault()
            onResetZoom()
            break
        }
      }

      // Delete key - Enhanced to provide better feedback
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        onDelete()
        console.log("[v0] Delete key pressed - triggering deletion")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    onToolChange,
    onUndo,
    onRedo,
    onCopy,
    onPaste,
    onDelete,
    onSelectAll,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    onSave,
    onLoad,
    onNew,
  ]) // Added onLoad and onNew to dependencies
}
