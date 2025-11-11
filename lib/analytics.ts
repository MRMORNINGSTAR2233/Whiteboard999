import { prisma } from "@/lib/prisma"
import type { AnalyticsEventType, AnalyticsEventData, AnalyticsMetadata } from "@/types/analytics"

/**
 * Track an analytics event
 */
export async function trackEvent(
  eventType: AnalyticsEventType,
  userId?: string,
  eventData?: AnalyticsEventData,
  metadata?: AnalyticsMetadata
) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType,
        userId,
        eventData: eventData || {},
        metadata: metadata || {},
      },
    })
  } catch (error) {
    // Don't throw errors for analytics tracking failures
    console.error("Failed to track analytics event:", error)
  }
}

/**
 * Get browser and OS information from user agent
 */
export function parseUserAgent(userAgent: string): { browser?: string; os?: string } {
  const result: { browser?: string; os?: string } = {}

  // Detect browser
  if (userAgent.includes("Chrome")) result.browser = "Chrome"
  else if (userAgent.includes("Firefox")) result.browser = "Firefox"
  else if (userAgent.includes("Safari")) result.browser = "Safari"
  else if (userAgent.includes("Edge")) result.browser = "Edge"
  else result.browser = "Other"

  // Detect OS
  if (userAgent.includes("Windows")) result.os = "Windows"
  else if (userAgent.includes("Mac")) result.os = "macOS"
  else if (userAgent.includes("Linux")) result.os = "Linux"
  else if (userAgent.includes("Android")) result.os = "Android"
  else if (userAgent.includes("iOS")) result.os = "iOS"
  else result.os = "Other"

  return result
}

/**
 * Get metadata from request
 */
export function getRequestMetadata(request: Request): AnalyticsMetadata {
  const userAgent = request.headers.get("user-agent") || ""
  const { browser, os } = parseUserAgent(userAgent)

  return {
    browser,
    os,
    userAgent,
    ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
  }
}

/**
 * Client-side analytics tracking
 */
export async function trackClientEvent(
  eventType: AnalyticsEventType,
  eventData?: AnalyticsEventData
) {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType,
        eventData,
      }),
    })
  } catch (error) {
    console.error("Failed to track client event:", error)
  }
}
