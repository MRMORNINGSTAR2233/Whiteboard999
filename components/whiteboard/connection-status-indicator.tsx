"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Loader2 } from "lucide-react"

interface ConnectionStatusIndicatorProps {
  status: "connected" | "connecting" | "disconnected" | "reconnecting"
  userCount?: number
}

export function ConnectionStatusIndicator({ status, userCount = 0 }: ConnectionStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          icon: <Wifi className="h-3 w-3" />,
          text: `Connected${userCount > 1 ? ` • ${userCount} users` : ""}`,
          variant: "default" as const,
          className: "bg-green-500/10 text-green-700 border-green-500/20",
        }
      case "connecting":
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: "Connecting...",
          variant: "secondary" as const,
          className: "bg-blue-500/10 text-blue-700 border-blue-500/20",
        }
      case "reconnecting":
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: "Reconnecting...",
          variant: "secondary" as const,
          className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
        }
      case "disconnected":
        return {
          icon: <WifiOff className="h-3 w-3" />,
          text: "Disconnected",
          variant: "destructive" as const,
          className: "bg-red-500/10 text-red-700 border-red-500/20",
        }
      default:
        return {
          icon: <Wifi className="h-3 w-3" />,
          text: "Unknown",
          variant: "secondary" as const,
          className: "bg-gray-500/10 text-gray-700 border-gray-500/20",
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1.5 ${config.className}`}>
      {config.icon}
      <span className="text-xs font-medium">{config.text}</span>
    </Badge>
  )
}
