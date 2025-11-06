"use client"

interface ResizeHandlesProps {
  element: {
    x: number
    y: number
    width: number
    height: number
  }
  zoom: number
  pan: { x: number; y: number }
  onResize: (handleType: string, deltaX: number, deltaY: number) => void
}

export function ResizeHandles({ element, zoom, pan, onResize }: ResizeHandlesProps) {
  const handleSize = 8

  const handles = [
    { type: "nw", x: element.x - handleSize / 2, y: element.y - handleSize / 2, cursor: "nw-resize" },
    { type: "ne", x: element.x + element.width - handleSize / 2, y: element.y - handleSize / 2, cursor: "ne-resize" },
    { type: "sw", x: element.x - handleSize / 2, y: element.y + element.height - handleSize / 2, cursor: "sw-resize" },
    {
      type: "se",
      x: element.x + element.width - handleSize / 2,
      y: element.y + element.height - handleSize / 2,
      cursor: "se-resize",
    },
    { type: "n", x: element.x + element.width / 2 - handleSize / 2, y: element.y - handleSize / 2, cursor: "n-resize" },
    {
      type: "e",
      x: element.x + element.width - handleSize / 2,
      y: element.y + element.height / 2 - handleSize / 2,
      cursor: "e-resize",
    },
    {
      type: "s",
      x: element.x + element.width / 2 - handleSize / 2,
      y: element.y + element.height - handleSize / 2,
      cursor: "s-resize",
    },
    {
      type: "w",
      x: element.x - handleSize / 2,
      y: element.y + element.height / 2 - handleSize / 2,
      cursor: "w-resize",
    },
  ]

  return (
    <div className="absolute inset-0 pointer-events-none">
      {handles.map((handle) => (
        <div
          key={handle.type}
          className="absolute bg-foreground border-2 border-background rounded-sm pointer-events-auto hover:bg-foreground/80 transition-colors"
          style={{
            left: `${handle.x * zoom + pan.x * zoom}px`,
            top: `${handle.y * zoom + pan.y * zoom}px`,
            width: `${handleSize}px`,
            height: `${handleSize}px`,
            cursor: handle.cursor,
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
            // Handle resize logic would go here
          }}
        />
      ))}
    </div>
  )
}
