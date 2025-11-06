import type { WhiteboardElement } from "@/types/whiteboard"

export interface ExportOptions {
  format: "json" | "png" | "svg" | "pdf"
  quality?: number
  includeBackground?: boolean
  scale?: number
}

export async function handleExport(elements: WhiteboardElement[], options: ExportOptions): Promise<void> {
  try {
    switch (options.format) {
      case "json":
        await exportAsJSON(elements)
        break
      case "png":
        await exportAsPNG(elements, options)
        break
      case "svg":
        await exportAsSVG(elements, options)
        break
      case "pdf":
        await exportAsPDF(elements, options)
        break
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  } catch (error) {
    console.error("Export error:", error)
    throw error
  }
}

async function exportAsJSON(elements: WhiteboardElement[]): Promise<void> {
  const data = {
    elements,
    exportedAt: new Date().toISOString(),
    version: "1.0",
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  })

  downloadBlob(blob, "whiteboard.json")
}

async function exportAsPNG(elements: WhiteboardElement[], options: ExportOptions): Promise<void> {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get canvas context")

  // Calculate bounds
  const bounds = calculateBounds(elements)
  const scale = options.scale || 2

  canvas.width = (bounds.width + 40) * scale
  canvas.height = (bounds.height + 40) * scale

  ctx.scale(scale, scale)
  ctx.translate(-bounds.minX + 20, -bounds.minY + 20)

  // Draw background
  if (options.includeBackground) {
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(bounds.minX - 20, bounds.minY - 20, bounds.width + 40, bounds.height + 40)
  }

  // Draw elements
  for (const element of elements) {
    await drawElementToCanvas(ctx, element)
  }

  canvas.toBlob(
    (blob) => {
      if (blob) {
        downloadBlob(blob, "whiteboard.png")
      }
    },
    "image/png",
    options.quality || 0.9,
  )
}

async function exportAsSVG(elements: WhiteboardElement[], options: ExportOptions): Promise<void> {
  const bounds = calculateBounds(elements)
  const width = bounds.width + 40
  const height = bounds.height + 40

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`

  if (options.includeBackground) {
    svg += `<rect width="${width}" height="${height}" fill="#ffffff"/>`
  }

  for (const element of elements) {
    svg += elementToSVG(element, bounds.minX - 20, bounds.minY - 20)
  }

  svg += "</svg>"

  const blob = new Blob([svg], { type: "image/svg+xml" })
  downloadBlob(blob, "whiteboard.svg")
}

async function exportAsPDF(elements: WhiteboardElement[], options: ExportOptions): Promise<void> {
  // Simple PDF export - in a real app you'd use a library like jsPDF
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get canvas context")

  const bounds = calculateBounds(elements)
  canvas.width = bounds.width + 40
  canvas.height = bounds.height + 40

  ctx.translate(-bounds.minX + 20, -bounds.minY + 20)

  if (options.includeBackground) {
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(bounds.minX - 20, bounds.minY - 20, bounds.width + 40, bounds.height + 40)
  }

  for (const element of elements) {
    await drawElementToCanvas(ctx, element)
  }

  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, "whiteboard.pdf")
    }
  }, "image/png")
}

function calculateBounds(elements: WhiteboardElement[]) {
  if (elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 }
  }

  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const element of elements) {
    minX = Math.min(minX, element.x)
    minY = Math.min(minY, element.y)
    maxX = Math.max(maxX, element.x + (element.width || 100))
    maxY = Math.max(maxY, element.y + (element.height || 100))
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

async function drawElementToCanvas(ctx: CanvasRenderingContext2D, element: WhiteboardElement): Promise<void> {
  ctx.save()

  switch (element.type) {
    case "rectangle":
      ctx.fillStyle = element.fillColor || "#15803d"
      ctx.strokeStyle = element.strokeColor || "#374151"
      ctx.lineWidth = element.strokeWidth || 2
      ctx.fillRect(element.x, element.y, element.width || 100, element.height || 100)
      ctx.strokeRect(element.x, element.y, element.width || 100, element.height || 100)
      break

    case "circle":
      const radius = (element.width || 100) / 2
      ctx.beginPath()
      ctx.arc(element.x + radius, element.y + radius, radius, 0, 2 * Math.PI)
      ctx.fillStyle = element.fillColor || "#15803d"
      ctx.fill()
      ctx.strokeStyle = element.strokeColor || "#374151"
      ctx.lineWidth = element.strokeWidth || 2
      ctx.stroke()
      break

    case "text":
      ctx.fillStyle = element.fillColor || "#000000"
      ctx.font = `${element.fontSize || 16}px Arial`
      ctx.fillText(element.text || "", element.x, element.y + (element.fontSize || 16))
      break
  }

  ctx.restore()
}

function elementToSVG(element: WhiteboardElement, offsetX: number, offsetY: number): string {
  const x = element.x - offsetX
  const y = element.y - offsetY

  switch (element.type) {
    case "rectangle":
      return `<rect x="${x}" y="${y}" width="${element.width || 100}" height="${element.height || 100}" fill="${element.fillColor || "#15803d"}" stroke="${element.strokeColor || "#374151"}" stroke-width="${element.strokeWidth || 2}"/>`

    case "circle":
      const radius = (element.width || 100) / 2
      return `<circle cx="${x + radius}" cy="${y + radius}" r="${radius}" fill="${element.fillColor || "#15803d"}" stroke="${element.strokeColor || "#374151"}" stroke-width="${element.strokeWidth || 2}"/>`

    case "text":
      return `<text x="${x}" y="${y + (element.fontSize || 16)}" font-size="${element.fontSize || 16}" fill="${element.fillColor || "#000000"}">${element.text || ""}</text>`

    default:
      return ""
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
