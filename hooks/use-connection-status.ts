"use client"

import { useEffect, useState } from "react"
import { getPusherClient } from "@/lib/pusher-client"

export type ConnectionStatus = "connected" | "connecting" | "disconnected" | "reconnecting"

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>("connecting")
  const [reconnectAttempts, setReconnectAttempts] = useState(0)

  useEffect(() => {
    const pusher = getPusherClient()

    // Connection state handlers
    const handleConnected = () => {
      setStatus("connected")
      setReconnectAttempts(0)
    }

    const handleConnecting = () => {
      setStatus("connecting")
    }

    const handleDisconnected = () => {
      setStatus("disconnected")
    }

    const handleUnavailable = () => {
      setStatus("reconnecting")
      setReconnectAttempts((prev) => prev + 1)
    }

    const handleFailed = () => {
      setStatus("disconnected")
    }

    // Bind connection events
    pusher.connection.bind("connected", handleConnected)
    pusher.connection.bind("connecting", handleConnecting)
    pusher.connection.bind("disconnected", handleDisconnected)
    pusher.connection.bind("unavailable", handleUnavailable)
    pusher.connection.bind("failed", handleFailed)

    // Set initial state
    const currentState = pusher.connection.state
    if (currentState === "connected") {
      setStatus("connected")
    } else if (currentState === "connecting") {
      setStatus("connecting")
    } else if (currentState === "unavailable") {
      setStatus("reconnecting")
    } else {
      setStatus("disconnected")
    }

    // Cleanup
    return () => {
      pusher.connection.unbind("connected", handleConnected)
      pusher.connection.unbind("connecting", handleConnecting)
      pusher.connection.unbind("disconnected", handleDisconnected)
      pusher.connection.unbind("unavailable", handleUnavailable)
      pusher.connection.unbind("failed", handleFailed)
    }
  }, [])

  return { status, reconnectAttempts }
}
