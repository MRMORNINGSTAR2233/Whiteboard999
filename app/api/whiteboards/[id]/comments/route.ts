import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/clerk-auth"
import { prisma } from "@/lib/prisma"
import { sendCommentNotificationEmail } from "@/lib/email"

// GET /api/whiteboards/[id]/comments - Get all comments for a whiteboard
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    if (!user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user has access to whiteboard
    const whiteboard = await prisma.whiteboard.findUnique({
      where: { id: params.id },
      include: {
        shares: true,
      },
    })

    if (!whiteboard) {
      return NextResponse.json(
        { error: "Whiteboard not found" },
        { status: 404 }
      )
    }

    const hasAccess =
      whiteboard.ownerId === user.id ||
      whiteboard.shares.some((share: any) => share.userId === user.id)

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    const comments = await prisma.comment.findMany({
      where: {
        whiteboardId: params.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Failed to fetch comments:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}

// POST /api/whiteboards/[id]/comments - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    if (!user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user has access to whiteboard
    const whiteboard = await prisma.whiteboard.findUnique({
      where: { id: params.id },
      include: {
        shares: true,
      },
    })

    if (!whiteboard) {
      return NextResponse.json(
        { error: "Whiteboard not found" },
        { status: 404 }
      )
    }

    const hasAccess =
      whiteboard.ownerId === user.id ||
      whiteboard.shares.some((share: any) => share.userId === user.id)

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { content, x, y } = body

    if (!content || x === undefined || y === undefined) {
      return NextResponse.json(
        { error: "Content, x, and y are required" },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        x,
        y,
        whiteboardId: params.id,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        replies: true,
        whiteboard: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            shares: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Send email notifications to whiteboard owner and collaborators
    const recipients = new Set<{ email: string; name: string; id: string }>()
    
    // Add owner
    if (comment.whiteboard.owner.id !== user.id) {
      recipients.add({
        email: comment.whiteboard.owner.email,
        name: comment.whiteboard.owner.name || comment.whiteboard.owner.email,
        id: comment.whiteboard.owner.id,
      })
    }
    
    // Add collaborators
    comment.whiteboard.shares.forEach((share) => {
      if (share.user.id !== user.id) {
        recipients.add({
          email: share.user.email,
          name: share.user.name || share.user.email,
          id: share.user.id,
        })
      }
    })

    // Send notifications
    recipients.forEach(async (recipient) => {
      await sendCommentNotificationEmail(
        recipient.email,
        recipient.name,
        comment.whiteboard.name,
        params.id,
        comment.author.name || comment.author.email,
        content
      )
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error("Failed to create comment:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}
