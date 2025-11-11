import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    // Fetch all analytics events
    const events = await prisma.analyticsEvent.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10000, // Limit to last 10k events
    })

    // Convert to CSV
    const headers = ["Date", "Event Type", "User Email", "User Name", "Event Data", "Metadata"]
    const rows = events.map((event) => [
      event.createdAt.toISOString(),
      event.eventType,
      event.user?.email || "Anonymous",
      event.user?.name || "N/A",
      JSON.stringify(event.eventData),
      JSON.stringify(event.metadata),
    ])

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="analytics-${new Date().toISOString()}.csv"`,
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

    console.error("Failed to export analytics:", error)
    return NextResponse.json(
      { error: "Failed to export analytics" },
      { status: 500 }
    )
  }
}
