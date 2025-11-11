import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { trackEvent, getRequestMetadata } from "@/lib/analytics"
import type { AnalyticsEventType, AnalyticsEventData } from "@/types/analytics"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()
    
    const { eventType, eventData } = body as {
      eventType: AnalyticsEventType
      eventData?: AnalyticsEventData
    }
    
    if (!eventType) {
      return NextResponse.json(
        { error: "Event type is required" },
        { status: 400 }
      )
    }
    
    // Get metadata from request
    const metadata = getRequestMetadata(request)
    
    // Track the event
    await trackEvent(
      eventType,
      session?.user?.id,
      eventData,
      metadata
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to track analytics event:", error)
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    )
  }
}
