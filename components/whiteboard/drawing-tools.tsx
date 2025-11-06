"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Palette,
  Type,
  Square,
  Circle,
  Triangle,
  ArrowRight,
  Minus,
  Plus,
  Edit3,
  Eraser,
  StickyNote,
  ImageIcon,
} from "lucide-react"
import type { DrawingToolsProps } from "@/types/whiteboard"

const colors = [
  "#15803d", // green
  "#84cc16", // lime
  "#374151", // gray
  "#6b7280", // gray-500
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#374151", // gray
  "#000000", // black
  "#ffffff", // white
  "#fef3c7", // yellow-100 (sticky note)
]

const strokeWidths = [1, 2, 4, 6, 8, 12]

export function DrawingTools({ activeTool, onToolChange, onStyleChange }: DrawingToolsProps) {
  const [selectedFillColor, setSelectedFillColor] = useState("#15803d")
  const [selectedStrokeColor, setSelectedStrokeColor] = useState("#374151")
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [fillOpacity, setFillOpacity] = useState(100)
  const [fontSize, setFontSize] = useState(16)

  const handleFillColorChange = (color: string) => {
    setSelectedFillColor(color)
    onStyleChange({
      fillColor: color,
      strokeColor: selectedStrokeColor,
      strokeWidth,
      fillOpacity,
      fontSize,
    })
  }

  const handleStrokeColorChange = (color: string) => {
    setSelectedStrokeColor(color)
    onStyleChange({
      fillColor: selectedFillColor,
      strokeColor: color,
      strokeWidth,
      fillOpacity,
      fontSize,
    })
  }

  const handleStrokeWidthChange = (width: number) => {
    setStrokeWidth(width)
    onStyleChange({
      fillColor: selectedFillColor,
      strokeColor: selectedStrokeColor,
      strokeWidth: width,
      fillOpacity,
      fontSize,
    })
  }

  const handleOpacityChange = (opacity: number) => {
    setFillOpacity(opacity)
    onStyleChange({
      fillColor: selectedFillColor,
      strokeColor: selectedStrokeColor,
      strokeWidth,
      fillOpacity: opacity,
      fontSize,
    })
  }

  const handleFontSizeChange = (size: number) => {
    setFontSize(size)
    onStyleChange({
      fillColor: selectedFillColor,
      strokeColor: selectedStrokeColor,
      strokeWidth,
      fillOpacity,
      fontSize: size,
    })
  }

  return (
    <Card className="w-80 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Drawing Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="shapes">Shapes</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Drawing Tools</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={activeTool === "pen" ? "default" : "outline"}
                  className="h-16 flex flex-col gap-1"
                  onClick={() => onToolChange("pen")}
                >
                  <Edit3 className="w-6 h-6" />
                  <span className="text-xs">Pen</span>
                </Button>
                <Button
                  variant={activeTool === "eraser" ? "default" : "outline"}
                  className="h-16 flex flex-col gap-1"
                  onClick={() => onToolChange("eraser")}
                >
                  <Eraser className="w-6 h-6" />
                  <span className="text-xs">Eraser</span>
                </Button>
                <Button
                  variant={activeTool === "line" ? "default" : "outline"}
                  className="h-16 flex flex-col gap-1"
                  onClick={() => onToolChange("line")}
                >
                  <Minus className="w-6 h-6" />
                  <span className="text-xs">Line</span>
                </Button>
                <Button
                  variant={activeTool === "sticky-note" ? "default" : "outline"}
                  className="h-16 flex flex-col gap-1"
                  onClick={() => onToolChange("sticky-note")}
                >
                  <StickyNote className="w-6 h-6" />
                  <span className="text-xs">Note</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            {/* Fill Color Palette */}
            <div>
              <Label className="text-sm font-medium">Fill Color</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {colors.map((color) => (
                  <button
                    key={`fill-${color}`}
                    className={`w-8 h-8 rounded-md border-2 transition-all ${
                      selectedFillColor === color ? "border-accent scale-110" : "border-border"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleFillColorChange(color)}
                    title={`Fill: ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Color Palette */}
            <div>
              <Label className="text-sm font-medium">Stroke Color</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {colors.map((color) => (
                  <button
                    key={`stroke-${color}`}
                    className={`w-8 h-8 rounded-md border-2 transition-all ${
                      selectedStrokeColor === color ? "border-accent scale-110" : "border-border"
                    } relative`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleStrokeColorChange(color)}
                    title={`Stroke: ${color}`}
                  >
                    {selectedStrokeColor === color && (
                      <div className="absolute inset-1 border-2 border-white rounded-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Stroke Width */}
            <div>
              <Label className="text-sm font-medium">Stroke Width</Label>
              <div className="flex items-center gap-2 mt-2">
                {strokeWidths.map((width) => (
                  <Button
                    key={width}
                    variant={strokeWidth === width ? "default" : "outline"}
                    size="sm"
                    className="w-10 h-10 p-0"
                    onClick={() => handleStrokeWidthChange(width)}
                  >
                    <div
                      className="bg-current rounded-full"
                      style={{ width: `${Math.min(width, 8)}px`, height: `${Math.min(width, 8)}px` }}
                    />
                  </Button>
                ))}
              </div>
            </div>

            {/* Opacity */}
            <div>
              <Label className="text-sm font-medium">Fill Opacity</Label>
              <div className="flex items-center gap-3 mt-2">
                <Slider
                  value={[fillOpacity]}
                  onValueChange={(value) => handleOpacityChange(value[0])}
                  max={100}
                  step={10}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-10">{fillOpacity}%</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shapes" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={activeTool === "rectangle" ? "default" : "outline"}
                className="h-16 flex flex-col gap-1"
                onClick={() => onToolChange("rectangle")}
              >
                <Square className="w-6 h-6" />
                <span className="text-xs">Rectangle</span>
              </Button>
              <Button
                variant={activeTool === "circle" ? "default" : "outline"}
                className="h-16 flex flex-col gap-1"
                onClick={() => onToolChange("circle")}
              >
                <Circle className="w-6 h-6" />
                <span className="text-xs">Circle</span>
              </Button>
              <Button
                variant={activeTool === "triangle" ? "default" : "outline"}
                className="h-16 flex flex-col gap-1"
                onClick={() => onToolChange("triangle")}
              >
                <Triangle className="w-6 h-6" />
                <span className="text-xs">Triangle</span>
              </Button>
              <Button
                variant={activeTool === "arrow" ? "default" : "outline"}
                className="h-16 flex flex-col gap-1"
                onClick={() => onToolChange("arrow")}
              >
                <ArrowRight className="w-6 h-6" />
                <span className="text-xs">Arrow</span>
              </Button>
            </div>

            <div>
              <Label className="text-sm font-medium">Quick Shapes</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button variant="outline" size="sm" className="text-xs bg-transparent">
                  Flowchart
                </Button>
                <Button variant="outline" size="sm" className="text-xs bg-transparent">
                  Mind Map
                </Button>
                <Button variant="outline" size="sm" className="text-xs bg-transparent">
                  Org Chart
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Font Size</Label>
              <div className="flex items-center gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => handleFontSizeChange(Math.max(8, fontSize - 2))}>
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                  className="w-16 text-center"
                  min="8"
                  max="72"
                />
                <Button variant="outline" size="sm" onClick={() => handleFontSizeChange(Math.min(72, fontSize + 2))}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Text Tools</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={activeTool === "text" ? "default" : "outline"}
                  className="h-12 flex flex-col gap-1"
                  onClick={() => onToolChange("text")}
                >
                  <Type className="w-5 h-5" />
                  <span className="text-xs">Text</span>
                </Button>
                <Button
                  variant={activeTool === "image" ? "default" : "outline"}
                  className="h-12 flex flex-col gap-1"
                  onClick={() => onToolChange("image")}
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-xs">Image</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
