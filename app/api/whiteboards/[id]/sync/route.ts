import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { triggerPusherEvent } from "@/lib/pusher-server"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/whiteboards/[id]/sync
 * Broadcast whiteboard changes to all connected users
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const whiteboardId = params.id
    const body = await request.json()
    
    const { eventType, data } = body
    
    if (!eventType || !data) {
      return NextResponse.json(
        { error: "Missing eventType or data" },
        { status: 400 }
      )
    }

    // Verify user has access to the whiteboard
    const whiteboard = await prisma.whiteboard.findFirst({
      where: {
        id: whiteboardId,
        OR: [
          { ownerId: session.id },
          {
            shares: {
              some: {
                userId: session.id,
                permission: { in: ["EDIT", "ADMIN"] },
              },
            },
          },
        ],
      },
    })

    if (!whiteboard) {
      return NextResponse.json(
        { error: "Whiteboard not found or access denied" },
        { status: 404 }
      )
    }

    // Broadcast the event to the whiteboard channel
    const channelName = `private-whiteboard-${whiteboardId}`
    
    await triggerPusherEvent(channelName, eventType, {
      ...data,
      userId: session.id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json(
      { error: "Failed to sync changes" },
      { status: 500 }
    )
  }
}
