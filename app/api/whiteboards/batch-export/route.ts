import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { trackEvent } from "@/lib/analytics"
import { exportToMarkdown } from "@/lib/exporters/markdown"
import { exportToHTML } from "@/lib/exporters/html"
import { exportToPPTX } from "@/lib/exporters/pptx"
import { exportToExcalidraw } from "@/lib/exporters/excalidraw"
import JSZip from "jszip"
import type { BatchExportRequest } from "@/types/export"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json() as BatchExportRequest
    const { whiteboardIds, format, options = {} } = body

    if (!whiteboardIds || whiteboardIds.length === 0) {
      return NextResponse.json(
        { error: "No whiteboards specified" },
        { status: 400 }
      )
    }

    // Get whiteboards
    const whiteboards = await prisma.whiteboard.findMany({
      where: {
        id: { in: whiteboardIds },
        OR: [
          { ownerId: session.user.id },
          {
            shares: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
    })

    if (whiteboards.length === 0) {
      return NextResponse.json(
        { error: "No accessible whiteboards found" },
        { status: 404 }
      )
    }

    // Track batch export event
    await trackEvent("whiteboard_export", session.user.id, {
      whiteboardIds,
      format,
      count: whiteboards.length,
      batch: true,
    })

    // Create ZIP file
    const zip = new JSZip()

    // Export each whiteboard
    for (const whiteboard of whiteboards) {
      let content: string | Buffer
      let filename: string

      switch (format) {
        case "markdown":
          content = exportToMarkdown(whiteboard.data, whiteboard.name)
          filename = `${whiteboard.name}.md`
          break

        case "html":
          content = exportToHTML(whiteboard.data, whiteboard.name)
          filename = `${whiteboard.name}.html`
          break

        case "pptx":
          content = await exportToPPTX(whiteboard.data, whiteboard.name)
          filename = `${whiteboard.name}.pptx`
          break

        case "excalidraw":
          content = exportToExcalidraw(whiteboard.data, whiteboard.name)
          filename = `${whiteboard.name}.excalidraw`
          break

        case "json":
          content = JSON.stringify(whiteboard.data, null, 2)
          filename = `${whiteboard.name}.json`
          break

        default:
          continue
      }

      zip.file(filename, content)
    }

    // Generate ZIP
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

    // Return ZIP file
    return new NextResponse(zipBuffer as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="whiteboards-${format}-${Date.now()}.zip"`,
      },
    })
  } catch (error) {
    console.error("Failed to batch export whiteboards:", error)
    return NextResponse.json(
      { error: "Failed to batch export whiteboards" },
      { status: 500 }
    )
  }
}
