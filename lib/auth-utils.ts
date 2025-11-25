import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

/**
 * Requires authentication and returns the user
 * @throws Error if user is not authenticated
 */
export async function requireAuth() {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }
  
  const user = await currentUser()
  
  return {
    id: userId,
    email: user?.emailAddresses[0]?.emailAddress,
    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || null,
    image: user?.imageUrl,
  }
}

/**
 * Requires admin role and returns the user
 * @throws Error if user is not authenticated or not an admin
 */
export async function requireAdmin() {
  const currentUserData = await requireAuth()
  
  const user = await prisma.user.findUnique({
    where: { id: currentUserData.id },
    select: { role: true }
  })
  
  if (user?.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required")
  }
  
  return currentUserData
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
