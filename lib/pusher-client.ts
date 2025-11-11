"use client"

import Pusher from "pusher-js"

let pusherClient: Pusher | null = null

/**
 * Get or create a Pusher client instance
 */
export function getPusherClient(): Pusher {
  if (!pusherClient) {
    pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
      auth: {
        headers: {
          "Content-Type": "application/json",
        },
      },
    })

    // Enable logging in development
    if (process.env.NODE_ENV === "development") {
      Pusher.logToConsole = true
    }
  }

  return pusherClient
}

/**
 * Disconnect the Pusher client
 */
export function disconnectPusher() {
  if (pusherClient) {
    pusherClient.disconnect()
    pusherClient = null
  }
}
