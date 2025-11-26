import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit-log"

// DELETE /api/admin/whiteboards/[id] - Delete whiteboard
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    const whiteboardId = params.id

    // Get whiteboard data before deletion
    const whiteboard = await prisma.whiteboard.findUnique({
      where: { id: whiteboardId },
      include: {
        owner: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (!whiteboard) {
      return NextResponse.json(
        { error: "Whiteboard not found" },
        { status: 404 }
      )
    }

    // Delete whiteboard (cascade will handle related data)
    await prisma.whiteboard.delete({
      where: { id: whiteboardId },
    })

    // Create audit log
    await createAuditLog(
      user.id,
      "delete_whiteboard",
      "whiteboard",
      whiteboardId,
      {
        name: whiteboard.name,
        owner: whiteboard.owner.email,
      },
      request
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      if (error.message.startsWith("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    console.error("Failed to delete whiteboard:", error)
    return NextResponse.json(
      { error: "Failed to delete whiteboard" },
      { status: 500 }
    )
  }
}
