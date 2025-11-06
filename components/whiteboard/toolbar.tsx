"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MousePointer2,
  Trash2,
  Copy,
  Clipboard,
  ChevronDown,
  Square,
  Circle,
  Triangle,
  Minus,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ToolbarProps {
  zoom?: number
  onZoomChange?: (zoom: number) => void
  selectedCount?: number
  onSelectAll?: () => void
  onDelete?: () => void
  onCopy?: () => void
  onPaste?: () => void
  selectedElements?: string[]
  elements?: any[]
  onElementsChange?: (elements: any[]) => void
  currentStyle?: any
  onStyleChange?: (style: any) => void
}

export function Toolbar({
  zoom = 100,
  onZoomChange,
  selectedCount = 0,
  onSelectAll,
  onDelete,
  onCopy,
  onPaste,
  selectedElements = [],
  elements = [],
  onElementsChange,
  currentStyle,
  onStyleChange,
}: ToolbarProps) {
  const selectedElement = elements?.find((el) => selectedElements.includes(el?.id))

  const handleZoomIn = () => {
    const newZoom = Math.min((zoom || 100) * 1.2, 500)
    onZoomChange?.(newZoom)
    console.log(`[v0] Zoom in: ${Math.round(newZoom)}%`)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max((zoom || 100) / 1.2, 10)
    onZoomChange?.(newZoom)
    console.log(`[v0] Zoom out: ${Math.round(newZoom)}%`)
  }

  const handleFitToScreen = () => {
    onZoomChange?.(100)
    console.log("[v0] Fit to screen: 100%")
  }

  const updateSelectedElementStyle = (styleUpdates: any) => {
    if (!elements || !onElementsChange || selectedElements.length === 0) return

    const newElements = elements.map((element) =>
      selectedElements.includes(element.id)
        ? {
            ...element,
            style: { ...element.style, ...styleUpdates },
            updatedAt: new Date(),
          }
        : element,
    )
    onElementsChange(newElements)
  }

  const handleFontChange = (font: string) => {
    updateSelectedElementStyle({ fontFamily: font })
    onStyleChange?.({ fontFamily: font })
  }

  const handleFontSizeChange = (size: string) => {
    updateSelectedElementStyle({ fontSize: Number.parseInt(size) })
    onStyleChange?.({ fontSize: Number.parseInt(size) })
  }

  const handleTextFormat = (format: string) => {
    switch (format) {
      case "bold":
        const newWeight = selectedElement?.style?.fontWeight === "bold" ? "normal" : "bold"
        updateSelectedElementStyle({ fontWeight: newWeight })
        break
      case "italic":
        const newStyle = selectedElement?.style?.fontStyle === "italic" ? "normal" : "italic"
        updateSelectedElementStyle({ fontStyle: newStyle })
        break
      case "align-left":
        updateSelectedElementStyle({ textAlign: "left" })
        break
      case "align-center":
        updateSelectedElementStyle({ textAlign: "center" })
        break
      case "align-right":
        updateSelectedElementStyle({ textAlign: "right" })
        break
    }
    console.log(`[v0] Text formatting applied: ${format}`)
  }

  const handleColorChange = (color: string, type: "fill" | "stroke") => {
    if (type === "fill") {
      updateSelectedElementStyle({ fill: color })
      onStyleChange?.({ fillColor: color })
    } else {
      updateSelectedElementStyle({ stroke: color })
      onStyleChange?.({ strokeColor: color })
    }
  }

  return (
    <div className="h-14 border-b border-gray-200 bg-white px-4 flex items-center gap-3">
      {/* Shape Selector */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-lg border-gray-200 hover:bg-gray-50 bg-white text-gray-700 font-medium"
            >
              <Square className="w-4 h-4 mr-2" />
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-lg border-gray-200 shadow-lg bg-white">
            <DropdownMenuItem className="rounded-lg hover:bg-gray-50">
              <Square className="w-4 h-4 mr-2" />
              Rectangle
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg hover:bg-gray-50">
              <Circle className="w-4 h-4 mr-2" />
              Circle
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg hover:bg-gray-50">
              <Triangle className="w-4 h-4 mr-2" />
              Triangle
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg hover:bg-gray-50">
              <Minus className="w-4 h-4 mr-2" />
              Line
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Font Family Selector */}
        <Select value={selectedElement?.style?.fontFamily || "sans-serif"} onValueChange={handleFontChange}>
          <SelectTrigger className="w-32 h-8 text-sm border-gray-200 rounded-lg">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="sans-serif"
              className="hover:bg-gray-100 hover:text-black transition-colors data-[highlighted]:bg-gray-100 data-[highlighted]:text-black"
            >
              <span style={{ fontFamily: "sans-serif" }}>Sans Serif</span>
            </SelectItem>
            <SelectItem
              value="serif"
              className="hover:bg-gray-100 hover:text-black transition-colors data-[highlighted]:bg-gray-100 data-[highlighted]:text-black"
            >
              <span style={{ fontFamily: "serif" }}>Serif</span>
            </SelectItem>
            <SelectItem
              value="monospace"
              className="hover:bg-gray-100 hover:text-black transition-colors data-[highlighted]:bg-gray-100 data-[highlighted]:text-black"
            >
              <span style={{ fontFamily: "monospace" }}>Monospace</span>
            </SelectItem>
            <SelectItem
              value="Arial"
              className="hover:bg-gray-100 hover:text-black transition-colors data-[highlighted]:bg-gray-100 data-[highlighted]:text-black"
            >
              <span style={{ fontFamily: "Arial" }}>Arial</span>
            </SelectItem>
            <SelectItem
              value="Helvetica"
              className="hover:bg-gray-100 hover:text-black transition-colors data-[highlighted]:bg-gray-100 data-[highlighted]:text-black"
            >
              <span style={{ fontFamily: "Helvetica" }}>Helvetica</span>
            </SelectItem>
            <SelectItem
              value="Times New Roman"
              className="hover:bg-gray-100 hover:text-black transition-colors data-[highlighted]:bg-gray-100 data-[highlighted]:text-black"
            >
              <span style={{ fontFamily: "Times New Roman" }}>Times</span>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Font Size Selector */}
        <Select value={selectedElement?.style?.fontSize?.toString() || "16"} onValueChange={handleFontSizeChange}>
          <SelectTrigger className="w-20 h-8 text-sm border-gray-200 rounded-lg">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="8" className="hover:bg-gray-100 hover:text-black transition-colors">
              8
            </SelectItem>
            <SelectItem value="10" className="hover:bg-gray-100 hover:text-black transition-colors">
              10
            </SelectItem>
            <SelectItem value="12" className="hover:bg-gray-100 hover:text-black transition-colors">
              12
            </SelectItem>
            <SelectItem value="14" className="hover:bg-gray-100 hover:text-black transition-colors">
              14
            </SelectItem>
            <SelectItem value="16" className="hover:bg-gray-100 hover:text-black transition-colors">
              16
            </SelectItem>
            <SelectItem value="18" className="hover:bg-gray-100 hover:text-black transition-colors">
              18
            </SelectItem>
            <SelectItem value="20" className="hover:bg-gray-100 hover:text-black transition-colors">
              20
            </SelectItem>
            <SelectItem value="24" className="hover:bg-gray-100 hover:text-black transition-colors">
              24
            </SelectItem>
            <SelectItem value="28" className="hover:bg-gray-100 hover:text-black transition-colors">
              28
            </SelectItem>
            <SelectItem value="32" className="hover:bg-gray-100 hover:text-black transition-colors">
              32
            </SelectItem>
            <SelectItem value="36" className="hover:bg-gray-100 hover:text-black transition-colors">
              36
            </SelectItem>
            <SelectItem value="48" className="hover:bg-gray-100 hover:text-black transition-colors">
              48
            </SelectItem>
            <SelectItem value="72" className="hover:bg-gray-100 hover:text-black transition-colors">
              72
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Size Label */}
        <span className="text-sm text-gray-500 font-medium">Medium</span>
      </div>

      <Separator orientation="vertical" className="h-6 bg-gray-200" />

      {/* Text Formatting */}
      <div className="flex items-center gap-1">
        <Button
          variant={selectedElement?.style?.fontWeight === "bold" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleTextFormat("bold")}
          className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant={selectedElement?.style?.fontStyle === "italic" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleTextFormat("italic")}
          className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant={selectedElement?.style?.textAlign === "left" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleTextFormat("align-left")}
          className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          variant={selectedElement?.style?.textAlign === "center" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleTextFormat("align-center")}
          className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          variant={selectedElement?.style?.textAlign === "right" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleTextFormat("align-right")}
          className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
        >
          <AlignRight className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 bg-gray-200" />

      {/* Color Controls */}
      <div className="flex items-center gap-2">
        {/* Fill Color */}
        <div className="flex items-center gap-1">
          <div
            className="w-6 h-6 rounded border border-gray-200 cursor-pointer"
            style={{ backgroundColor: selectedElement?.style?.fill || currentStyle?.fillColor || "#000000" }}
            onClick={() => document.getElementById("fill-color-picker")?.click()}
          />
          <input
            id="fill-color-picker"
            type="color"
            value={selectedElement?.style?.fill || currentStyle?.fillColor || "#000000"}
            onChange={(e) => handleColorChange(e.target.value, "fill")}
            className="sr-only"
          />
        </div>

        {/* Stroke Color */}
        <div className="flex items-center gap-1">
          <div
            className="w-6 h-6 rounded border border-gray-200 cursor-pointer"
            style={{ backgroundColor: selectedElement?.style?.stroke || currentStyle?.strokeColor || "#000000" }}
            onClick={() => document.getElementById("stroke-color-picker")?.click()}
          />
          <input
            id="stroke-color-picker"
            type="color"
            value={selectedElement?.style?.stroke || currentStyle?.strokeColor || "#000000"}
            onChange={(e) => handleColorChange(e.target.value, "stroke")}
            className="sr-only"
          />
        </div>

        {/* Stroke Width Selector */}
        <Select
          value={selectedElement?.style?.strokeWidth?.toString() || "2"}
          onValueChange={(value) => updateSelectedElementStyle({ strokeWidth: Number.parseInt(value) })}
        >
          <SelectTrigger className="w-16 h-8 text-sm border-gray-200 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1px</SelectItem>
            <SelectItem value="2">2px</SelectItem>
            <SelectItem value="3">3px</SelectItem>
            <SelectItem value="4">4px</SelectItem>
            <SelectItem value="6">6px</SelectItem>
            <SelectItem value="8">8px</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator orientation="vertical" className="h-6 bg-gray-200" />

      {/* Task Button */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-3 rounded-lg border-gray-200 hover:bg-gray-50 bg-white text-gray-700 font-medium"
      >
        Task
      </Button>

      <div className="flex-1" />

      {/* Selection Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSelectAll}
          className="h-8 px-3 rounded-lg border-gray-200 hover:bg-gray-50 bg-white text-gray-700 font-medium"
        >
          <MousePointer2 className="w-4 h-4 mr-2" />
          Select All
        </Button>

        {selectedCount > 0 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onCopy}
              className="h-8 px-3 rounded-lg border-gray-200 hover:bg-gray-50 bg-white text-gray-700 font-medium"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onPaste}
              className="h-8 px-3 rounded-lg border-gray-200 hover:bg-gray-50 bg-white text-gray-700 font-medium"
            >
              <Clipboard className="w-4 h-4 mr-2" />
              Paste
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="h-8 px-3 rounded-lg border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 bg-white font-medium"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </>
        )}
      </div>

      <Separator orientation="vertical" className="h-6 bg-gray-200" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-sm text-gray-600 min-w-16 text-center font-medium">{Math.round(zoom || 100)}%</span>
        <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFitToScreen}
          className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
        >
          <Maximize className="w-4 h-4" />
        </Button>
      </div>

      {/* Selection Info */}
      {selectedCount > 0 && (
        <>
          <Separator orientation="vertical" className="h-6 bg-gray-200" />
          <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200 rounded-lg">
            {selectedCount} selected
          </Badge>
        </>
      )}
    </div>
  )
}
