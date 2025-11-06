"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Square,
  Circle,
  Triangle,
  Diamond,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Minus,
  Hash,
  Type,
} from "lucide-react"

interface FormattingToolbarProps {
  selectedShapes: any[]
  onStyleChange: (property: string, value: any) => void
  position: { x: number; y: number }
  visible: boolean
}

const shapeOptions = [
  { value: "rectangle", label: "Rectangle", icon: Square },
  { value: "ellipse", label: "Circle", icon: Circle },
  { value: "triangle", label: "Triangle", icon: Triangle },
  { value: "diamond", label: "Diamond", icon: Diamond },
  { value: "arrow-right", label: "Arrow", icon: Minus },
]

const fontFamilies = [
  { value: "sans", label: "Sans Serif", displayFont: "Inter, system-ui, sans-serif" },
  { value: "serif", label: "Serif", displayFont: "Times New Roman, serif" },
  { value: "mono", label: "Monospace", displayFont: "Monaco, Consolas, monospace" },
  { value: "draw", label: "Hand Drawn", displayFont: "Comic Sans MS, cursive" },
  { value: "sans", label: "Arial", displayFont: "Arial, sans-serif" },
  { value: "serif", label: "Georgia", displayFont: "Georgia, serif" },
  { value: "mono", label: "Courier", displayFont: "Courier New, monospace" },
  { value: "sans", label: "Helvetica", displayFont: "Helvetica, Arial, sans-serif" },
]

const fontSizes = [
  { value: "xs", label: "8", size: 8 },
  { value: "xs", label: "10", size: 10 },
  { value: "s", label: "12", size: 12 },
  { value: "s", label: "14", size: 14 },
  { value: "m", label: "16", size: 16 },
  { value: "m", label: "18", size: 18 },
  { value: "l", label: "20", size: 20 },
  { value: "l", label: "22", size: 22 },
  { value: "xl", label: "24", size: 24 },
]

const colorPalette = [
  { hex: "#000000", tldraw: "black", label: "Black" },
  { hex: "#6b7280", tldraw: "grey", label: "Grey" },
  { hex: "#ffffff", tldraw: "white", label: "White" },
  { hex: "#dc2626", tldraw: "red", label: "Red" },
  { hex: "#f87171", tldraw: "light-red", label: "Light Red" },
  { hex: "#ea580c", tldraw: "orange", label: "Orange" },
  { hex: "#eab308", tldraw: "yellow", label: "Yellow" },
  { hex: "#16a34a", tldraw: "green", label: "Green" },
  { hex: "#86efac", tldraw: "light-green", label: "Light Green" },
  { hex: "#2563eb", tldraw: "blue", label: "Blue" },
  { hex: "#93c5fd", tldraw: "light-blue", label: "Light Blue" },
  { hex: "#7c3aed", tldraw: "violet", label: "Violet" },
  { hex: "#c4b5fd", tldraw: "light-violet", label: "Light Violet" },
]

const tldrawColorToHex = (tldrawColor: string): string => {
  const colorMatch = colorPalette.find((color) => color.tldraw === tldrawColor)
  return colorMatch ? colorMatch.hex : "#000000"
}

export function FormattingToolbar({ selectedShapes, onStyleChange, position, visible }: FormattingToolbarProps) {
  const [currentShape, setCurrentShape] = useState("rectangle")
  const [currentFont, setCurrentFont] = useState("sans")
  const [currentFontSize, setCurrentFontSize] = useState("s")
  const [fontColor, setFontColor] = useState("black")
  const [borderColor, setBorderColor] = useState("black")
  const [backgroundColor, setBackgroundColor] = useState("white")
  const [currentFillType, setCurrentFillType] = useState("none")
  const [opacity, setOpacity] = useState([100])
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [textAlign, setTextAlign] = useState("center")

  useEffect(() => {
    if (selectedShapes.length > 0) {
      const shape = selectedShapes[0]
      if (shape.props) {
        setCurrentShape(shape.props.geo || "rectangle")
        setCurrentFont(shape.props.font || "sans")
        setCurrentFontSize(shape.props.size || "s")
        setFontColor(shape.props.color || "black")
        setBorderColor(shape.props.color || "black")
        setBackgroundColor(shape.props.color || "white")
        setCurrentFillType(shape.props.fill || "none")
        setOpacity([100])
        setTextAlign(shape.props.align || "center")
      }
    }
  }, [selectedShapes])

  if (!visible || selectedShapes.length === 0) {
    return null
  }

  const ColorPicker = ({
    value,
    onChange,
    label,
    tooltip,
  }: {
    value: string
    onChange: (color: string) => void
    label: string
    tooltip: string
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border border-gray-200 hover:bg-gray-50">
              <div
                className="w-5 h-5 rounded border border-gray-300"
                style={{ backgroundColor: tldrawColorToHex(value) }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" side="top">
            <div className="space-y-3">
              <Label className="text-xs font-medium">{label}</Label>
              <div className="grid grid-cols-4 gap-2">
                {colorPalette.map((color) => (
                  <button
                    key={color.tldraw}
                    className="w-8 h-8 rounded border border-gray-200 hover:border-gray-400 hover:scale-110 transition-all flex items-center justify-center"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => onChange(color.tldraw)}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )

  return (
    <TooltipProvider>
      <div
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-1"
        style={{
          left: position.x,
          top: position.y - 60,
          transform: "translateX(-50%)",
        }}
      >
        {/* Shape Selector */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Select
              value={currentShape}
              onValueChange={(value) => {
                setCurrentShape(value)
                onStyleChange("geo", value)
              }}
            >
              <SelectTrigger className="w-12 h-8 p-1 border-gray-200">
                {(() => {
                  const ShapeIcon = shapeOptions.find((s) => s.value === currentShape)?.icon || Square
                  return <ShapeIcon className="w-4 h-4" />
                })()}
              </SelectTrigger>
              <SelectContent>
                {shapeOptions.map((shape) => {
                  const Icon = shape.icon
                  return (
                    <SelectItem key={shape.value} value={shape.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {shape.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </TooltipTrigger>
          <TooltipContent>
            <p>Change shape type</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Font Family */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Type className="w-4 h-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Font family</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Select
                value={currentFont}
                onValueChange={(value) => {
                  setCurrentFont(value)
                  onStyleChange("font", value)
                }}
              >
                <SelectTrigger className="w-24 h-8 text-xs border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font, index) => (
                    <SelectItem key={`${font.value}-${index}`} value={font.value}>
                      <span style={{ fontFamily: font.displayFont }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TooltipTrigger>
            <TooltipContent>
              <p>Change font type</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Hash className="w-4 h-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Font size</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Select
                value={currentFontSize}
                onValueChange={(value) => {
                  setCurrentFontSize(value)
                  onStyleChange("size", value)
                }}
              >
                <SelectTrigger className="w-16 h-8 text-xs border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontSizes.map((size, index) => (
                    <SelectItem key={`${size.value}-${index}`} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TooltipTrigger>
            <TooltipContent>
              <p>Change font size (8-24px)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text Alignment */}
        <div className="flex items-center gap-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={textAlign === "start" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setTextAlign("start")
                  onStyleChange("align", "start")
                }}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align left</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={textAlign === "middle" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setTextAlign("middle")
                  onStyleChange("align", "middle")
                }}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align center</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={textAlign === "end" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setTextAlign("end")
                  onStyleChange("align", "end")
                }}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align right</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Font Color */}
        <ColorPicker
          value={fontColor}
          onChange={(color) => {
            setFontColor(color)
            onStyleChange("color", color)
          }}
          label="Font Color"
          tooltip="Change text color"
        />

        {/* Border/Line Color */}
        <ColorPicker
          value={borderColor}
          onChange={(color) => {
            setBorderColor(color)
            onStyleChange("color", color)
          }}
          label="Border Color"
          tooltip="Change border/line color"
        />

        {/* Background Color */}
        <ColorPicker
          value={backgroundColor}
          onChange={(color) => {
            setBackgroundColor(color)
            setCurrentFillType("solid")
            onStyleChange("fill", "solid")
            // For background, we need to set a different property
            setTimeout(() => {
              onStyleChange("color", color)
            }, 10)
          }}
          label="Background Color"
          tooltip="Change background fill color"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text Formatting */}
        <div className="flex items-center gap-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isBold ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setIsBold(!isBold)
                  // TLDraw doesn't have bold, so we'll use dash style as a visual indicator
                  onStyleChange("dash", !isBold ? "dashed" : "solid")
                }}
              >
                <Bold className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bold text (dash style)</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isItalic ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setIsItalic(!isItalic)
                  // TLDraw doesn't have italic, visual feedback only
                }}
              >
                <Italic className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Italic text (visual only)</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isUnderline ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setIsUnderline(!isUnderline)
                  // TLDraw doesn't have underline, visual feedback only
                }}
              >
                <Underline className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Underline text (visual only)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 border border-gray-200">
                  <Palette className="w-4 h-4 mr-1" />
                  <span className="text-xs">{opacity[0]}%</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-3" side="top">
                <div className="space-y-3">
                  <Label className="text-xs font-medium">Opacity</Label>
                  <Slider
                    value={opacity}
                    onValueChange={(value) => {
                      setOpacity(value)
                      // Map opacity to TLDraw fill types
                      if (value[0] === 0) {
                        onStyleChange("fill", "none")
                      } else if (value[0] < 50) {
                        onStyleChange("fill", "semi")
                      } else {
                        onStyleChange("fill", "solid")
                      }
                    }}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 text-center">{opacity[0]}%</div>
                </div>
              </PopoverContent>
            </Popover>
          </TooltipTrigger>
          <TooltipContent>
            <p>Adjust fill opacity</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
