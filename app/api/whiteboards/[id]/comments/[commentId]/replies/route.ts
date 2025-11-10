import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/whiteboards/[id]/comments/[commentId]/replies - Add a reply to a comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const comment = await prisma.comment.findUnique({
      where: { id: params.commentId },
      include: {
        whiteboard: {
          include: {
            shares: true,
          },
        },
      },
    })

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      )
    }

    // Check if user has access to whiteboard
    const hasAccess =
      comment.whiteboard.ownerId === session.user.id ||
      comment.whiteboard.shares.some((share) => share.userId === session.user.id)

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    const reply = await prisma.commentReply.create({
      data: {
        content,
        commentId: params.commentId,
        authorId: session.user.id,
      },
    })

    return NextResponse.json({ reply }, { status: 201 })
  } catch (error) {
    console.error("Failed to create reply:", error)
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 }
    )
  }
}
