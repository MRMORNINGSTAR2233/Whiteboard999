export type AnalyticsEventType =
  | "user_login"
  | "user_signup"
  | "whiteboard_create"
  | "whiteboard_update"
  | "whiteboard_delete"
  | "whiteboard_export"
  | "ai_diagram_generate"
  | "ai_content_generate"
  | "ai_suggestions"
  | "collaboration_join"
  | "collaboration_leave"
  | "comment_create"
  | "share_create"

export interface AnalyticsEventData {
  [key: string]: any
}

export interface AnalyticsMetadata {
  browser?: string
  os?: string
  location?: string
  sessionId?: string
  userAgent?: string
  ipAddress?: string
}

export interface AnalyticsEvent {
  eventType: AnalyticsEventType
  eventData?: AnalyticsEventData
  metadata?: AnalyticsMetadata
}

export interface AnalyticsDashboard {
  overview: {
    totalUsers: number
    activeUsers: {
      daily: number
      weekly: number
      monthly: number
    }
    totalWhiteboards: number
    totalCollaborations: number
  }
  trends: {
    userGrowth: TimeSeriesData[]
    whiteboardCreation: TimeSeriesData[]
    aiUsage: TimeSeriesData[]
  }
  topFeatures: {
    feature: string
    usageCount: number
  }[]
  exportStats: {
    format: string
    count: number
  }[]
}

export interface TimeSeriesData {
  date: string
  value: number
}
