"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LiveCursors } from "./live-cursors"
import { CommentMarkers } from "./comment-markers"
import { AIAssistant } from "./ai-assistant"
import { ElementContextMenu } from "./element-context-menu"
import { PropertyPanel } from "./property-panel"
import { Sparkles, Upload, StickyNote } from "lucide-react"
import type { WhiteboardElement, Comment, Tool } from "@/types/whiteboard"
import { getSafeTextColor } from "@/lib/contrast-utils"
import { Badge } from "@/components/ui/badge"

interface Cursor {
  id: string
  x: number
  y: number
  color: string
  userName: string
  userAvatar: string
}

const mockCursors: Cursor[] = []
const mockComments: Comment[] = []

interface WhiteboardCanvasProps {
  activeTool: Tool
  onToolChange: (tool: Tool) => void
  elements: WhiteboardElement[]
  onElementsChange: (elements: WhiteboardElement[]) => void
  selectedElements: string[]
  onSelectedElementsChange: (selectedIds: string[]) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  currentStyle: any
}

export function WhiteboardCanvas({
  activeTool,
  onToolChange,
  elements,
  onElementsChange,
  selectedElements,
  onSelectedElementsChange,
  zoom,
  onZoomChange,
  currentStyle,
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [comments, setComments] = useState(mockComments)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null)
  const [showPropertyPanel, setShowPropertyPanel] = useState(false)
  const [editingElement, setEditingElement] = useState<string | null>(null)
  const [textEditValue, setTextEditValue] = useState("")

  const [isDragging, setIsDragging] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [draggedElement, setDraggedElement] = useState<WhiteboardElement | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [drawingPath, setDrawingPath] = useState<{ x: number; y: number }[]>([])
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onSelectedElementsChange([])
        setContextMenu(null)
        setEditingElement(null)
        setShowPropertyPanel(false)
      }

      if (e.key === "Enter" && editingElement) {
        finishTextEditing()
      }

      // Duplicate with Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && selectedElements.length > 0) {
        e.preventDefault()
        duplicateSelectedElements()
      }

      // Lock/unlock with Ctrl+L
      if ((e.ctrlKey || e.metaKey) && e.key === "l" && selectedElements.length > 0) {
        e.preventDefault()
        toggleLockSelectedElements()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedElements, editingElement])

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.scale(zoom, zoom)
    ctx.translate(pan.x, pan.y)

    drawGrid(ctx, canvas.width, canvas.height)

    const sortedElements = [...elements].sort((a, b) => a.layer - b.layer)
    sortedElements.forEach((element) => {
      drawElement(ctx, element, selectedElements.includes(element.id))
    })

    if (isDrawing && drawingPath.length > 1) {
      ctx.strokeStyle = currentStyle.strokeColor || "#374151"
      ctx.lineWidth = currentStyle.strokeWidth || 2
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.beginPath()
      ctx.moveTo(drawingPath[0].x, drawingPath[0].y)
      for (let i = 1; i < drawingPath.length; i++) {
        ctx.lineTo(drawingPath[i].x, drawingPath[i].y)
      }
      ctx.stroke()
    }

    ctx.restore()
  }, [elements, zoom, pan, selectedElements, isDrawing, drawingPath, currentStyle])

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20
    ctx.strokeStyle = "#f1f5f9"
    ctx.lineWidth = 0.5

    const startX = Math.floor(-pan.x / gridSize) * gridSize
    const startY = Math.floor(-pan.y / gridSize) * gridSize
    const endX = startX + width / zoom + gridSize
    const endY = startY + height / zoom + gridSize

    ctx.beginPath()
    for (let x = startX; x < endX; x += gridSize) {
      ctx.moveTo(x, startY)
      ctx.lineTo(x, endY)
    }
    for (let y = startY; y < endY; y += gridSize) {
      ctx.moveTo(startX, y)
      ctx.lineTo(endX, y)
    }
    ctx.stroke()
  }

  const drawElement = (ctx: CanvasRenderingContext2D, element: WhiteboardElement, isSelected: boolean) => {
    ctx.save()

    ctx.translate(element.x + element.width / 2, element.y + element.height / 2)
    ctx.rotate((element.rotation * Math.PI) / 180)
    ctx.translate(-element.width / 2, -element.height / 2)

    ctx.fillStyle = element.style.fill
    ctx.strokeStyle = element.style.stroke
    ctx.lineWidth = element.style.strokeWidth
    ctx.globalAlpha = element.style.opacity

    // Draw shape based on type
    switch (element.type) {
      case "rectangle":
      case "sticky-note":
        ctx.fillRect(0, 0, element.width, element.height)
        ctx.strokeRect(0, 0, element.width, element.height)
        break
      case "circle":
        ctx.beginPath()
        ctx.arc(element.width / 2, element.height / 2, element.width / 2, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
        break
      case "triangle":
        ctx.beginPath()
        ctx.moveTo(element.width / 2, 0)
        ctx.lineTo(0, element.height)
        ctx.lineTo(element.width, element.height)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        break
      case "diamond":
        ctx.beginPath()
        ctx.moveTo(element.width / 2, 0)
        ctx.lineTo(element.width, element.height / 2)
        ctx.lineTo(element.width / 2, element.height)
        ctx.lineTo(0, element.height / 2)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        break
      case "arrow":
        drawArrow(ctx, element.width, element.height)
        break
      case "text":
        ctx.font = `${element.style.fontWeight} ${element.style.fontSize}px ${element.style.fontFamily}`
        ctx.fillStyle = element.style.stroke
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(element.content, element.width / 2, element.height / 2)
        break
      case "line":
        ctx.beginPath()
        ctx.moveTo(0, element.height / 2)
        ctx.lineTo(element.width, element.height / 2)
        ctx.stroke()
        break
      case "image":
        if (element.content) {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => {
            ctx.drawImage(img, 0, 0, element.width, element.height)
          }
          img.src = element.content
        }
        break
      case "freehand":
        if (element.path && element.path.length > 1) {
          ctx.strokeStyle = element.style.stroke
          ctx.lineWidth = element.style.strokeWidth
          ctx.lineCap = "round"
          ctx.lineJoin = "round"
          ctx.beginPath()
          ctx.moveTo(element.path[0].x, element.path[0].y)
          for (let i = 1; i < element.path.length; i++) {
            ctx.lineTo(element.path[i].x, element.path[i].y)
          }
          ctx.stroke()
        }
        break
    }

    // Draw text content for shapes with text
    if (element.content && element.type !== "text" && element.type !== "image" && element.type !== "freehand") {
      const textColor = getSafeTextColor(element.style.fill, "#ffffff")
      ctx.fillStyle = textColor
      ctx.font = `${element.style.fontWeight} ${element.style.fontSize}px ${element.style.fontFamily}`
      ctx.textAlign = element.style.textAlign || "center"
      ctx.textBaseline = "middle"

      const words = element.content.split(" ")
      const maxWidth = element.width - 10
      let line = ""
      let y = element.height / 2

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " "
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, element.width / 2, y)
          line = words[n] + " "
          y += element.style.fontSize + 2
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, element.width / 2, y)
    }

    // Draw selection indicator with resize handles
    if (isSelected) {
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(-5, -5, element.width + 10, element.height + 10)
      ctx.setLineDash([])

      // Draw resize handles
      const handleSize = 8
      ctx.fillStyle = "#3b82f6"
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2

      // Corner handles
      const handles = [
        { x: -5 - handleSize / 2, y: -5 - handleSize / 2 }, // top-left
        { x: element.width + 5 - handleSize / 2, y: -5 - handleSize / 2 }, // top-right
        { x: -5 - handleSize / 2, y: element.height + 5 - handleSize / 2 }, // bottom-left
        { x: element.width + 5 - handleSize / 2, y: element.height + 5 - handleSize / 2 }, // bottom-right
        // Edge handles
        { x: element.width / 2 - handleSize / 2, y: -5 - handleSize / 2 }, // top
        { x: element.width + 5 - handleSize / 2, y: element.height / 2 - handleSize / 2 }, // right
        { x: element.width / 2 - handleSize / 2, y: element.height + 5 - handleSize / 2 }, // bottom
        { x: -5 - handleSize / 2, y: element.height / 2 - handleSize / 2 }, // left
      ]

      handles.forEach((handle) => {
        ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
        ctx.strokeRect(handle.x, handle.y, handleSize, handleSize)
      })
    }

    ctx.restore()
  }

  const drawArrow = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const headSize = Math.min(width, height) * 0.3
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width - headSize, height / 2)
    ctx.moveTo(width - headSize, height / 2 - headSize / 2)
    ctx.lineTo(width, height / 2)
    ctx.lineTo(width - headSize, height / 2 + headSize / 2)
    ctx.stroke()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeCanvas = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      drawCanvas()
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [drawCanvas])

  const screenToCanvas = (screenX: number, screenY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }

    return {
      x: (screenX - rect.left - pan.x * zoom) / zoom,
      y: (screenY - rect.top - pan.y * zoom) / zoom,
    }
  }

  const findElementAt = (x: number, y: number): WhiteboardElement | null => {
    const sortedElements = [...elements].sort((a, b) => b.layer - a.layer)
    return (
      sortedElements.find((element) => {
        return x >= element.x && x <= element.x + element.width && y >= element.y && y <= element.y + element.height
      }) || null
    )
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvasPos = screenToCanvas(e.clientX, e.clientY)
    setLastMousePos(canvasPos)
    setContextMenu(null)

    if (activeTool === "pan") {
      setIsPanning(true)
      return
    }

    if (activeTool === "select") {
      const clickedElement = findElementAt(canvasPos.x, canvasPos.y)

      if (clickedElement && !clickedElement.locked) {
        // Check if clicking on resize handle
        const handleType = getResizeHandle(clickedElement, canvasPos.x, canvasPos.y)
        if (handleType && selectedElements.includes(clickedElement.id)) {
          setIsResizing(true)
          setResizeHandle(handleType)
          setDraggedElement(clickedElement)
          return
        }

        setIsDragging(true)
        setDraggedElement(clickedElement)
        setDragOffset({
          x: canvasPos.x - clickedElement.x,
          y: canvasPos.y - clickedElement.y,
        })

        if (e.ctrlKey || e.metaKey) {
          if (selectedElements.includes(clickedElement.id)) {
            onSelectedElementsChange(selectedElements.filter((id) => id !== clickedElement.id))
          } else {
            onSelectedElementsChange([...selectedElements, clickedElement.id])
          }
        } else {
          onSelectedElementsChange([clickedElement.id])
        }
      } else {
        onSelectedElementsChange([])
      }
      return
    }

    if (activeTool === "eraser") {
      const clickedElement = findElementAt(canvasPos.x, canvasPos.y)
      if (clickedElement) {
        const newElements = elements.filter((el) => el.id !== clickedElement.id)
        onElementsChange(newElements)
        onSelectedElementsChange(selectedElements.filter((id) => id !== clickedElement.id))
        console.log(`[v0] Erased element: ${clickedElement.id}`)
      }
      return
    }

    if (activeTool === "pen") {
      setIsDrawing(true)
      setDrawingPath([canvasPos])
      return
    }

    if (["rectangle", "circle", "triangle", "arrow", "sticky-note", "text", "line", "diamond"].includes(activeTool)) {
      createNewElement(activeTool as any, canvasPos.x, canvasPos.y)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvasPos = screenToCanvas(e.clientX, e.clientY)

    if (isPanning) {
      const deltaX = canvasPos.x - lastMousePos.x
      const deltaY = canvasPos.y - lastMousePos.y
      setPan((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
      return
    }

    if (isResizing && draggedElement && resizeHandle) {
      const newElement = resizeElement(draggedElement, canvasPos, resizeHandle)
      const newElements = elements.map((element) => (element.id === draggedElement.id ? newElement : element))
      onElementsChange(newElements)
      return
    }

    if (isDragging && draggedElement) {
      const newX = canvasPos.x - dragOffset.x
      const newY = canvasPos.y - dragOffset.y

      const newElements = elements.map((element) =>
        element.id === draggedElement.id ? { ...element, x: newX, y: newY, updatedAt: new Date() } : element,
      )
      onElementsChange(newElements)
      return
    }

    if (isDrawing) {
      setDrawingPath((prev) => [...prev, canvasPos])
      return
    }

    setLastMousePos(canvasPos)
  }

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false)
    }

    if (isDragging) {
      setIsDragging(false)
      setDraggedElement(null)
      setDragOffset({ x: 0, y: 0 })
    }

    if (isResizing) {
      setIsResizing(false)
      setResizeHandle(null)
      setDraggedElement(null)
    }

    if (isDrawing) {
      if (drawingPath.length > 2) {
        const bounds = getPathBounds(drawingPath)
        const newElement: WhiteboardElement = {
          id: `freehand-${Date.now()}`,
          type: "freehand",
          x: bounds.minX,
          y: bounds.minY,
          width: bounds.maxX - bounds.minX,
          height: bounds.maxY - bounds.minY,
          rotation: 0,
          style: {
            fill: "transparent",
            stroke: currentStyle.strokeColor || "#374151",
            strokeWidth: currentStyle.strokeWidth || 2,
            opacity: 1,
            fontSize: 14,
            fontFamily: "sans-serif",
            fontWeight: "normal",
            textAlign: "center",
          },
          content: "",
          locked: false,
          layer: 1,
          createdBy: "user-1",
          createdAt: new Date(),
          updatedAt: new Date(),
          path: drawingPath.map((p) => ({ x: p.x - bounds.minX, y: p.y - bounds.minY })),
        }
        onElementsChange([...elements, newElement])
      }
      setIsDrawing(false)
      setDrawingPath([])
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    const canvasPos = screenToCanvas(e.clientX, e.clientY)
    const clickedElement = findElementAt(canvasPos.x, canvasPos.y)

    if (clickedElement) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        elementId: clickedElement.id,
      })
      if (!selectedElements.includes(clickedElement.id)) {
        onSelectedElementsChange([clickedElement.id])
      }
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    const canvasPos = screenToCanvas(e.clientX, e.clientY)
    const clickedElement = findElementAt(canvasPos.x, canvasPos.y)

    if (clickedElement && (clickedElement.type === "text" || clickedElement.content)) {
      startTextEditing(clickedElement)
    }
  }

  const startTextEditing = (element: WhiteboardElement) => {
    setEditingElement(element.id)
    setTextEditValue(element.content)
    setTimeout(() => {
      textInputRef.current?.focus()
      textInputRef.current?.select()
    }, 0)
  }

  const finishTextEditing = () => {
    if (editingElement) {
      const newElements = elements.map((element) =>
        element.id === editingElement ? { ...element, content: textEditValue, updatedAt: new Date() } : element,
      )
      onElementsChange(newElements)
      setEditingElement(null)
      setTextEditValue("")
    }
  }

  const duplicateSelectedElements = () => {
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
    onSelectedElementsChange(duplicatedElements.map((el) => el.id))
  }

  const toggleLockSelectedElements = () => {
    const newElements = elements.map((element) =>
      selectedElements.includes(element.id) ? { ...element, locked: !element.locked, updatedAt: new Date() } : element,
    )
    onElementsChange(newElements)
  }

  const getResizeHandle = (element: WhiteboardElement, x: number, y: number): string | null => {
    const handleSize = 8
    const tolerance = 5

    const handles = [
      { type: "nw", x: element.x - handleSize / 2, y: element.y - handleSize / 2 },
      { type: "ne", x: element.x + element.width - handleSize / 2, y: element.y - handleSize / 2 },
      { type: "sw", x: element.x - handleSize / 2, y: element.y + element.height - handleSize / 2 },
      { type: "se", x: element.x + element.width - handleSize / 2, y: element.y + element.height - handleSize / 2 },
      { type: "n", x: element.x + element.width / 2 - handleSize / 2, y: element.y - handleSize / 2 },
      { type: "e", x: element.x + element.width - handleSize / 2, y: element.y + element.height / 2 - handleSize / 2 },
      { type: "s", x: element.x + element.width / 2 - handleSize / 2, y: element.y + element.height - handleSize / 2 },
      { type: "w", x: element.x - handleSize / 2, y: element.y + element.height / 2 - handleSize / 2 },
    ]

    for (const handle of handles) {
      if (
        x >= handle.x - tolerance &&
        x <= handle.x + handleSize + tolerance &&
        y >= handle.y - tolerance &&
        y <= handle.y + handleSize + tolerance
      ) {
        return handle.type
      }
    }

    return null
  }

  const resizeElement = (
    element: WhiteboardElement,
    mousePos: { x: number; y: number },
    handleType: string,
  ): WhiteboardElement => {
    const minSize = 10
    let newX = element.x
    let newY = element.y
    let newWidth = element.width
    let newHeight = element.height

    switch (handleType) {
      case "nw":
        newWidth = Math.max(minSize, element.x + element.width - mousePos.x)
        newHeight = Math.max(minSize, element.y + element.height - mousePos.y)
        newX = element.x + element.width - newWidth
        newY = element.y + element.height - newHeight
        break
      case "ne":
        newWidth = Math.max(minSize, mousePos.x - element.x)
        newHeight = Math.max(minSize, element.y + element.height - mousePos.y)
        newY = element.y + element.height - newHeight
        break
      case "sw":
        newWidth = Math.max(minSize, element.x + element.width - mousePos.x)
        newHeight = Math.max(minSize, mousePos.y - element.y)
        newX = element.x + element.width - newWidth
        break
      case "se":
        newWidth = Math.max(minSize, mousePos.x - element.x)
        newHeight = Math.max(minSize, mousePos.y - element.y)
        break
      case "n":
        newHeight = Math.max(minSize, element.y + element.height - mousePos.y)
        newY = element.y + element.height - newHeight
        break
      case "e":
        newWidth = Math.max(minSize, mousePos.x - element.x)
        break
      case "s":
        newHeight = Math.max(minSize, mousePos.y - element.y)
        break
      case "w":
        newWidth = Math.max(minSize, element.x + element.width - mousePos.x)
        newX = element.x + element.width - newWidth
        break
    }

    return {
      ...element,
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      updatedAt: new Date(),
    }
  }

  const getPathBounds = (path: { x: number; y: number }[]) => {
    const xs = path.map((p) => p.x)
    const ys = path.map((p) => p.y)
    return {
      minX: Math.min(...xs) - 5,
      maxX: Math.max(...xs) + 5,
      minY: Math.min(...ys) - 5,
      maxY: Math.max(...ys) + 5,
    }
  }

  const createNewElement = (type: string, x: number, y: number) => {
    const newElement: WhiteboardElement = {
      id: `${type}-${Date.now()}`,
      type: type as any,
      x: x - 50,
      y: y - 50,
      width: getDefaultShapeSize(type).width,
      height: getDefaultShapeSize(type).height,
      rotation: 0,
      style: {
        fill: currentStyle.fillColor || getDefaultShapeColor(type),
        stroke: currentStyle.strokeColor || "#374151",
        strokeWidth: currentStyle.strokeWidth || 2,
        opacity: currentStyle.fillOpacity / 100 || 1,
        fontSize: currentStyle.fontSize || 14,
        fontFamily: "sans-serif",
        fontWeight: "normal",
        textAlign: "center",
      },
      content:
        type === "sticky-note" ? "Note" : type === "text" ? "Text" : type.charAt(0).toUpperCase() + type.slice(1),
      locked: false,
      layer: 1,
      createdBy: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    onElementsChange([...elements, newElement])
    onSelectedElementsChange([newElement.id])
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.1, Math.min(5, zoom * delta))

    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      setPan((prev) => ({
        x: prev.x - (mouseX / zoom - mouseX / newZoom),
        y: prev.y - (mouseY / zoom - mouseY / newZoom),
      }))
    }

    onZoomChange(newZoom)
  }

  const handleCommentClick = (comment: Comment) => {
    console.log("Comment clicked:", comment)
  }

  const handleResolveComment = (commentId: string) => {
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, resolved: true } : c)))
  }

  const handleGenerateDiagram = async (prompt: string, type: string) => {
    console.log("Generating AI diagram:", { prompt, type })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const shapeType = e.dataTransfer.getData("shape-type")
    const shapeId = e.dataTransfer.getData("shape-id")
    const shapeName = e.dataTransfer.getData("shape-name")

    if (shapeType) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY)

      const newShape: WhiteboardElement = {
        id: `${shapeId}-${Date.now()}`,
        type: mapShapeTypeToElementType(shapeType),
        x: canvasPos.x - 50,
        y: canvasPos.y - 50,
        width: getDefaultShapeSize(shapeType).width,
        height: getDefaultShapeSize(shapeType).height,
        rotation: 0,
        style: {
          fill: currentStyle.fillColor || getDefaultShapeColor(shapeType),
          stroke: currentStyle.strokeColor || "#374151",
          strokeWidth: currentStyle.strokeWidth || 2,
          opacity: currentStyle.fillOpacity / 100 || 1,
          fontSize: currentStyle.fontSize || 14,
          fontFamily: "sans-serif",
          fontWeight: "normal",
          textAlign: "center",
        },
        content: shapeName || shapeType,
        locked: false,
        layer: 1,
        createdBy: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      onElementsChange([...elements, newShape])
      onSelectedElementsChange([newShape.id])
      console.log(`Dropped new ${shapeType} element at (${canvasPos.x}, ${canvasPos.y})`)
    }
  }

  const mapShapeTypeToElementType = (shapeType: string): WhiteboardElement["type"] => {
    const typeMap: Record<string, WhiteboardElement["type"]> = {
      rectangle: "rectangle",
      circle: "circle",
      triangle: "triangle",
      arrow: "arrow",
      text: "text",
      "sticky-note": "sticky-note",
      line: "line",
      diamond: "diamond",
      oval: "circle",
      document: "rectangle",
      parallelogram: "rectangle",
    }
    return typeMap[shapeType] || "rectangle"
  }

  const getDefaultShapeSize = (shapeType: string) => {
    const sizeMap: Record<string, { width: number; height: number }> = {
      rectangle: { width: 120, height: 80 },
      circle: { width: 100, height: 100 },
      triangle: { width: 100, height: 100 },
      arrow: { width: 120, height: 40 },
      text: { width: 100, height: 40 },
      "sticky-note": { width: 120, height: 120 },
      line: { width: 100, height: 2 },
      diamond: { width: 100, height: 100 },
      star: { width: 100, height: 100 },
      hexagon: { width: 100, height: 100 },
    }
    return sizeMap[shapeType] || { width: 100, height: 100 }
  }

  const getDefaultShapeColor = (shapeType: string) => {
    const colorMap: Record<string, string> = {
      rectangle: "#3b82f6",
      circle: "#10b981",
      triangle: "#f59e0b",
      arrow: "#ef4444",
      text: "transparent",
      "sticky-note": "#fef3c7",
      line: "transparent",
      diamond: "#8b5cf6",
      star: "#f97316",
      hexagon: "#06b6d4",
    }
    return colorMap[shapeType] || "#6b7280"
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        const newElement: WhiteboardElement = {
          id: `image-${Date.now()}`,
          type: "image",
          x: 100,
          y: 100,
          width: 200,
          height: 150,
          rotation: 0,
          style: {
            fill: "transparent",
            stroke: "#374151",
            strokeWidth: 1,
            opacity: 1,
            fontSize: 14,
            fontFamily: "sans-serif",
            fontWeight: "normal",
            textAlign: "center",
          },
          content: imageUrl,
          locked: false,
          layer: 1,
          createdBy: "user-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        onElementsChange([...elements, newElement])
        onSelectedElementsChange([newElement.id])
        console.log(`[v0] Added image element`)
      }
      reader.readAsDataURL(file)
    }
  }

  const createStickyNote = () => {
    createNewElement("sticky-note", 200, 200)
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-background">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          cursor:
            activeTool === "pan"
              ? "grab"
              : activeTool === "select"
                ? "default"
                : activeTool === "eraser"
                  ? "crosshair"
                  : "crosshair",
        }}
      />

      {editingElement && (
        <input
          ref={textInputRef}
          type="text"
          value={textEditValue}
          onChange={(e) => setTextEditValue(e.target.value)}
          onBlur={finishTextEditing}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              finishTextEditing()
            } else if (e.key === "Escape") {
              setEditingElement(null)
              setTextEditValue("")
            }
          }}
          className="absolute z-50 px-2 py-1 text-sm border border-blue-500 rounded bg-white"
          style={{
            left: `${(elements.find((el) => el.id === editingElement)?.x || 0) * zoom + pan.x * zoom}px`,
            top: `${(elements.find((el) => el.id === editingElement)?.y || 0) * zoom + pan.y * zoom}px`,
            width: `${(elements.find((el) => el.id === editingElement)?.width || 100) * zoom}px`,
          }}
        />
      )}

      {contextMenu && (
        <ElementContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          elementId={contextMenu.elementId}
          elements={elements}
          onElementsChange={onElementsChange}
          selectedElements={selectedElements}
          onSelectedElementsChange={onSelectedElementsChange}
          onClose={() => setContextMenu(null)}
          onDuplicate={duplicateSelectedElements}
          onToggleLock={toggleLockSelectedElements}
          onStartTextEdit={(element) => startTextEditing(element)}
        />
      )}

      {showPropertyPanel && selectedElements.length > 0 && (
        <div className="absolute top-4 right-4">
          <PropertyPanel
            selectedElements={selectedElements}
            elements={elements}
            onElementsChange={onElementsChange}
            onClose={() => setShowPropertyPanel(false)}
          />
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      <LiveCursors cursors={mockCursors} containerRef={containerRef} />
      <CommentMarkers comments={comments} onCommentClick={handleCommentClick} onResolveComment={handleResolveComment} />

      {showAIPanel && (
        <div className="absolute top-4 right-4">
          <AIAssistant
            onGenerateDiagram={handleGenerateDiagram}
            onApplyLayout={() => {}}
            onGenerateContent={() => {}}
          />
        </div>
      )}

      <div className="absolute bottom-6 right-6 flex flex-col gap-3">
        <Button
          className="rounded-lg w-12 h-12 shadow-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
          onClick={() => fileInputRef.current?.click()}
          title="Upload Image"
        >
          <Upload className="w-5 h-5" />
        </Button>
        <Button
          className="rounded-lg w-12 h-12 shadow-lg bg-yellow-400 hover:bg-yellow-500 text-white border-0"
          onClick={() => {}}
          title="Add Sticky Note"
        >
          <StickyNote className="w-5 h-5" />
        </Button>
        <Button
          className="rounded-lg w-12 h-12 shadow-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
          onClick={() => setShowPropertyPanel(!showPropertyPanel)}
          title="Properties"
        >
          ⚙️
        </Button>
        <Button
          className="rounded-lg w-14 h-14 shadow-lg bg-black hover:bg-gray-800 text-white border-0"
          onClick={() => setShowAIPanel(!showAIPanel)}
          title="AI Assistant"
        >
          <Sparkles className="w-6 h-6" />
        </Button>
      </div>

      {selectedElements.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <Badge variant="secondary" className="bg-blue-50 border-blue-200 text-blue-700">
            {selectedElements.length} element{selectedElements.length > 1 ? "s" : ""} selected - Double-click to edit
            text
          </Badge>
        </div>
      )}

      <Card className="absolute bottom-6 left-6 w-48 h-20 p-3 bg-white border border-gray-200 shadow-lg">
        <div className="text-sm font-medium text-gray-900">Zoom: {Math.round(zoom * 100)}%</div>
        <div className="text-xs text-gray-500 mt-1">
          Pan: ({Math.round(pan.x)}, {Math.round(pan.y)})
        </div>
        <div className="text-xs text-gray-500">Elements: {elements.length}</div>
      </Card>
    </div>
  )
}
