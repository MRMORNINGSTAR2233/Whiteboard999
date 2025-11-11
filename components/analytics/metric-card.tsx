"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCardProps {
  title: string
  value: number
  subtitle?: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
}

export function MetricCard({ title, value, subtitle, icon, trend = "neutral" }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">{icon}</div>
          {getTrendIcon()}
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        {subtitle && <p className={`text-sm mt-1 ${getTrendColor()}`}>{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
