import { auth, currentUser } from '@clerk/nextjs/server'

export async function getCurrentUser() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  const user = await currentUser()
  
  return {
    id: userId,
    email: user?.emailAddresses[0]?.emailAddress,
    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || null,
    image: user?.imageUrl,
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}
