import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { authenticatePusherUser } from "@/lib/pusher-server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    
    const body = await request.json()
    const { socket_id, channel_name } = body
    
    if (!socket_id || !channel_name) {
      return NextResponse.json(
        { error: "Missing socket_id or channel_name" },
        { status: 400 }
      )
    }
    
    // Get user info for presence channels
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        image: true,
      },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // For whiteboard channels, verify user has access
    if (channel_name.includes("whiteboard-")) {
      const whiteboardId = channel_name.split("whiteboard-")[1]
      
      // Check if user owns or has access to the whiteboard
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
          { error: "Access denied to this whiteboard" },
          { status: 403 }
        )
      }
    }
    
    // Authenticate the user
    const authResponse = authenticatePusherUser(
      socket_id,
      channel_name,
      user.id,
      {
        name: user.name || "Anonymous",
        avatar: user.image || undefined,
      }
    )
    
    return NextResponse.json(authResponse)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    console.error("Failed to authenticate Pusher user:", error)
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    )
  }
}
