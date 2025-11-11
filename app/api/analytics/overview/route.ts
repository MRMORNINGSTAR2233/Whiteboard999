import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get overview metrics
    const [
      totalUsers,
      totalWhiteboards,
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      totalCollaborations,
    ] = await Promise.all([
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.whiteboard.count(),
      prisma.analyticsEvent.groupBy({
        by: ["userId"],
        where: {
          eventType: "user_login",
          createdAt: { gte: oneDayAgo },
          userId: { not: null },
        },
      }).then((result) => result.length),
      prisma.analyticsEvent.groupBy({
        by: ["userId"],
        where: {
          eventType: "user_login",
          createdAt: { gte: oneWeekAgo },
          userId: { not: null },
        },
      }).then((result) => result.length),
      prisma.analyticsEvent.groupBy({
        by: ["userId"],
        where: {
          eventType: "user_login",
          createdAt: { gte: oneMonthAgo },
          userId: { not: null },
        },
      }).then((result) => result.length),
      prisma.analyticsEvent.count({
        where: {
          eventType: { in: ["collaboration_join", "collaboration_leave"] },
        },
      }),
    ])

    // Get user growth trend (last 30 days)
    const userGrowth = await prisma.$queryRaw<Array<{ date: string; value: number }>>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as value
      FROM "User"
      WHERE created_at >= ${oneMonthAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // Get whiteboard creation trend
    const whiteboardCreation = await prisma.$queryRaw<Array<{ date: string; value: number }>>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as value
      FROM "Whiteboard"
      WHERE created_at >= ${oneMonthAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // Get AI usage trend
    const aiUsage = await prisma.$queryRaw<Array<{ date: string; value: number }>>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as value
      FROM "AnalyticsEvent"
      WHERE event_type IN ('ai_diagram_generate', 'ai_content_generate', 'ai_suggestions')
        AND created_at >= ${oneMonthAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // Get top features
    const topFeatures = await prisma.analyticsEvent.groupBy({
      by: ["eventType"],
      _count: {
        eventType: true,
      },
      orderBy: {
        _count: {
          eventType: "desc",
        },
      },
      take: 10,
    })

    // Get export stats
    const exportStats = await prisma.analyticsEvent.groupBy({
      by: ["eventData"],
      where: {
        eventType: "whiteboard_export",
      },
      _count: {
        eventData: true,
      },
    })

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers: {
          daily: dailyActiveUsers,
          weekly: weeklyActiveUsers,
          monthly: monthlyActiveUsers,
        },
        totalWhiteboards,
        totalCollaborations,
      },
      trends: {
        userGrowth,
        whiteboardCreation,
        aiUsage,
      },
      topFeatures: topFeatures.map((f) => ({
        feature: f.eventType,
        usageCount: f._count.eventType,
      })),
      exportStats: exportStats.map((e: any) => ({
        format: e.eventData?.format || "unknown",
        count: e._count.eventData,
      })),
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

    console.error("Failed to fetch analytics overview:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
