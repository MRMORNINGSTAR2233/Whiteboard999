import { prisma } from "@/lib/prisma"
import type { AuditAction } from "@/types/audit-log"

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  actorId: string,
  action: AuditAction,
  targetType: string,
  targetId: string | null,
  changes: Record<string, any>,
  request?: Request
) {
  try {
    const ipAddress = request?.headers.get("x-forwarded-for") || request?.headers.get("x-real-ip") || null
    const userAgent = request?.headers.get("user-agent") || null

    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetType,
        targetId,
        changes,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
    // Don't throw - audit log failures shouldn't break the main operation
  }
}
