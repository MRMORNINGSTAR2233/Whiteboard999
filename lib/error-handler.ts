/**
 * Comprehensive error handling utilities for the AI Whiteboard application
 */

export interface ErrorInfo {
  code: string
  message: string
  details?: any
  timestamp: Date
  userId?: string
  context?: string
}

export class WhiteboardError extends Error {
  public readonly code: string
  public readonly details?: any
  public readonly timestamp: Date
  public readonly userId?: string
  public readonly context?: string

  constructor(code: string, message: string, details?: any, userId?: string, context?: string) {
    super(message)
    this.name = "WhiteboardError"
    this.code = code
    this.details = details
    this.timestamp = new Date()
    this.userId = userId
    this.context = context
  }
}

export const ErrorCodes = {
  // AI Related Errors
  AI_GENERATION_FAILED: "AI_GENERATION_FAILED",
  AI_TIMEOUT: "AI_TIMEOUT",
  AI_QUOTA_EXCEEDED: "AI_QUOTA_EXCEEDED",

  // Canvas Errors
  CANVAS_RENDER_ERROR: "CANVAS_RENDER_ERROR",
  ELEMENT_NOT_FOUND: "ELEMENT_NOT_FOUND",
  INVALID_COORDINATES: "INVALID_COORDINATES",

  // Collaboration Errors
  SYNC_FAILED: "SYNC_FAILED",
  USER_PERMISSION_DENIED: "USER_PERMISSION_DENIED",
  CONNECTION_LOST: "CONNECTION_LOST",

  // File Operations
  EXPORT_FAILED: "EXPORT_FAILED",
  IMPORT_FAILED: "IMPORT_FAILED",
  SAVE_FAILED: "SAVE_FAILED",

  // Validation Errors
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // System Errors
  MEMORY_LIMIT_EXCEEDED: "MEMORY_LIMIT_EXCEEDED",
  BROWSER_NOT_SUPPORTED: "BROWSER_NOT_SUPPORTED",
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

export function handleError(error: Error | WhiteboardError, context?: string): ErrorInfo {
  const errorInfo: ErrorInfo = {
    code: error instanceof WhiteboardError ? error.code : "UNKNOWN_ERROR",
    message: error.message,
    details: error instanceof WhiteboardError ? error.details : { stack: error.stack },
    timestamp: new Date(),
    context,
  }

  // Log error for debugging
  console.error("[v0] Error occurred:", errorInfo)

  // In production, you would send this to your error tracking service
  // trackError(errorInfo)

  return errorInfo
}

export function createErrorHandler(context: string) {
  return (error: Error | WhiteboardError) => handleError(error, context)
}

export function validateElement(element: any): boolean {
  try {
    if (!element || typeof element !== "object") return false
    if (!element.id || typeof element.id !== "string") return false
    if (!element.type || typeof element.type !== "string") return false
    if (typeof element.x !== "number" || typeof element.y !== "number") return false
    if (typeof element.width !== "number" || typeof element.height !== "number") return false

    return true
  } catch (error) {
    console.error("[v0] Element validation failed:", error)
    return false
  }
}

export function safeExecute<T>(fn: () => T, fallback: T, context?: string): T {
  try {
    return fn()
  } catch (error) {
    handleError(error instanceof Error ? error : new Error(String(error)), context)
    return fallback
  }
}

export async function safeExecuteAsync<T>(fn: () => Promise<T>, fallback: T, context?: string): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    handleError(error instanceof Error ? error : new Error(String(error)), context)
    return fallback
  }
}

export function retryOperation<T>(operation: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  return new Promise(async (resolve, reject) => {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation()
        resolve(result)
        return
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.warn(`[v0] Operation failed (attempt ${attempt}/${maxRetries}):`, lastError.message)

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay * attempt))
        }
      }
    }

    reject(lastError!)
  })
}
