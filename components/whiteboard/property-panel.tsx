"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Settings,
  Trash2,
  Copy,
  Lock,
  Eye,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
} from "lucide-react"
import type { WhiteboardElement } from "@/types/whiteboard"

interface PropertyPanelProps {
  selectedElements: string[]
  elements: WhiteboardElement[]
  onElementsChange: (elements: WhiteboardElement[]) => void
  onClose: () => void
}

export function PropertyPanel({ selectedElements, elements, onElementsChange, onClose }: PropertyPanelProps) {
  const selectedElement = elements.find((el) => selectedElements.includes(el.id))

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ width: 100, height: 100 })
  const [rotation, setRotation] = useState(0)
  const [opacity, setOpacity] = useState(100)
  const [fillColor, setFillColor] = useState("#3b82f6")
  const [strokeColor, setStrokeColor] = useState("#374151")
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState("sans-serif")
  const [fontWeight, setFontWeight] = useState("normal")
  const [textAlign, setTextAlign] = useState("center")
  const [content, setContent] = useState("")
  const [isLocked, setIsLocked] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (selectedElement) {
      setPosition({ x: selectedElement.x, y: selectedElement.y })
      setSize({ width: selectedElement.width, height: selectedElement.height })
      setRotation(selectedElement.rotation)
      setOpacity(selectedElement.style.opacity * 100)
      setFillColor(selectedElement.style.fill)
      setStrokeColor(selectedElement.style.stroke)
      setStrokeWidth(selectedElement.style.strokeWidth)
      setFontSize(selectedElement.style.fontSize)
      setFontFamily(selectedElement.style.fontFamily)
      setFontWeight(selectedElement.style.fontWeight)
      setTextAlign(selectedElement.style.textAlign || "center")
      setContent(selectedElement.content)
      setIsLocked(selectedElement.locked)
      setIsVisible(true)
    }
  }, [selectedElement])

  const updateSelectedElements = (updates: Partial<WhiteboardElement>) => {
    const newElements = elements.map((element) =>
      selectedElements.includes(element.id) ? { ...element, ...updates, updatedAt: new Date() } : element,
    )
    onElementsChange(newElements)
  }

  const updateElementStyle = (styleUpdates: any) => {
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

  const handleDelete = () => {
    const newElements = elements.filter((el) => !selectedElements.includes(el.id))
    onElementsChange(newElements)
    onClose()
  }

  const handleDuplicate = () => {
    const selectedElementsData = elements.filter((el) => selectedElements.includes(el.id))
    const duplicatedElements = selectedElementsData.map((el) => ({
      ...el,
      id: `${el.type}-${Date.now()}-${Math.random()}`,
      x: el.x + 20,
      y: el.y + 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    onElementsChange([...elements, ...duplicatedElements])
  }

  if (!selectedElement) {
    return (
      <Card className="w-80 shadow-lg bg-white border border-gray-200">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Select an object to edit its properties</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-80 shadow-lg bg-white border border-gray-200">
      <CardHeader className="pb-3 border-b border-gray-100">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Properties
          <Badge variant="outline" className="ml-auto text-xs bg-gray-50">
            {selectedElement.type}
          </Badge>
          <Button variant="ghost" size="sm" onClick={onClose} className="ml-2 h-6 w-6 p-0 hover:bg-gray-100">
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="style" className="text-xs">
              Style
            </TabsTrigger>
            <TabsTrigger value="transform" className="text-xs">
              Transform
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs">
              Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="space-y-4 mt-4">
            {/* Fill Color */}
            <div>
              <Label className="text-sm font-medium">Fill Color</Label>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                  style={{ backgroundColor: fillColor }}
                  onClick={() => document.getElementById("fill-color-input")?.click()}
                />
                <input
                  id="fill-color-input"
                  type="color"
                  value={fillColor}
                  onChange={(e) => {
                    setFillColor(e.target.value)
                    updateElementStyle({ fill: e.target.value })
                  }}
                  className="sr-only"
                />
                <Input
                  type="text"
                  value={fillColor}
                  onChange={(e) => {
                    setFillColor(e.target.value)
                    updateElementStyle({ fill: e.target.value })
                  }}
                  className="flex-1 text-sm h-8"
                />
              </div>
            </div>

            {/* Stroke Color */}
            <div>
              <Label className="text-sm font-medium">Stroke Color</Label>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                  style={{ backgroundColor: strokeColor }}
                  onClick={() => document.getElementById("stroke-color-input")?.click()}
                />
                <input
                  id="stroke-color-input"
                  type="color"
                  value={strokeColor}
                  onChange={(e) => {
                    setStrokeColor(e.target.value)
                    updateElementStyle({ stroke: e.target.value })
                  }}
                  className="sr-only"
                />
                <Input
                  type="text"
                  value={strokeColor}
                  onChange={(e) => {
                    setStrokeColor(e.target.value)
                    updateElementStyle({ stroke: e.target.value })
                  }}
                  className="flex-1 text-sm h-8"
                />
              </div>
            </div>

            {/* Stroke Width */}
            <div>
              <Label className="text-sm font-medium">Stroke Width</Label>
              <div className="flex items-center gap-3 mt-2">
                <Slider
                  value={[strokeWidth]}
                  onValueChange={(value) => {
                    setStrokeWidth(value[0])
                    updateElementStyle({ strokeWidth: value[0] })
                  }}
                  max={20}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 w-8">{strokeWidth}px</span>
              </div>
            </div>

            {/* Opacity */}
            <div>
              <Label className="text-sm font-medium">Opacity</Label>
              <div className="flex items-center gap-3 mt-2">
                <Slider
                  value={[opacity]}
                  onValueChange={(value) => {
                    setOpacity(value[0])
                    updateElementStyle({ opacity: value[0] / 100 })
                  }}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 w-10">{opacity}%</span>
              </div>
            </div>

            {/* Font Controls for text elements */}
            {(selectedElement.type === "text" || selectedElement.content) && (
              <>
                <div className="border-t border-gray-100 pt-4">
                  <Label className="text-sm font-medium">Typography</Label>
                </div>

                {/* Font Family */}
                <div>
                  <Label className="text-sm">Font Family</Label>
                  <Select
                    value={fontFamily}
                    onValueChange={(value) => {
                      setFontFamily(value)
                      updateElementStyle({ fontFamily: value })
                    }}
                  >
                    <SelectTrigger className="mt-1 h-8">
                      <SelectValue />
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
                        <span style={{ fontFamily: "Times New Roman" }}>Times New Roman</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Size */}
                <div>
                  <Label className="text-sm">Font Size</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <Slider
                      value={[fontSize]}
                      onValueChange={(value) => {
                        setFontSize(value[0])
                        updateElementStyle({ fontSize: value[0] })
                      }}
                      min={8}
                      max={72}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-8">{fontSize}px</span>
                  </div>
                </div>

                {/* Font Weight & Style */}
                <div className="flex gap-2">
                  <Button
                    variant={fontWeight === "bold" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newWeight = fontWeight === "bold" ? "normal" : "bold"
                      setFontWeight(newWeight)
                      updateElementStyle({ fontWeight: newWeight })
                    }}
                    className="flex-1 h-8"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 bg-transparent">
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 bg-transparent">
                    <Underline className="w-4 h-4" />
                  </Button>
                </div>

                {/* Text Alignment */}
                <div>
                  <Label className="text-sm">Text Alignment</Label>
                  <div className="flex gap-1 mt-1">
                    <Button
                      variant={textAlign === "left" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTextAlign("left")
                        updateElementStyle({ textAlign: "left" })
                      }}
                      className="flex-1 h-8"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={textAlign === "center" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTextAlign("center")
                        updateElementStyle({ textAlign: "center" })
                      }}
                      className="flex-1 h-8"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={textAlign === "right" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTextAlign("right")
                        updateElementStyle({ textAlign: "right" })
                      }}
                      className="flex-1 h-8"
                    >
                      <AlignRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="transform" className="space-y-4 mt-4">
            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm font-medium">X Position</Label>
                <Input
                  type="number"
                  value={position.x}
                  onChange={(e) => {
                    const newX = Number(e.target.value)
                    setPosition((prev) => ({ ...prev, x: newX }))
                    updateSelectedElements({ x: newX })
                  }}
                  className="mt-1 h-8"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Y Position</Label>
                <Input
                  type="number"
                  value={position.y}
                  onChange={(e) => {
                    const newY = Number(e.target.value)
                    setPosition((prev) => ({ ...prev, y: newY }))
                    updateSelectedElements({ y: newY })
                  }}
                  className="mt-1 h-8"
                />
              </div>
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm font-medium">Width</Label>
                <Input
                  type="number"
                  value={size.width}
                  onChange={(e) => {
                    const newWidth = Number(e.target.value)
                    setSize((prev) => ({ ...prev, width: newWidth }))
                    updateSelectedElements({ width: newWidth })
                  }}
                  className="mt-1 h-8"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Height</Label>
                <Input
                  type="number"
                  value={size.height}
                  onChange={(e) => {
                    const newHeight = Number(e.target.value)
                    setSize((prev) => ({ ...prev, height: newHeight }))
                    updateSelectedElements({ height: newHeight })
                  }}
                  className="mt-1 h-8"
                />
              </div>
            </div>

            {/* Rotation */}
            <div>
              <Label className="text-sm font-medium">Rotation</Label>
              <div className="flex items-center gap-3 mt-2">
                <Slider
                  value={[rotation]}
                  onValueChange={(value) => {
                    setRotation(value[0])
                    updateSelectedElements({ rotation: value[0] })
                  }}
                  max={360}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 w-10">{rotation}°</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4 mt-4">
            {/* Text Content */}
            <div>
              <Label className="text-sm font-medium">Text Content</Label>
              <Textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  updateSelectedElements({ content: e.target.value })
                }}
                className="mt-2 min-h-[80px]"
                placeholder="Enter text content..."
              />
            </div>

            {/* Link */}
            <div>
              <Label className="text-sm font-medium">Link URL</Label>
              <Input type="url" placeholder="https://example.com" className="mt-2 h-8" />
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={isLocked}
                onCheckedChange={(checked) => {
                  setIsLocked(checked)
                  updateSelectedElements({ locked: checked })
                }}
              />
              <Label className="text-sm flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Lock
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={isVisible}
                onCheckedChange={(checked) => {
                  setIsVisible(checked)
                }}
              />
              <Label className="text-sm flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Visible
              </Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 bg-white hover:bg-gray-50" onClick={handleDuplicate}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} className="hover:bg-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
