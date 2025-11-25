import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/clerk-auth"
import { prisma } from "@/lib/prisma"

// GET /api/whiteboards/[id] - Get a single whiteboard
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
      whiteboard.ownerId === session.user?.id ||
      whiteboard.shares.some((share: any) => share.userId === session.user?.id)

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    return NextResponse.json({ whiteboard })
  } catch (error) {
    console.error("Failed to fetch whiteboard:", error)
    return NextResponse.json(
      { error: "Failed to fetch whiteboard" },
      { status: 500 }
    )
  }
}

// PATCH /api/whiteboards/[id] - Update a whiteboard
export async function PATCH(
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

    // Check if user has edit permission
    const isOwner = whiteboard.ownerId === session.user?.id
    const hasEditPermission = whiteboard.shares.some(
      (share: any) => share.userId === session.user?.id && share.permission === "EDIT"
    )

    if (!isOwner && !hasEditPermission) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, icon, data, isArchived, isStarred } = body

    const updatedWhiteboard = await prisma.whiteboard.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(icon !== undefined && { icon }),
        ...(data !== undefined && { data }),
        ...(isArchived !== undefined && { isArchived }),
        ...(isStarred !== undefined && { isStarred }),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({ whiteboard: updatedWhiteboard })
  } catch (error) {
    console.error("Failed to update whiteboard:", error)
    return NextResponse.json(
      { error: "Failed to update whiteboard" },
      { status: 500 }
    )
  }
}

// DELETE /api/whiteboards/[id] - Delete a whiteboard
export async function DELETE(
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

    const whiteboard = await prisma.whiteboard.findUnique({
      where: { id: params.id },
    })

    if (!whiteboard) {
      return NextResponse.json(
        { error: "Whiteboard not found" },
        { status: 404 }
      )
    }

    // Only owner can delete
    if (whiteboard.ownerId !== session.user?.id) {
      return NextResponse.json(
        { error: "Only the owner can delete this whiteboard" },
        { status: 403 }
      )
    }

    await prisma.whiteboard.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete whiteboard:", error)
    return NextResponse.json(
      { error: "Failed to delete whiteboard" },
      { status: 500 }
    )
  }
}
