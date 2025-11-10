import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/whiteboards - List all whiteboards for authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const archived = searchParams.get("archived") === "true"
    const starred = searchParams.get("starred") === "true"
    const search = searchParams.get("search") || ""

    const whiteboards = await prisma.whiteboard.findMany({
      where: {
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
        ...(archived !== undefined && { isArchived: archived }),
        ...(starred && { isStarred: true }),
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
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
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({ whiteboards })
  } catch (error) {
    console.error("Failed to fetch whiteboards:", error)
    return NextResponse.json(
      { error: "Failed to fetch whiteboards" },
      { status: 500 }
    )
  }
}

// POST /api/whiteboards - Create a new whiteboard
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, icon, data } = body

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    const whiteboard = await prisma.whiteboard.create({
      data: {
        name,
        icon: icon || "🔶",
        data: data || {},
        ownerId: session.user.id,
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

    return NextResponse.json({ whiteboard }, { status: 201 })
  } catch (error) {
    console.error("Failed to create whiteboard:", error)
    return NextResponse.json(
      { error: "Failed to create whiteboard" },
      { status: 500 }
    )
  }
}
