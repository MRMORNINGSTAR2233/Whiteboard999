"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import { DashboardOverview } from "./dashboard-overview"
import { UserManagement } from "./user-management"
import { BoardManagement } from "./board-management"
import { AnalyticsPanel } from "./analytics-panel"
import { SystemSettings } from "./system-settings"
import { AIInsights } from "./ai-insights"

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <DashboardOverview stats={stats} loading={loading} />
      case "users":
        return <UserManagement />
      case "boards":
        return <BoardManagement />
      case "analytics":
        return <AnalyticsPanel stats={stats} loading={loading} />
      case "ai-insights":
        return <AIInsights />
      case "settings":
        return <SystemSettings />
      default:
        return <DashboardOverview stats={stats} loading={loading} />
    }
  }

  return (
    <div className="h-screen flex bg-background">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
