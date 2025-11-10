import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/whiteboards/[id]/share - Share whiteboard with a user
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

    const whiteboard = await prisma.whiteboard.findUnique({
      where: { id: params.id },
    })

    if (!whiteboard) {
      return NextResponse.json(
        { error: "Whiteboard not found" },
        { status: 404 }
      )
    }

    // Only owner can share
    if (whiteboard.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the owner can share this whiteboard" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, permission = "VIEW" } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Find user by email
    const userToShare = await prisma.user.findUnique({
      where: { email },
    })

    if (!userToShare) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if already shared
    const existingShare = await prisma.whiteboardShare.findUnique({
      where: {
        whiteboardId_userId: {
          whiteboardId: params.id,
          userId: userToShare.id,
        },
      },
    })

    if (existingShare) {
      // Update permission if already shared
      const updatedShare = await prisma.whiteboardShare.update({
        where: { id: existingShare.id },
        data: { permission },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      })

      return NextResponse.json({ share: updatedShare })
    }

    // Create new share
    const share = await prisma.whiteboardShare.create({
      data: {
        whiteboardId: params.id,
        userId: userToShare.id,
        permission,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    // TODO: Send email notification
    // await sendShareNotification(userToShare.email, whiteboard.name, session.user.name)

    return NextResponse.json({ share }, { status: 201 })
  } catch (error) {
    console.error("Failed to share whiteboard:", error)
    return NextResponse.json(
      { error: "Failed to share whiteboard" },
      { status: 500 }
    )
  }
}

// DELETE /api/whiteboards/[id]/share - Remove share access
export async function DELETE(
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

    const whiteboard = await prisma.whiteboard.findUnique({
      where: { id: params.id },
    })

    if (!whiteboard) {
      return NextResponse.json(
        { error: "Whiteboard not found" },
        { status: 404 }
      )
    }

    // Only owner can remove shares
    if (whiteboard.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the owner can remove access" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    await prisma.whiteboardShare.deleteMany({
      where: {
        whiteboardId: params.id,
        userId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove share:", error)
    return NextResponse.json(
      { error: "Failed to remove share" },
      { status: 500 }
    )
  }
}

// GET /api/whiteboards/[id]/share - Get all shares for a whiteboard
export async function GET(
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

    const whiteboard = await prisma.whiteboard.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
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

    // Check if user has access
    const hasAccess =
      whiteboard.ownerId === session.user.id ||
      whiteboard.shares.some((share) => share.userId === session.user.id)

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      owner: whiteboard.owner,
      shares: whiteboard.shares,
    })
  } catch (error) {
    console.error("Failed to fetch shares:", error)
    return NextResponse.json(
      { error: "Failed to fetch shares" },
      { status: 500 }
    )
  }
}
