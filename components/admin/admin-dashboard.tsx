"use client"

import { useState } from "react"
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

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <DashboardOverview />
      case "users":
        return <UserManagement />
      case "boards":
        return <BoardManagement />
      case "analytics":
        return <AnalyticsPanel />
      case "ai-insights":
        return <AIInsights />
      case "settings":
        return <SystemSettings />
      default:
        return <DashboardOverview />
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
