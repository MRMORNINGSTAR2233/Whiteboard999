import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/clerk-auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/whiteboards/[id]/comments/[commentId] - Update a comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const user = await requireAuth()

    if (!user.id) {
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

    // Check if user is author or has edit permission
    const isAuthor = comment.authorId === user.id
    const hasEditPermission =
      comment.whiteboard.ownerId === user.id ||
      comment.whiteboard.shares.some(
        (share: any) => share.userId === user.id && share.permission === "EDIT"
      )

    if (!isAuthor && !hasEditPermission) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { content, resolved } = body

    const updatedComment = await prisma.comment.update({
      where: { id: params.commentId },
      data: {
        ...(content !== undefined && { content }),
        ...(resolved !== undefined && { resolved }),
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
      },
    })

    return NextResponse.json({ comment: updatedComment })
  } catch (error) {
    console.error("Failed to update comment:", error)
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    )
  }
}

// DELETE /api/whiteboards/[id]/comments/[commentId] - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const user = await requireAuth()

    if (!user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const comment = await prisma.comment.findUnique({
      where: { id: params.commentId },
      include: {
        whiteboard: true,
      },
    })

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      )
    }

    // Only author or whiteboard owner can delete
    const canDelete =
      comment.authorId === user.id ||
      comment.whiteboard.ownerId === user.id

    if (!canDelete) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      )
    }

    await prisma.comment.delete({
      where: { id: params.commentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete comment:", error)
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    )
  }
}
