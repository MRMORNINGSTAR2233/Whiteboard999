"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  X,
  Palette,
  Brush,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  ImageIcon,
  Upload,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface StylePanelProps {
  onClose: () => void
  selectedShapes: any[]
  onStyleChange: (property: string, value: any) => void
  onImageUpload: (file: File) => void
}

const colorPalette = [
  "#000000",
  "#1a1a1a",
  "#333333",
  "#4d4d4d",
  "#666666",
  "#808080",
  "#999999",
  "#b3b3b3",
  "#cccccc",
  "#e6e6e6",
  "#f5f5f5",
  "#ffffff",
  "#ff0000",
  "#ff3333",
  "#ff6666",
  "#ff9999",
  "#ffcccc",
  "#ffeeee",
  "#374151", // gray-700 instead of orange
  "#4b5563", // gray-600 instead of orange
  "#6b7280", // gray-500 instead of orange
  "#9ca3af", // gray-400 instead of orange
  "#d1d5db", // gray-300 instead of orange
  "#f3f4f6", // gray-100 instead of orange
  "#fbbf24", // yellow-400 (keeping one yellow for sticky notes)
  "#fcd34d", // yellow-300
  "#fde68a", // yellow-200
  "#fef3c7", // yellow-100
  "#fffbeb", // yellow-50
  "#f9fafb", // gray-50
  "#22c55e", // green-500 instead of lime-green
  "#4ade80", // green-400
  "#86efac", // green-300
  "#bbf7d0", // green-200
  "#dcfce7", // green-100
  "#f0fdf4", // green-50
  "#00ff00",
  "#33ff33",
  "#66ff66",
  "#99ff99",
  "#ccffcc",
  "#eeffee",
  "#10b981", // emerald-500 instead of teal
  "#34d399", // emerald-400
  "#6ee7b7", // emerald-300
  "#a7f3d0", // emerald-200
  "#d1fae5", // emerald-100
  "#ecfdf5", // emerald-50
  "#00ffff",
  "#33ffff",
  "#66ffff",
  "#99ffff",
  "#ccffff",
  "#eeffff",
  "#3b82f6", // blue-500
  "#60a5fa", // blue-400
  "#93c5fd", // blue-300
  "#bfdbfe", // blue-200
  "#dbeafe", // blue-100
  "#eff6ff", // blue-50
  "#0000ff",
  "#3333ff",
  "#6666ff",
  "#9999ff",
  "#ccccff",
  "#eeeeff",
  "#8b5cf6", // violet-500
  "#a78bfa", // violet-400
  "#c4b5fd", // violet-300
  "#ddd6fe", // violet-200
  "#ede9fe", // violet-100
  "#f5f3ff", // violet-50
  "#ff00ff",
  "#ff33ff",
  "#ff66ff",
  "#ff99ff",
  "#ffccff",
  "#ffeeff",
  "#ec4899", // pink-500
  "#f472b6", // pink-400
  "#f9a8d4", // pink-300
  "#fbcfe8", // pink-200
  "#fce7f3", // pink-100
  "#fdf2f8", // pink-50
]

const fontFamilies = [
  { value: "Inter", label: "Inter", category: "Sans Serif", preview: "Aa" },
  { value: "Roboto", label: "Roboto", category: "Sans Serif", preview: "Aa" },
  { value: "Open Sans", label: "Open Sans", category: "Sans Serif", preview: "Aa" },
  { value: "Lato", label: "Lato", category: "Sans Serif", preview: "Aa" },
  { value: "Poppins", label: "Poppins", category: "Sans Serif", preview: "Aa" },
  { value: "Montserrat", label: "Montserrat", category: "Sans Serif", preview: "Aa" },
  { value: "Source Sans Pro", label: "Source Sans Pro", category: "Sans Serif", preview: "Aa" },
  { value: "Nunito", label: "Nunito", category: "Sans Serif", preview: "Aa" },
  { value: "Raleway", label: "Raleway", category: "Sans Serif", preview: "Aa" },
  { value: "Ubuntu", label: "Ubuntu", category: "Sans Serif", preview: "Aa" },
  { value: "Roboto Mono", label: "Roboto Mono", category: "Monospace", preview: "Aa" },
  { value: "Fira Code", label: "Fira Code", category: "Monospace", preview: "Aa" },
  { value: "JetBrains Mono", label: "JetBrains Mono", category: "Monospace", preview: "Aa" },
  { value: "Source Code Pro", label: "Source Code Pro", category: "Monospace", preview: "Aa" },
  { value: "Playfair Display", label: "Playfair Display", category: "Serif", preview: "Aa" },
  { value: "Merriweather", label: "Merriweather", category: "Serif", preview: "Aa" },
  { value: "Crimson Text", label: "Crimson Text", category: "Serif", preview: "Aa" },
  { value: "Libre Baskerville", label: "Libre Baskerville", category: "Serif", preview: "Aa" },
  { value: "Dancing Script", label: "Dancing Script", category: "Handwriting", preview: "Aa" },
  { value: "Pacifico", label: "Pacifico", category: "Handwriting", preview: "Aa" },
]

const fontSizes = [
  { value: 8, label: "8px", category: "Tiny" },
  { value: 10, label: "10px", category: "Small" },
  { value: 12, label: "12px", category: "Small" },
  { value: 14, label: "14px", category: "Regular" },
  { value: 16, label: "16px", category: "Regular" },
  { value: 18, label: "18px", category: "Regular" },
  { value: 20, label: "20px", category: "Large" },
  { value: 24, label: "24px", category: "Large" },
  { value: 28, label: "28px", category: "Large" },
  { value: 32, label: "32px", category: "Extra Large" },
  { value: 36, label: "36px", category: "Extra Large" },
  { value: 48, label: "48px", category: "Huge" },
  { value: 64, label: "64px", category: "Huge" },
  { value: 72, label: "72px", category: "Huge" },
]

export function StylePanel({ onClose, selectedShapes, onStyleChange, onImageUpload }: StylePanelProps) {
  const [fillColor, setFillColor] = useState("#3b82f6")
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [strokeWidth, setStrokeWidth] = useState([2])
  const [opacity, setOpacity] = useState([100])
  const [fontFamily, setFontFamily] = useState("Inter")
  const [fontSize, setFontSize] = useState(16)
  const [textAlign, setTextAlign] = useState("center")
  const [fontWeight, setFontWeight] = useState("normal")
  const [fontStyle, setFontStyle] = useState("normal")

  useEffect(() => {
    if (selectedShapes.length > 0) {
      const shape = selectedShapes[0]
      if (shape.props) {
        setFillColor(shape.props.color || "#3b82f6")
        setStrokeColor(shape.props.color || "#000000") // Use color instead of strokeColor since TLDraw doesn't have strokeColor
        const sizeToStrokeWidth = {
          s: 2,
          m: 4,
          l: 8,
          xl: 16,
        }
        setStrokeWidth([sizeToStrokeWidth[shape.props.size as keyof typeof sizeToStrokeWidth] || 4])
        setOpacity([shape.props.opacity ? shape.props.opacity * 100 : 100]) // Convert opacity from 0-1 to 0-100
        setFontFamily(shape.props.fontFamily || "Inter")
        setFontSize(shape.props.size || 16)
        setTextAlign(shape.props.align || "center")
      }
    }
  }, [selectedShapes])

  const handleColorChange = (type: "fill" | "stroke", color: string) => {
    if (type === "fill") {
      setFillColor(color)
      onStyleChange("color", color)
    } else {
      setStrokeColor(color)
      onStyleChange("color", color) // Use color instead of strokeColor since TLDraw uses color for both fill and stroke
    }
  }

  const ColorPicker = ({
    value,
    onChange,
    label,
  }: { value: string; onChange: (color: string) => void; label: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 bg-transparent hover:bg-gray-100 hover:text-black transition-all duration-200 hover:border-gray-300"
        >
          <div className="w-5 h-5 rounded-md border-2 border-gray-200 shadow-sm" style={{ backgroundColor: value }} />
          <span className="text-sm">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" side="top">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Choose Color</h4>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border-2 border-gray-200" style={{ backgroundColor: value }} />
              <span className="text-xs font-mono text-muted-foreground">{value}</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-1 p-3 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
            {colorPalette.map((color, index) => (
              <button
                key={`${color}-${index}`}
                className="w-6 h-6 rounded border-2 border-gray-300 hover:border-black hover:scale-110 hover:shadow-lg transition-all duration-200 cursor-pointer relative"
                style={{ backgroundColor: color }}
                onClick={() => onChange(color)}
                title={color}
              >
                {/* Add white border for light colors to make them visible */}
                {(color === "#ffffff" || color === "#f5f5f5" || color === "#e6e6e6") && (
                  <div className="absolute inset-0 border border-gray-400 rounded" />
                )}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Custom Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-12 h-8 p-0 border-0 rounded cursor-pointer hover:scale-105 transition-transform duration-200"
              />
              <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                className="flex-1 text-xs font-mono hover:border-gray-300 focus:border-gray-400 transition-colors duration-200"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      onImageUpload(file)
    }
  }

  return (
    <div className="w-80 h-full bg-background border-l border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Style Panel
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="hover:bg-gray-100 hover:text-black transition-all duration-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {selectedShapes.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select shapes to edit their style</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{selectedShapes.length} selected</Badge>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Media
              </h4>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Upload Image</Label>
                  <div className="mt-2">
                    <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:text-black hover:border-gray-400 transition-all duration-200">
                      <div className="flex flex-col items-center">
                        <Upload className="h-6 w-6 mb-1" />
                        <span className="text-xs">Click to upload image</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Properties</h4>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Line Thickness</Label>
                  <Slider
                    value={strokeWidth}
                    onValueChange={(value) => {
                      setStrokeWidth(value)
                      onStyleChange("strokeWidth", value[0])
                    }}
                    max={20}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">{strokeWidth[0]}px</div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Opacity</Label>
                  <Slider
                    value={opacity}
                    onValueChange={(value) => {
                      setOpacity(value)
                      onStyleChange("opacity", value[0] / 100)
                    }}
                    max={100}
                    min={0}
                    step={5}
                    className="mt-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">{opacity[0]}%</div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Brush className="h-4 w-4" />
                Colors
              </h4>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Shape Color</Label>
                  <div className="mt-1">
                    <ColorPicker
                      value={fillColor}
                      onChange={(color) => handleColorChange("fill", color)}
                      label="Color"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Typography</h4>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Font Family</Label>
                  <Select
                    value={fontFamily}
                    onValueChange={(value) => {
                      setFontFamily(value)
                      onStyleChange("fontFamily", value)
                    }}
                  >
                    <SelectTrigger className="mt-1 hover:bg-gray-100 hover:text-black hover:border-gray-300 transition-all duration-200">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {["Sans Serif", "Serif", "Monospace", "Handwriting"].map((category) => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50">
                            {category}
                          </div>
                          {fontFamilies
                            .filter((font) => font.category === category)
                            .map((font) => (
                              <SelectItem
                                key={font.value}
                                value={font.value}
                                className="hover:bg-gray-100 hover:text-black transition-all duration-200"
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span style={{ fontFamily: font.value }}>{font.label}</span>
                                  <span className="text-lg ml-4" style={{ fontFamily: font.value }}>
                                    {font.preview}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Font Size</Label>
                  <Select
                    value={fontSize.toString()}
                    onValueChange={(value) => {
                      const size = Number.parseInt(value)
                      setFontSize(size)
                      onStyleChange("size", size)
                    }}
                  >
                    <SelectTrigger className="mt-1 hover:bg-gray-100 hover:text-black hover:border-gray-300 transition-all duration-200">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {["Tiny", "Small", "Regular", "Large", "Extra Large", "Huge"].map((category) => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50">
                            {category}
                          </div>
                          {fontSizes
                            .filter((size) => size.category === category)
                            .map((size) => (
                              <SelectItem
                                key={size.value}
                                value={size.value.toString()}
                                className="hover:bg-gray-100 hover:text-black transition-all duration-200"
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{size.label}</span>
                                  <span className="text-xs text-muted-foreground ml-2">{size.value}px</span>
                                </div>
                              </SelectItem>
                            ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Text Alignment</Label>
                  <div className="flex gap-1 mt-1">
                    <Button
                      variant={textAlign === "left" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTextAlign("left")
                        onStyleChange("align", "left")
                      }}
                      className="hover:bg-gray-100 hover:text-black transition-all duration-200"
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={textAlign === "center" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTextAlign("center")
                        onStyleChange("align", "center")
                      }}
                      className="hover:bg-gray-100 hover:text-black transition-all duration-200"
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={textAlign === "right" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTextAlign("right")
                        onStyleChange("align", "right")
                      }}
                      className="hover:bg-gray-100 hover:text-black transition-all duration-200"
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Text Style</Label>
                  <div className="flex gap-1 mt-1">
                    <Button
                      variant={fontWeight === "bold" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newWeight = fontWeight === "bold" ? "normal" : "bold"
                        setFontWeight(newWeight)
                        onStyleChange("fontWeight", newWeight)
                      }}
                      className="hover:bg-gray-100 hover:text-black transition-all duration-200"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={fontStyle === "italic" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newStyle = fontStyle === "italic" ? "normal" : "italic"
                        setFontStyle(newStyle)
                        onStyleChange("fontStyle", newStyle)
                      }}
                      className="hover:bg-gray-100 hover:text-black transition-all duration-200"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
