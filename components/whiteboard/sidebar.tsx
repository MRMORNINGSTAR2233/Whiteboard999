"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { DrawingTools } from "./drawing-tools"
import { ShapeLibrary } from "./shape-library"
import { PropertyPanel } from "./property-panel"
import { CollaborationPanel } from "./collaboration-panel"
import {
  MousePointer2,
  Hand,
  Square,
  Circle,
  Triangle,
  ArrowRight,
  Type,
  StickyNote,
  ImageIcon,
  Minus,
  Edit3,
  Eraser,
  Shapes,
  Settings,
  Layers,
  Users,
} from "lucide-react"
import { useState } from "react"
import type { WhiteboardElement, Tool } from "@/types/whiteboard"

const tools = [
  { id: "select" as Tool, icon: MousePointer2, label: "Select", shortcut: "V" },
  { id: "pan" as Tool, icon: Hand, label: "Pan", shortcut: "H" },
]

const shapes = [
  { id: "rectangle" as Tool, icon: Square, label: "Rectangle", shortcut: "R" },
  { id: "circle" as Tool, icon: Circle, label: "Circle", shortcut: "O" },
  { id: "triangle" as Tool, icon: Triangle, label: "Triangle", shortcut: "T" },
  { id: "arrow" as Tool, icon: ArrowRight, label: "Arrow", shortcut: "A" },
]

const elements = [
  { id: "text" as Tool, icon: Type, label: "Text", shortcut: "T" },
  { id: "sticky-note" as Tool, icon: StickyNote, label: "Sticky Note", shortcut: "S" },
  { id: "image" as Tool, icon: ImageIcon, label: "Image", shortcut: "I" },
]

const drawingTools = [
  { id: "pen" as Tool, icon: Edit3, label: "Pen", shortcut: "P" },
  { id: "line" as Tool, icon: Minus, label: "Line", shortcut: "L" },
  { id: "eraser" as Tool, icon: Eraser, label: "Eraser", shortcut: "E" },
]

const panels = [
  { id: "tools", icon: Shapes, label: "Drawing Tools" },
  { id: "library", icon: Layers, label: "Shape Library" },
  { id: "properties", icon: Settings, label: "Properties" },
  { id: "collaboration", icon: Users, label: "Collaboration" },
]

interface SidebarProps {
  activeTool: Tool
  onToolChange: (tool: Tool) => void
  selectedElement?: WhiteboardElement | null
  onStyleChange?: (style: any) => void
  onToggleCollaboration?: () => void
  showCollaborationPanel?: boolean
}

export function Sidebar({
  activeTool,
  onToolChange,
  selectedElement,
  onStyleChange,
  onToggleCollaboration,
  showCollaborationPanel,
}: SidebarProps) {
  const [activePanel, setActivePanel] = useState<string | null>(null)

  const handleShapeUpdate = (updates: Partial<WhiteboardElement>) => {
    console.log("Shape updated:", updates)
    // This will be handled by the parent component
  }

  const handleShapeDelete = () => {
    console.log("Shape deleted:", selectedElement?.id)
    // This will be handled by the parent component
  }

  const handlePanelToggle = (panelId: string) => {
    if (panelId === "collaboration" && onToggleCollaboration) {
      onToggleCollaboration()
      console.log(`[v0] Collaboration panel toggled via sidebar`)
    } else {
      setActivePanel(activePanel === panelId ? null : panelId)
    }
  }

  return (
    <div className="flex">
      {/* Main Sidebar */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {/* Basic Tools */}
            {tools.map((tool) => (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "default" : "ghost"}
                size="sm"
                className={`w-12 h-12 p-0 flex flex-col gap-1 rounded-lg ${
                  activeTool === tool.id ? "bg-black text-white hover:bg-gray-800" : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => onToolChange(tool.id)}
                title={`${tool.label} (${tool.shortcut})`}
              >
                <tool.icon className="w-5 h-5" />
              </Button>
            ))}

            <Separator className="my-2 bg-gray-200" />

            {/* Drawing Tools */}
            <div className="flex items-center gap-1 px-1 mb-2">
              <Edit3 className="w-3 h-3 text-gray-400" />
            </div>
            {drawingTools.map((tool) => (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "default" : "ghost"}
                size="sm"
                className={`w-12 h-12 p-0 flex flex-col gap-1 rounded-lg ${
                  activeTool === tool.id ? "bg-black text-white hover:bg-gray-800" : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => onToolChange(tool.id)}
                title={`${tool.label} (${tool.shortcut})`}
              >
                <tool.icon className="w-5 h-5" />
              </Button>
            ))}

            <Separator className="my-2 bg-gray-200" />

            {/* Shapes */}
            <div className="flex items-center gap-1 px-1 mb-2">
              <Shapes className="w-3 h-3 text-gray-400" />
            </div>
            {shapes.map((shape) => (
              <Button
                key={shape.id}
                variant={activeTool === shape.id ? "default" : "ghost"}
                size="sm"
                className={`w-12 h-12 p-0 flex flex-col gap-1 rounded-lg ${
                  activeTool === shape.id ? "bg-black text-white hover:bg-gray-800" : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => onToolChange(shape.id)}
                title={`${shape.label} (${shape.shortcut})`}
              >
                <shape.icon className="w-5 h-5" />
              </Button>
            ))}

            <Separator className="my-2 bg-gray-200" />

            {/* Elements */}
            {elements.map((element) => (
              <Button
                key={element.id}
                variant={activeTool === element.id ? "default" : "ghost"}
                size="sm"
                className={`w-12 h-12 p-0 flex flex-col gap-1 rounded-lg ${
                  activeTool === element.id
                    ? "bg-black text-white hover:bg-gray-800"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => onToolChange(element.id)}
                title={`${element.label} (${element.shortcut})`}
              >
                <element.icon className="w-5 h-5" />
              </Button>
            ))}

            <Separator className="my-2 bg-gray-200" />

            {/* Panel Toggles */}
            {panels.map((panel) => (
              <Button
                key={panel.id}
                variant={
                  panel.id === "collaboration"
                    ? showCollaborationPanel
                      ? "default"
                      : "ghost"
                    : activePanel === panel.id
                      ? "default"
                      : "ghost"
                }
                size="sm"
                className={`w-12 h-12 p-0 flex flex-col gap-1 rounded-lg ${
                  (panel.id === "collaboration" ? showCollaborationPanel : activePanel === panel.id)
                    ? "bg-black text-white hover:bg-gray-800"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => handlePanelToggle(panel.id)}
                title={panel.label}
              >
                <panel.icon className="w-5 h-5" />
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Expandable Panels */}
      {activePanel && (
        <div className="border-r border-gray-200 bg-white">
          {activePanel === "tools" && (
            <DrawingTools
              activeTool={activeTool}
              onToolChange={onToolChange}
              onStyleChange={onStyleChange || (() => {})}
            />
          )}
          {activePanel === "library" && <ShapeLibrary />}
          {activePanel === "properties" && (
            <PropertyPanel
              selectedShape={selectedElement}
              onShapeUpdate={handleShapeUpdate}
              onShapeDelete={handleShapeDelete}
            />
          )}
          {activePanel === "collaboration" && <CollaborationPanel />}
        </div>
      )}
    </div>
  )
}
