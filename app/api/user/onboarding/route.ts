import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

// GET /api/user/onboarding - Get onboarding status
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    let onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: user.id },
    })

    // Create onboarding record if it doesn't exist
    if (!onboarding) {
      onboarding = await prisma.userOnboarding.create({
        data: {
          userId: user.id,
        },
      })
    }

    return NextResponse.json({ onboarding })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Failed to fetch onboarding status:", error)
    return NextResponse.json(
      { error: "Failed to fetch onboarding status" },
      { status: 500 }
    )
  }
}

// PATCH /api/user/onboarding - Update onboarding status
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const updates: any = {}

    if (body.welcomeCompleted !== undefined) {
      updates.welcomeCompleted = body.welcomeCompleted
    }
    if (body.createWhiteboardCompleted !== undefined) {
      updates.createWhiteboardCompleted = body.createWhiteboardCompleted
    }
    if (body.aiFeaturesCompleted !== undefined) {
      updates.aiFeaturesCompleted = body.aiFeaturesCompleted
    }
    if (body.collaborationCompleted !== undefined) {
      updates.collaborationCompleted = body.collaborationCompleted
    }
    if (body.sharingCompleted !== undefined) {
      updates.sharingCompleted = body.sharingCompleted
    }

    // Check if all tutorials are completed
    const allCompleted =
      (updates.welcomeCompleted ?? true) &&
      (updates.createWhiteboardCompleted ?? true) &&
      (updates.aiFeaturesCompleted ?? true) &&
      (updates.collaborationCompleted ?? true) &&
      (updates.sharingCompleted ?? true)

    if (allCompleted && !updates.completedAt) {
      updates.completedAt = new Date()
    }

    const onboarding = await prisma.userOnboarding.upsert({
      where: { userId: user.id },
      update: updates,
      create: {
        userId: user.id,
        ...updates,
      },
    })

    return NextResponse.json({ onboarding })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.error("Failed to update onboarding status:", error)
    return NextResponse.json(
      { error: "Failed to update onboarding status" },
      { status: 500 }
    )
  }
}
