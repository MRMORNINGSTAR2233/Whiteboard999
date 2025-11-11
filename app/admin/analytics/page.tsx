"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, Users, FileText, Zap } from "lucide-react"
import { AnalyticsDashboard } from "@/types/analytics"
import { AnalyticsChart } from "@/components/analytics/analytics-chart"
import { MetricCard } from "@/components/analytics/metric-card"

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/analytics/overview")

      if (!response.ok) {
        throw new Error("Failed to fetch analytics")
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = async () => {
    try {
      const response = await fetch("/api/analytics/export-csv")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-${new Date().toISOString()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Failed to export analytics:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Failed to load analytics"}</p>
          <Button onClick={fetchAnalytics}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform usage and performance metrics</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={data.overview.totalUsers}
          icon={<Users className="w-5 h-5" />}
          trend={data.overview.activeUsers.monthly > 0 ? "up" : "neutral"}
        />
        <MetricCard
          title="Daily Active Users"
          value={data.overview.activeUsers.daily}
          subtitle={`${data.overview.activeUsers.weekly} weekly`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend="up"
        />
        <MetricCard
          title="Total Whiteboards"
          value={data.overview.totalWhiteboards}
          icon={<FileText className="w-5 h-5" />}
          trend="up"
        />
        <MetricCard
          title="Collaborations"
          value={data.overview.totalCollaborations}
          icon={<Zap className="w-5 h-5" />}
          trend="up"
        />
      </div>

      {/* Trends Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              data={data.trends.userGrowth}
              dataKey="value"
              name="New Users"
              color="#3b82f6"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Whiteboard Creation</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              data={data.trends.whiteboardCreation}
              dataKey="value"
              name="Whiteboards"
              color="#10b981"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Feature Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              data={data.trends.aiUsage}
              dataKey="value"
              name="AI Requests"
              color="#8b5cf6"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topFeatures.slice(0, 5).map((feature) => (
                <div key={feature.feature} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">
                    {feature.feature.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {feature.usageCount}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Stats */}
      {data.exportStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Export Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.exportStats.map((stat) => (
                <div key={stat.format} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                  <p className="text-sm text-gray-600 uppercase">{stat.format}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
