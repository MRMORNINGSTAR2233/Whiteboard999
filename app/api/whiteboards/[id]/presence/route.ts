import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { triggerPusherEvent } from "@/lib/pusher-server"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/whiteboards/[id]/presence
 * Update user presence status on whiteboard
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const whiteboardId = params.id
    const body = await request.json()
    
    const { status, action } = body // status: 'active' | 'away', action: 'join' | 'leave'

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
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    if (!whiteboard) {
      return NextResponse.json(
        { error: "Whiteboard not found or access denied" },
        { status: 404 }
      )
    }

    // Get user info, create if doesn't exist (for new Clerk users)
    let user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        image: true,
      },
    })

    if (!user) {
      // Auto-create user from Clerk session data
      user = await prisma.user.create({
        data: {
          id: session.id,
          email: session.email || '',
          name: session.name,
          image: session.image,
        },
        select: {
          id: true,
          name: true,
          image: true,
        },
      })
    }

    // Broadcast presence update
    const channelName = `presence-whiteboard-${whiteboardId}`
    
    if (action === "join") {
      await triggerPusherEvent(channelName, "user-joined", {
        user: {
          id: user.id,
          name: user.name,
          avatar: user.image,
        },
        status: status || "active",
        timestamp: new Date().toISOString(),
      })
    } else if (action === "leave") {
      await triggerPusherEvent(channelName, "user-left", {
        userId: user.id,
        timestamp: new Date().toISOString(),
      })
    } else {
      // Status update
      await triggerPusherEvent(channelName, "user-status-changed", {
        userId: user.id,
        status: status || "active",
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Presence error:", error)
    return NextResponse.json(
      { error: "Failed to update presence" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/whiteboards/[id]/presence
 * Get current users on whiteboard
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const whiteboardId = params.id

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

    // In a production app, you'd track active users in Redis or similar
    // For now, return empty array - Pusher presence channels handle this
    return NextResponse.json({ users: [] })
  } catch (error) {
    console.error("Get presence error:", error)
    return NextResponse.json(
      { error: "Failed to get presence" },
      { status: 500 }
    )
  }
}
