import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get statistics
    const [
      totalUsers,
      totalWhiteboards,
      totalComments,
      totalShares,
      recentUsers,
      recentWhiteboards,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.whiteboard.count(),
      prisma.comment.count(),
      prisma.whiteboardShare.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
      prisma.whiteboard.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ])

    // Get most active users
    const activeUsers = await prisma.user.findMany({
      take: 10,
      include: {
        _count: {
          select: {
            whiteboards: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get popular whiteboards
    const popularWhiteboards = await prisma.whiteboard.findMany({
      take: 10,
      include: {
        owner: {
          select: {
            name: true,
            email: true,
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
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        totalWhiteboards,
        totalComments,
        totalShares,
        recentUsers,
        recentWhiteboards,
      },
      activeUsers: activeUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        whiteboardCount: user._count.whiteboards,
        commentCount: user._count.comments,
        createdAt: user.createdAt,
      })),
      popularWhiteboards: popularWhiteboards.map((wb) => ({
        id: wb.id,
        name: wb.name,
        owner: wb.owner,
        shareCount: wb._count.shares,
        commentCount: wb._count.comments,
        updatedAt: wb.updatedAt,
      })),
    })
  } catch (error) {
    console.error("Failed to fetch admin stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}
