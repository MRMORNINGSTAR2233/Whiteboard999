"use client"

import { useConnectionStatus } from "@/hooks/use-connection-status"
import { Wifi, WifiOff, Loader2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ConnectionStatus() {
  const { status, reconnectAttempts } = useConnectionStatus()

  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          icon: <Wifi className="w-3 h-3" />,
          label: "Connected",
          variant: "default" as const,
          className: "bg-green-500 text-white border-green-600",
        }
      case "connecting":
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          label: "Connecting...",
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 border-yellow-300",
        }
      case "reconnecting":
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          label: `Reconnecting${reconnectAttempts > 0 ? ` (${reconnectAttempts})` : ""}`,
          variant: "secondary" as const,
          className: "bg-orange-100 text-orange-800 border-orange-300",
        }
      case "disconnected":
        return {
          icon: <WifiOff className="w-3 h-3" />,
          label: "Disconnected",
          variant: "destructive" as const,
          className: "bg-red-500 text-white border-red-600",
        }
      default:
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          label: "Unknown",
          variant: "secondary" as const,
          className: "bg-gray-100 text-gray-800 border-gray-300",
        }
    }
  }

  const config = getStatusConfig()

  // Only show when not connected
  if (status === "connected") {
    return null
  }

  return (
    <Badge variant={config.variant} className={`text-xs flex items-center gap-1 ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  )
}
