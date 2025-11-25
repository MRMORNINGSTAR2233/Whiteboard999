import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextRequest, NextResponse } from "next/server"

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Create rate limiters with different limits
export const rateLimiters = {
  // Strict rate limiting for authentication endpoints (5 requests per 15 minutes)
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        analytics: true,
        prefix: "@ratelimit/auth",
      })
    : null,

  // Admin endpoints (30 requests per minute)
  admin: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "1 m"),
        analytics: true,
        prefix: "@ratelimit/admin",
      })
    : null,

  // Whiteboard operations (60 requests per minute)
  whiteboard: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        analytics: true,
        prefix: "@ratelimit/whiteboard",
      })
    : null,

  // API endpoints general (100 requests per minute)
  api: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        analytics: true,
        prefix: "@ratelimit/api",
      })
    : null,

  // AI generation (10 requests per 5 minutes - expensive operations)
  ai: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "5 m"),
        analytics: true,
        prefix: "@ratelimit/ai",
      })
    : null,
}

/**
 * Rate limit middleware for API routes
 * @param request - Next.js request object
 * @param limiter - Rate limiter to use (from rateLimiters)
 * @returns null if allowed, Response if rate limited
 */
export async function rateLimit(
  request: NextRequest,
  limiter: Ratelimit | null
): Promise<NextResponse | null> {
  // Skip rate limiting in development or if Redis is not configured
  if (!limiter || process.env.NODE_ENV === "development") {
    return null
  }

  // Get identifier (IP address or user ID)
  const ip = request.headers.get("x-forwarded-for") || 
             request.headers.get("x-real-ip") || 
             "anonymous"

  try {
    const { success, limit, reset, remaining } = await limiter.limit(ip)

    // Add rate limit headers
    const headers = {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
    }

    if (!success) {
      return NextResponse.json(
        { 
          error: "Too many requests", 
          message: "You have exceeded the rate limit. Please try again later.",
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers,
        }
      )
    }

    return null
  } catch (error) {
    console.error("Rate limit error:", error)
    // On error, allow the request to proceed
    return null
  }
}

/**
 * Higher-order function to wrap API routes with rate limiting
 * @param handler - API route handler
 * @param limiterType - Type of rate limiter to use
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  limiterType: keyof typeof rateLimiters
) {
  return async (req: NextRequest) => {
    const limiter = rateLimiters[limiterType]
    const rateLimitResponse = await rateLimit(req, limiter)
    
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    
    return handler(req)
  }
}
