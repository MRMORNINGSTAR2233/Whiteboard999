export interface AuditLogEntry {
  id: string
  actor: {
    id: string
    name: string | null
    email: string
  }
  action: string
  targetType: string
  targetId: string | null
  changes: Record<string, any>
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}

export type AuditAction =
  | "suspend_user"
  | "activate_user"
  | "change_user_role"
  | "delete_user"
  | "delete_whiteboard"
  | "update_system_settings"
