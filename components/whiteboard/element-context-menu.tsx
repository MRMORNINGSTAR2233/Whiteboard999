"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Lock,
  Unlock,
  Link,
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Edit3,
  Layers,
  Download,
  MousePointer,
} from "lucide-react"
import type { WhiteboardElement } from "@/types/whiteboard"

interface ElementContextMenuProps {
  x: number
  y: number
  elementId: string
  elements: WhiteboardElement[]
  onElementsChange: (elements: WhiteboardElement[]) => void
  selectedElements: string[]
  onSelectedElementsChange: (selectedIds: string[]) => void
  onClose: () => void
  onDuplicate: () => void
  onToggleLock: () => void
  onStartTextEdit: (element: WhiteboardElement) => void
}

export function ElementContextMenu({
  x,
  y,
  elementId,
  elements,
  onElementsChange,
  selectedElements,
  onSelectedElementsChange,
  onClose,
  onDuplicate,
  onToggleLock,
  onStartTextEdit,
}: ElementContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const element = elements.find((el) => el.id === elementId)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  if (!element) return null

  const handleCopy = () => {
    // Copy functionality handled by parent
    onClose()
  }

  const handleCut = () => {
    // Cut functionality - copy then delete
    const newElements = elements.filter((el) => !selectedElements.includes(el.id))
    onElementsChange(newElements)
    onSelectedElementsChange([])
    onClose()
  }

  const handleDelete = () => {
    const newElements = elements.filter((el) => !selectedElements.includes(el.id))
    onElementsChange(newElements)
    onSelectedElementsChange([])
    onClose()
  }

  const handleBringToFront = () => {
    const maxLayer = Math.max(...elements.map((el) => el.layer))
    const newElements = elements.map((el) =>
      selectedElements.includes(el.id) ? { ...el, layer: maxLayer + 1, updatedAt: new Date() } : el,
    )
    onElementsChange(newElements)
    onClose()
  }

  const handleSendToBack = () => {
    const minLayer = Math.min(...elements.map((el) => el.layer))
    const newElements = elements.map((el) =>
      selectedElements.includes(el.id) ? { ...el, layer: minLayer - 1, updatedAt: new Date() } : el,
    )
    onElementsChange(newElements)
    onClose()
  }

  const handleEditText = () => {
    onStartTextEdit(element)
    onClose()
  }

  // Position menu to stay within viewport
  const menuStyle = {
    left: Math.min(x, window.innerWidth - 200),
    top: Math.min(y, window.innerHeight - 400),
  }

  return (
    <Card
      ref={menuRef}
      className="absolute z-50 w-48 p-2 bg-white border border-gray-200 shadow-lg rounded-lg"
      style={menuStyle}
    >
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-left hover:bg-gray-100"
          onClick={handleEditText}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Text
        </Button>

        <Separator />

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-left hover:bg-gray-100"
          onClick={onToggleLock}
        >
          {element.locked ? (
            <>
              <Unlock className="w-4 h-4 mr-2" />
              Unlock
              <span className="ml-auto text-xs text-gray-400">⌘+L</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Lock
              <span className="ml-auto text-xs text-gray-400">⌘+L</span>
            </>
          )}
        </Button>

        <Button variant="ghost" size="sm" className="w-full justify-start text-left hover:bg-gray-100">
          <Link className="w-4 h-4 mr-2" />
          Link to...
          <span className="ml-auto text-xs text-gray-400">Ctrl Alt + K</span>
        </Button>

        <Separator />

        <div className="px-2 py-1">
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <Layers className="w-3 h-3 mr-1" />
            Reorder
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="flex-1 text-xs hover:bg-gray-100" onClick={handleBringToFront}>
              Front
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 text-xs hover:bg-gray-100" onClick={handleSendToBack}>
              Back
            </Button>
          </div>
        </div>

        <Separator />

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-left hover:bg-gray-100"
          onClick={handleCopy}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy
          <span className="ml-auto text-xs text-gray-400">Ctrl + C</span>
        </Button>

        <Button variant="ghost" size="sm" className="w-full justify-start text-left hover:bg-gray-100">
          <Clipboard className="w-4 h-4 mr-2" />
          Paste
          <span className="ml-auto text-xs text-gray-400">Ctrl + V</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-left hover:bg-gray-100"
          onClick={onDuplicate}
        >
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
          <span className="ml-auto text-xs text-gray-400">Ctrl + D</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-left hover:bg-gray-100"
          onClick={handleCut}
        >
          <Scissors className="w-4 h-4 mr-2" />
          Cut
          <span className="ml-auto text-xs text-gray-400">Ctrl + X</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-left hover:bg-gray-100 text-red-600"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
          <span className="ml-auto text-xs text-gray-400">⌫</span>
        </Button>

        <Separator />

        <Button variant="ghost" size="sm" className="w-full justify-start text-left hover:bg-gray-100">
          <Link className="w-4 h-4 mr-2" />
          Copy object link
          <span className="ml-auto text-xs text-gray-400">Ctrl + L</span>
        </Button>

        <div className="px-2 py-1">
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <Download className="w-3 h-3 mr-1" />
            Copy as...
          </div>
        </div>

        <div className="px-2 py-1">
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <Download className="w-3 h-3 mr-1" />
            Export as...
          </div>
        </div>

        <Separator />

        <Button variant="ghost" size="sm" className="w-full justify-start text-left hover:bg-gray-100">
          <MousePointer className="w-4 h-4 mr-2" />
          Select all
          <span className="ml-auto text-xs text-gray-400">Ctrl + A</span>
        </Button>
      </div>
    </Card>
  )
}
