export interface UserProfile {
  id: string
  email: string
  name: string | null
  image: string | null
  role: "USER" | "ADMIN"
  emailVerified: Date | null
  createdAt: Date
  lastLoginAt: Date | null
  stats: {
    whiteboardCount: number
    sharedWhiteboardCount: number
    commentCount: number
  }
}

export interface ProfileUpdateRequest {
  name?: string
  image?: string
}

export type Role = "USER" | "ADMIN"
