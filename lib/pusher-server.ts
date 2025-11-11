import Pusher from "pusher"

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
})

/**
 * Trigger an event on a Pusher channel
 */
export async function triggerPusherEvent(
  channel: string,
  event: string,
  data: any
) {
  try {
    await pusherServer.trigger(channel, event, data)
  } catch (error) {
    console.error("Failed to trigger Pusher event:", error)
    throw error
  }
}

/**
 * Authenticate a user for a private or presence channel
 */
export function authenticatePusherUser(
  socketId: string,
  channel: string,
  userId: string,
  userInfo?: {
    name: string
    avatar?: string
  }
) {
  // For presence channels
  if (channel.startsWith("presence-")) {
    return pusherServer.authorizeChannel(socketId, channel, {
      user_id: userId,
      user_info: userInfo,
    })
  }
  
  // For private channels
  return pusherServer.authorizeChannel(socketId, channel)
}
