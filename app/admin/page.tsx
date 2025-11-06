"use client"

import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { ThemeProvider } from "@/components/theme-provider"

export default function AdminPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AdminDashboard />
    </ThemeProvider>
  )
}
