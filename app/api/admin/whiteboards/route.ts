import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

// GET /api/admin/whiteboards - List all whiteboards
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const ownerId = searchParams.get("ownerId") || ""

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      }
    }

    if (ownerId) {
      where.ownerId = ownerId
    }

    const [whiteboards, total] = await Promise.all([
      prisma.whiteboard.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: {
              shares: true,
              comments: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),
      prisma.whiteboard.count({ where }),
    ])

    return NextResponse.json({
      whiteboards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      if (error.message.startsWith("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    console.error("Failed to fetch whiteboards:", error)
    return NextResponse.json(
      { error: "Failed to fetch whiteboards" },
      { status: 500 }
    )
  }
}
