import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { trackEvent } from "@/lib/analytics"
import { exportToMarkdown } from "@/lib/exporters/markdown"
import { exportToHTML } from "@/lib/exporters/html"
import { exportToPPTX } from "@/lib/exporters/pptx"
import { exportToExcalidraw } from "@/lib/exporters/excalidraw"
import type { ExportFormat } from "@/types/export"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const whiteboardId = params.id
    const body = await request.json()
    const { format, options = {} } = body as {
      format: ExportFormat
      options?: Record<string, any>
    }

    // Get whiteboard
    const whiteboard = await prisma.whiteboard.findFirst({
      where: {
        id: whiteboardId,
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

    if (!whiteboard) {
      return NextResponse.json(
        { error: "Whiteboard not found" },
        { status: 404 }
      )
    }

    // Track export event
    await trackEvent("whiteboard_export", session.user.id, {
      whiteboardId,
      format,
    })

    let content: string | Buffer
    let contentType: string
    let filename: string

    // Generate export based on format
    switch (format) {
      case "markdown":
        content = exportToMarkdown(whiteboard.data, whiteboard.name)
        contentType = "text/markdown"
        filename = `${whiteboard.name}.md`
        break

      case "html":
        content = exportToHTML(whiteboard.data, whiteboard.name)
        contentType = "text/html"
        filename = `${whiteboard.name}.html`
        break

      case "pptx":
        content = await exportToPPTX(whiteboard.data, whiteboard.name)
        contentType =
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        filename = `${whiteboard.name}.pptx`
        break

      case "excalidraw":
        content = exportToExcalidraw(whiteboard.data, whiteboard.name)
        contentType = "application/json"
        filename = `${whiteboard.name}.excalidraw`
        break

      case "json":
        content = JSON.stringify(whiteboard.data, null, 2)
        contentType = "application/json"
        filename = `${whiteboard.name}.json`
        break

      default:
        return NextResponse.json(
          { error: `Unsupported format: ${format}` },
          { status: 400 }
        )
    }

    // Return file
    return new NextResponse(content as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Failed to export whiteboard:", error)
    return NextResponse.json(
      { error: "Failed to export whiteboard" },
      { status: 500 }
    )
  }
}
