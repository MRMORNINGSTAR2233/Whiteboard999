import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Requires authentication and returns the session
 * @throws Error if user is not authenticated
 */
export async function requireAuth() {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  
  return session
}

/**
 * Requires admin role and returns the session
 * @throws Error if user is not authenticated or not an admin
 */
export async function requireAdmin() {
  const session = await requireAuth()
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })
  
  if (user?.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required")
  }
  
  return session
}

/**
 * Checks if a user has admin role
 * @param userId - The user ID to check
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  
  return user?.role === "ADMIN"
}
