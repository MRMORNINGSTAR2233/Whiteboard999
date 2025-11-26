"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { createShapeId } from "tldraw"
import { AIAssistantPanel } from "@/components/whiteboard/ai-assistant-panel"
import { ExportPanel } from "@/components/whiteboard/export-panel"
import { CollaborationPanel } from "@/components/whiteboard/collaboration-panel"
import { ShapeLibraryPanel } from "@/components/whiteboard/shape-library-panel"
import { CustomToolbar } from "@/components/whiteboard/custom-toolbar"
import { FormattingToolbar } from "@/components/whiteboard/formatting-toolbar"
import { ShareDialog } from "@/components/whiteboard/share-dialog"
import { ConnectionStatusIndicator } from "@/components/whiteboard/connection-status-indicator"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { useCursorSync } from "@/hooks/use-cursor-sync"
import { useShapeSync } from "@/hooks/use-shape-sync"
import { usePresence } from "@/hooks/use-presence"
import { useConnectionStatus } from "@/hooks/use-connection-status"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { useParams } from "next/navigation"

const TldrawComponent = dynamic(() => import("tldraw").then((mod) => ({ default: mod.Tldraw })), {
  ssr: false,
  loading: () => <LoadingScreen />,
})

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-full bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <div className="text-lg font-medium text-gray-700">Loading Kroolo Whiteboard...</div>
      <div className="text-sm text-gray-500 mt-2">Initializing AI-powered canvas</div>
    </div>
  </div>
)

export default function WhiteboardPage() {
  const params = useParams()
  const whiteboardId = params.id as string
  const { user } = useUser()
  const [editor, setEditor] = useState<any | null>(null)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [showExportPanel, setShowExportPanel] = useState(false)
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false)
  const [showShapeLibrary, setShowShapeLibrary] = useState(false)
  const [showStylePanel, setShowStylePanel] = useState(false)
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [selectedShapes, setSelectedShapes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formattingToolbarPosition, setFormattingToolbarPosition] = useState({ x: 0, y: 0 })
  const [showFormattingToolbar, setShowFormattingToolbar] = useState(false)
  const { toast } = useToast()

  // Real-time collaboration hooks
  const currentUserId = user?.id || ""
  const currentUserName = user?.fullName || user?.firstName || "Anonymous"
  const currentUserAvatar = user?.imageUrl || undefined
  
  const { cursors, broadcastCursor } = useCursorSync(whiteboardId, currentUserId)
  const { users, isConnected } = usePresence(whiteboardId)
  const connectionStatus = useConnectionStatus()
  
  // Shape sync will be initialized after editor is ready
  useShapeSync(whiteboardId, currentUserId, editor)

  // Broadcast cursor position on mouse move
  useEffect(() => {
    if (!editor) return

    const handlePointerMove = (e: PointerEvent) => {
      const point = editor.screenToPage({ x: e.clientX, y: e.clientY })
      broadcastCursor(point.x, point.y, currentUserName, currentUserAvatar)
    }

    const container = editor.getContainer()
    container.addEventListener("pointermove", handlePointerMove)

    return () => {
      container.removeEventListener("pointermove", handlePointerMove)
    }
  }, [editor, broadcastCursor, currentUserName, currentUserAvatar])

  // Join/leave presence on mount/unmount
  useEffect(() => {
    if (!user?.id) return

    // Join presence
    fetch(`/api/whiteboards/${whiteboardId}/presence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", status: "active" }),
    })

    // Leave presence on unmount
    return () => {
      fetch(`/api/whiteboards/${whiteboardId}/presence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "leave" }),
      })
    }
  }, [whiteboardId, user?.id])

  // Load whiteboard from database
  useEffect(() => {
    const loadWhiteboard = async () => {
      try {
        const response = await fetch(`/api/whiteboards/${whiteboardId}`)
        
        if (!response.ok) {
          throw new Error("Failed to load whiteboard")
        }

        const { whiteboard } = await response.json()
        
        // Store whiteboard data for later use
        if (whiteboard.data && editor) {
          // Load records from snapshot
          if (whiteboard.data.records) {
            editor.store.put(whiteboard.data.records)
          }
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to load whiteboard:", error)
        toast({
          title: "Error",
          description: "Failed to load whiteboard",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    if (whiteboardId) {
      loadWhiteboard()
    }
  }, [whiteboardId, editor, toast])

  const uiOverrides = {
    tools(editor: any, tools: any) {
      tools.ai = {
        id: "ai",
        icon: "tool-ai",
        label: "AI Assistant",
        kbd: "a",
        onSelect: () => {
          setShowAIPanel(!showAIPanel)
        },
      }
      return tools
    },
    toolbar(editor: any, toolbar: any, { tools }: any) {
      toolbar.splice(4, 0, tools.ai)
      return toolbar
    },
    keyboardShortcutsDialog(editor: any, keyboardShortcutsDialog: any, { tools }: any) {
      const toolsGroup = keyboardShortcutsDialog.find((group: any) => group.id === "shortcuts-dialog.tools")
      if (toolsGroup) {
        toolsGroup.children.push(tools.ai)
      }
      return keyboardShortcutsDialog
    },
  }

  const handleMount = useCallback(
    (editor: any) => {
      console.log("[v0] TLDraw editor mounted successfully")
      setEditor(editor)

      const handleSelectionChange = () => {
        const selectedShapeIds = editor.getSelectedShapeIds()
        const shapes = selectedShapeIds.map((id: string) => editor.getShape(id)).filter(Boolean)
        setSelectedShapes(shapes)

        if (shapes.length > 0) {
          // Calculate center position of selected shapes for toolbar positioning
          const bounds = editor.getSelectionPageBounds()
          if (bounds) {
            const viewportBounds = editor.getViewportPageBounds()
            const centerX = bounds.x + bounds.w / 2
            const topY = bounds.y

            // Convert page coordinates to screen coordinates
            const screenPoint = editor.pageToScreen({ x: centerX, y: topY })

            setFormattingToolbarPosition({
              x: screenPoint.x,
              y: screenPoint.y,
            })
            setShowFormattingToolbar(true)
          }
        } else {
          setShowFormattingToolbar(false)
        }
      }

      editor.on("change", handleSelectionChange)

      // Auto-save to database with proper debouncing and cancellation
      let timeoutId: NodeJS.Timeout
      let abortController: AbortController | null = null
      
      const handleChange = async () => {
        try {
          // Cancel any pending request
          if (abortController) {
            abortController.abort()
          }
          
          // Create new abort controller for this request
          abortController = new AbortController()
          
          // Get all records from the store
          const allRecords = editor.store.allRecords()
          const snapshot = {
            records: allRecords,
            schema: editor.store.schema.serialize()
          }
          
          await fetch(`/api/whiteboards/${whiteboardId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: snapshot }),
            signal: abortController.signal,
          })
          
          abortController = null
        } catch (error: any) {
          // Ignore abort errors (they're expected when debouncing)
          if (error.name !== 'AbortError') {
            console.error("Failed to auto-save:", error)
          }
        }
      }

      const debouncedSave = () => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(handleChange, 3000) // Save every 3 seconds
      }

      const unsubscribe = editor.store.listen(debouncedSave, {
        source: "user",
        scope: "document",
      })

      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.key === "Delete" || e.key === "Backspace") && !e.ctrlKey && !e.metaKey) {
          const selectedShapeIds = editor.getSelectedShapeIds()
          if (selectedShapeIds.length > 0) {
            editor.deleteShapes(selectedShapeIds)
            toast({
              title: "Shapes Deleted",
              description: `Deleted ${selectedShapeIds.length} shape(s)`,
            })
          }
          return
        }

        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case "e":
              e.preventDefault()
              setShowExportPanel(!showExportPanel)
              break
            case "k":
              e.preventDefault()
              setShowCollaborationPanel(!showCollaborationPanel)
              break
            case "i":
              e.preventDefault()
              setShowAIPanel(!showAIPanel)
              break
          }

          if (e.shiftKey) {
            switch (e.key) {
              case "S":
                e.preventDefault()
                setShowShapeLibrary(!showShapeLibrary)
                break
              case "P":
                e.preventDefault()
                setShowStylePanel(!showStylePanel)
                break
            }
          }
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => {
        window.removeEventListener("keydown", handleKeyDown)
        editor.off("change", handleSelectionChange)
        clearTimeout(timeoutId)
        unsubscribe()
        // Cancel any pending save request
        if (abortController) {
          abortController.abort()
        }
      }
    },
    [whiteboardId, showAIPanel, showExportPanel, showCollaborationPanel, showShapeLibrary, showStylePanel, toast],
  )

  const handleShapeSelect = useCallback(
    (shapeType: string, shapeData: any) => {
      if (!editor) {
        console.error("[v0] Editor not available")
        return
      }

      try {
        const id = createShapeId()
        const shape = {
          id,
          type: shapeData.type,
          x: 100,
          y: 100,
          props: shapeData.props,
        }

        editor.createShape(shape)
        editor.select(id)

        toast({
          title: "Shape Added",
          description: `${shapeType} added to canvas`,
        })
      } catch (error) {
        console.error("[v0] Failed to create shape:", error)
        toast({
          title: "Error",
          description: "Failed to add shape",
          variant: "destructive",
        })
      }
    },
    [editor, toast],
  )

  const handleStyleChange = useCallback(
    (property: string, value: any) => {
      if (!editor || selectedShapes.length === 0) return

      try {
        selectedShapes.forEach((shape) => {
          const updateProps = { ...shape.props }

          if (property === "fontFamily") {
            if (
              value.includes("Mono") ||
              value === "Fira Code" ||
              value === "JetBrains Mono" ||
              value === "Source Code Pro" ||
              value === "Roboto Mono" ||
              value === "monospace"
            ) {
              updateProps.font = "mono"
            } else if (
              value === "Playfair Display" ||
              value === "Merriweather" ||
              value === "Crimson Text" ||
              value === "Libre Baskerville" ||
              value === "serif" ||
              value === "Times New Roman" ||
              value === "Georgia"
            ) {
              updateProps.font = "serif"
            } else {
              updateProps.font = "sans"
            }
          } else if (property === "fontSize" || property === "size") {
            const fontSize = typeof value === "number" ? value : Number.parseInt(value)
            if (fontSize <= 12) {
              updateProps.size = "s"
            } else if (fontSize <= 18) {
              updateProps.size = "m"
            } else if (fontSize <= 32) {
              updateProps.size = "l"
            } else {
              updateProps.size = "xl"
            }
          } else if (property === "strokeWidth") {
            const strokeWidth = typeof value === "number" ? value : Number.parseInt(value)
            if (strokeWidth <= 2) {
              updateProps.size = "s"
            } else if (strokeWidth <= 4) {
              updateProps.size = "m"
            } else if (strokeWidth <= 8) {
              updateProps.size = "l"
            } else {
              updateProps.size = "xl"
            }
          } else if (property === "color") {
            updateProps.color = value
          } else if (property === "fill") {
            updateProps.fill = value
          } else {
            updateProps[property] = value
          }

          editor.updateShape({
            id: shape.id,
            type: shape.type,
            props: updateProps,
          })
        })

        toast({
          title: "Style Updated",
          description: `Updated ${property} for ${selectedShapes.length} shape(s)`,
        })
      } catch (error) {
        console.error("Failed to update style:", error)
        toast({
          title: "Error",
          description: "Failed to update style",
          variant: "destructive",
        })
      }
    },
    [editor, selectedShapes, toast],
  )

  const handleAIGenerate = useCallback(
    async (prompt: string) => {
      if (!editor) {
        console.error("[v0] Editor not available")
        toast({
          title: "Error",
          description: "Editor not ready. Please wait for the canvas to load.",
          variant: "destructive",
        })
        return
      }

      console.log("[v0] Starting AI generation with prompt:", prompt)

      try {
        const response = await fetch("/api/ai/generate-diagram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        })

        const data = await response.json()
        console.log("[v0] AI API response:", data)

        if (data.success && data.shapes) {
          editor.selectNone()

          const currentShapeIds = editor.getCurrentPageShapeIds()
          if (currentShapeIds && currentShapeIds.length > 0) {
            editor.deleteShapes(currentShapeIds)
          }

          const createdShapeIds: string[] = []

          const mapGeometryType = (geoType: string): string => {
            const validTypes = [
              "cloud",
              "rectangle",
              "ellipse",
              "triangle",
              "diamond",
              "pentagon",
              "hexagon",
              "octagon",
              "star",
              "rhombus",
              "rhombus-2",
              "oval",
              "trapezoid",
              "arrow-right",
              "arrow-left",
              "arrow-up",
              "arrow-down",
              "x-box",
              "check-box",
              "heart",
            ]

            // Map common invalid types to valid ones
            const typeMapping: { [key: string]: string } = {
              circle: "ellipse",
              square: "rectangle",
              rect: "rectangle",
              round: "ellipse",
              box: "rectangle",
              "oval-shape": "oval",
              "diamond-shape": "diamond",
              "star-shape": "star",
              "heart-shape": "heart",
            }

            // Return mapped type if exists, otherwise check if it's valid, otherwise default to rectangle
            return typeMapping[geoType] || (validTypes.includes(geoType) ? geoType : "rectangle")
          }

          data.shapes.forEach((shapeData: any, index: number) => {
            const id = createShapeId()

            if (shapeData.type === "text") {
              // Handle text shapes - they don't use w/h props
              const textShape = {
                id,
                type: "text",
                x: shapeData.x || 200 + (index % 3) * 250,
                y: shapeData.y || 100 + Math.floor(index / 3) * 150,
                props: {
                  text: shapeData.props?.text || "",
                  color: shapeData.props?.color || "black",
                  size: shapeData.props?.size || "m",
                  font: shapeData.props?.font || "sans",
                  align: shapeData.props?.align || "start",
                  autoSize: true,
                },
              }
              console.log("[v0] Creating text shape:", textShape)
              editor.createShape(textShape)
            } else if (shapeData.type === "arrow") {
              const arrow = {
                id,
                type: "arrow",
                x: shapeData.x || 200,
                y: shapeData.y || 200,
                props: {
                  start: shapeData.props?.start || { x: 0, y: 0 },
                  end: shapeData.props?.end || { x: 100, y: 0 },
                  color: shapeData.props?.color || "black",
                  size: shapeData.props?.size || "m",
                  dash: shapeData.props?.dash || "solid",
                  arrowheadStart: shapeData.props?.arrowheadStart || "none",
                  arrowheadEnd: shapeData.props?.arrowheadEnd || "arrow",
                },
              }
              console.log("[v0] Creating arrow:", arrow)
              editor.createShape(arrow)
            } else {
              const mappedGeo = mapGeometryType(shapeData.props?.geo || "rectangle")

              const shape = {
                id,
                type: shapeData.type || "geo",
                x: shapeData.x || 200 + (index % 3) * 250,
                y: shapeData.y || 100 + Math.floor(index / 3) * 150,
                props: {
                  w: shapeData.props?.w || 150,
                  h: shapeData.props?.h || 80,
                  geo: mappedGeo,
                  color: shapeData.props?.color || "blue",
                  fill: shapeData.props?.fill || "semi",
                  dash: shapeData.props?.dash || "solid",
                  size: shapeData.props?.size || "m",
                  font: shapeData.props?.font || "sans",
                  align: shapeData.props?.align || "middle",
                },
              }
              console.log("[v0] Creating shape:", shape)
              editor.createShape(shape)
            }

            createdShapeIds.push(id)
          })

          setTimeout(() => {
            editor.zoomToFit()
            editor.resetZoom()
          }, 200)

          toast({
            title: "AI Generated Successfully",
            description: `Created ${data.shapes.length} elements: ${data.title || "Diagram"}`,
          })
        } else {
          throw new Error(data.error || "Failed to generate content")
        }
      } catch (error) {
        console.error("[v0] AI generation failed:", error)
        toast({
          title: "AI Generation Error",
          description: "Failed to generate content. Please try again.",
          variant: "destructive",
        })
      }
    },
    [editor, toast],
  )

  const handleExport = useCallback(
    async (format: "png" | "svg" | "pdf" | "json") => {
      if (!editor) return

      try {
        switch (format) {
          case "png":
            const png = await editor.getSvgAsImage(editor.getCurrentPageShapeIds(), {
              format: "png",
              background: true,
            })
            if (png) {
              const link = document.createElement("a")
              link.href = png.src
              link.download = "whiteboard.png"
              link.click()
            }
            break
          case "svg":
            const svg = await editor.getSvgString(editor.getCurrentPageShapeIds())
            if (svg) {
              const blob = new Blob([svg], { type: "image/svg+xml" })
              const url = URL.createObjectURL(blob)
              const link = document.createElement("a")
              link.href = url
              link.download = "whiteboard.svg"
              link.click()
              URL.revokeObjectURL(url)
            }
            break
          case "json":
            const allRecords = editor.store.allRecords()
            const snapshotData = {
              records: allRecords,
              schema: editor.store.schema.serialize()
            }
            const blob = new Blob([JSON.stringify(snapshotData, null, 2)], {
              type: "application/json",
            })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = "whiteboard.json"
            link.click()
            URL.revokeObjectURL(url)
            break
        }

        toast({
          title: "Exported Successfully",
          description: `Whiteboard exported as ${format.toUpperCase()}`,
        })
      } catch (error) {
        console.error("Export failed:", error)
        toast({
          title: "Export Error",
          description: "Failed to export whiteboard",
          variant: "destructive",
        })
      }
    },
    [editor, toast],
  )

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) {
        console.error("[v0] Editor not available")
        return
      }

      try {
        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string

          const image = new Image()
          image.onload = () => {
            const aspectRatio = image.width / image.height
            const maxWidth = 300
            const width = Math.min(maxWidth, image.width)
            const height = width / aspectRatio

            const id = createShapeId()
            editor.createShape({
              id,
              type: "image",
              x: 100,
              y: 100,
              props: {
                w: width,
                h: height,
                assetId: dataUrl,
                playing: false,
                url: dataUrl,
              },
            })

            editor.select(id)
          }
          image.src = dataUrl
        }
        reader.readAsDataURL(file)

        toast({
          title: "Image Uploaded",
          description: "Image added to canvas successfully",
        })
      } catch (error) {
        console.error("[v0] Failed to upload image:", error)
        toast({
          title: "Upload Error",
          description: "Failed to upload image",
          variant: "destructive",
        })
      }
    },
    [editor, toast],
  )

  const handlePresentationMode = useCallback(() => {
    if (!editor) {
      toast({
        title: "Editor Not Ready",
        description: "Please wait for the canvas to load",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Entering presentation mode")
    setIsPresentationMode(true)

    setShowAIPanel(false)
    setShowExportPanel(false)
    setShowCollaborationPanel(false)
    setShowShapeLibrary(false)
    setShowStylePanel(false)

    editor.zoomToFit()

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log("[v0] Fullscreen not supported:", err)
      })
    }

    toast({
      title: "Presentation Mode",
      description: "Press ESC to exit presentation mode",
    })
  }, [editor, toast])

  const handleShare = useCallback(() => {
    console.log("[v0] Opening share dialog")
    setShowShareDialog(true)
  }, [])

  const exitPresentationMode = useCallback(() => {
    console.log("[v0] Exiting presentation mode")
    setIsPresentationMode(false)

    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.log("[v0] Exit fullscreen error:", err)
      })
    }

    toast({
      title: "Presentation Ended",
      description: "Returned to editing mode",
    })
  }, [toast])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPresentationMode) {
        exitPresentationMode()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPresentationMode, exitPresentationMode])



  if (isLoading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="h-screen flex flex-col bg-background">
          <div className="flex items-center gap-4 p-4 border-b border-border">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Whiteboards
            </Link>
          </div>
          <LoadingScreen />
        </div>
        <Toaster />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="h-screen flex flex-col bg-background">
        {!isPresentationMode && (
          <>
            <div className="flex items-center gap-4 p-4 border-b border-border">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Whiteboards
              </Link>
              <div className="text-sm text-muted-foreground">Whiteboard ID: {whiteboardId}</div>
              <div className="ml-auto">
                <ConnectionStatusIndicator status={connectionStatus} userCount={users.length} />
              </div>
            </div>
            <CustomToolbar
              onExport={() => setShowExportPanel(!showExportPanel)}
              onCollaboration={() => setShowCollaborationPanel(!showCollaborationPanel)}
              onAI={() => setShowAIPanel(!showAIPanel)}
              onShapeLibrary={() => setShowShapeLibrary(!showShapeLibrary)}
              onStylePanel={() => setShowStylePanel(!showStylePanel)}
              onPresent={handlePresentationMode}
              onShare={handleShare}
              showExportPanel={showExportPanel}
              showCollaborationPanel={showCollaborationPanel}
              showAIPanel={showAIPanel}
              showShapeLibrary={showShapeLibrary}
              showStylePanel={showStylePanel}
              onFontFamilyChange={(fontFamily: string) => handleStyleChange("fontFamily", fontFamily)}
              onFontSizeChange={(fontSize: number) => handleStyleChange("fontSize", fontSize)}
              currentFontFamily={selectedShapes.length > 0 ? selectedShapes[0]?.props?.font || "sans" : "sans"}
              currentFontSize={
                selectedShapes.length > 0
                  ? selectedShapes[0]?.props?.size === "s"
                    ? 12
                    : selectedShapes[0]?.props?.size === "m"
                      ? 16
                      : selectedShapes[0]?.props?.size === "l"
                        ? 24
                        : 32
                  : 16
              }
            />
          </>
        )}

        <div className="flex-1 flex overflow-hidden">
          {!isPresentationMode && showShapeLibrary && (
            <ShapeLibraryPanel onClose={() => setShowShapeLibrary(false)} onShapeSelect={handleShapeSelect} />
          )}

          <div className="flex-1 relative">
            {isPresentationMode && (
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={exitPresentationMode}
                  className="bg-black/20 hover:bg-black/30 text-white border-white/20 text-sm px-3 py-2 rounded-md"
                >
                  Exit Presentation (ESC)
                </button>
              </div>
            )}

            <div className="w-full h-full">
              <TldrawComponent onMount={handleMount} autoFocus persistenceKey={`ai-whiteboard-${whiteboardId}`} />
            </div>

            {!isPresentationMode && (
              <FormattingToolbar
                selectedShapes={selectedShapes}
                onStyleChange={handleStyleChange}
                position={formattingToolbarPosition}
                visible={showFormattingToolbar}
              />
            )}
          </div>

          {!isPresentationMode && showExportPanel && (
            <div className="w-80 border-l border-border bg-background">
              <ExportPanel onExport={handleExport} onClose={() => setShowExportPanel(false)} />
            </div>
          )}

          {!isPresentationMode && showCollaborationPanel && (
            <div className="w-80 border-l border-border bg-background">
              <CollaborationPanel 
                onClose={() => setShowCollaborationPanel(false)} 
                users={users}
                isConnected={isConnected}
                connectionStatus={connectionStatus}
                onInvite={() => setShowShareDialog(true)}
              />
            </div>
          )}
        </div>

        {!isPresentationMode && showAIPanel && (
          <AIAssistantPanel onGenerate={handleAIGenerate} onClose={() => setShowAIPanel(false)} isOpen={showAIPanel} />
        )}

        {showShareDialog && (
          <ShareDialog
            whiteboardId={whiteboardId}
            onClose={() => setShowShareDialog(false)}
          />
        )}
      </div>
      <Toaster />
    </ThemeProvider>
  )
}
