import { z } from "zod"
import { NextRequest, NextResponse } from "next/server"

/**
 * Validates request body against a Zod schema
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated data or error response
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json()
    const validatedData = schema.parse(body)
    return { data: validatedData, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: NextResponse.json(
          {
            error: "Validation error",
            details: error.errors.map((err) => ({
              path: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 }
        ),
      }
    }
    
    return {
      data: null,
      error: NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      ),
    }
  }
}

/**
 * Validates query parameters against a Zod schema
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated data or error response
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): { data: T; error: null } | { data: null; error: NextResponse } {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const validatedData = schema.parse(params)
    return { data: validatedData, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: NextResponse.json(
          {
            error: "Invalid query parameters",
            details: error.errors.map((err) => ({
              path: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 }
        ),
      }
    }
    
    return {
      data: null,
      error: NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      ),
    }
  }
}

// Common validation schemas
export const schemas = {
  // Whiteboard schemas
  createWhiteboard: z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    icon: z.string().optional(),
    data: z.any().optional(),
  }),

  updateWhiteboard: z.object({
    name: z.string().min(1).max(100).optional(),
    icon: z.string().optional(),
    data: z.any().optional(),
    isStarred: z.boolean().optional(),
    isArchived: z.boolean().optional(),
  }),

  // Comment schemas
  createComment: z.object({
    content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
    x: z.number().optional(),
    y: z.number().optional(),
  }),

  updateComment: z.object({
    content: z.string().min(1).max(1000),
    resolved: z.boolean().optional(),
  }),

  // Share schemas
  shareWhiteboard: z.object({
    email: z.string().email("Invalid email address"),
    permission: z.enum(["VIEW", "EDIT"], {
      errorMap: () => ({ message: "Permission must be VIEW or EDIT" }),
    }),
  }),

  // Analytics schemas
  trackEvent: z.object({
    eventType: z.string().min(1, "Event type is required"),
    metadata: z.record(z.any()).optional(),
  }),

  // Admin schemas
  updateUserStatus: z.object({
    status: z.enum(["ACTIVE", "SUSPENDED"], {
      errorMap: () => ({ message: "Status must be ACTIVE or SUSPENDED" }),
    }),
    reason: z.string().optional(),
  }),

  updateUserRole: z.object({
    role: z.enum(["USER", "ADMIN"], {
      errorMap: () => ({ message: "Role must be USER or ADMIN" }),
    }),
  }),

  // AI schemas
  generateDiagram: z.object({
    prompt: z.string().min(10, "Prompt too short").max(500, "Prompt too long"),
    style: z.enum(["flowchart", "mindmap", "sequence", "uml"]).optional(),
  }),

  // Export schemas
  exportWhiteboard: z.object({
    format: z.enum(["pdf", "png", "svg", "json"], {
      errorMap: () => ({ message: "Invalid export format" }),
    }),
    quality: z.number().min(0.1).max(1).optional(),
  }),
}

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=\s*["'].*?["']/gi, "") // Remove event handlers
    .trim()
}

/**
 * Validates and sanitizes email addresses
 * @param email - Email to validate
 * @returns Sanitized email or null if invalid
 */
export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const sanitized = email.toLowerCase().trim()
  return emailRegex.test(sanitized) ? sanitized : null
}

/**
 * Validates UUID format
 * @param id - ID to validate
 * @returns true if valid UUID
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}
