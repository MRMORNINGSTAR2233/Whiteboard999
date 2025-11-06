"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  Brain,
  Shield,
  Database,
  Zap,
  AlertTriangle,
  Activity,
  Sparkles,
} from "lucide-react"

interface AdminSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const menuItems = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    description: "System overview and metrics",
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
    description: "Manage users and permissions",
    badge: "124",
  },
  {
    id: "boards",
    label: "Board Management",
    icon: FileText,
    description: "Manage whiteboards and content",
    badge: "1.2k",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Usage analytics and insights",
  },
  {
    id: "ai-insights",
    label: "AI Insights",
    icon: Brain,
    description: "AI usage and performance",
    badge: "New",
    badgeVariant: "secondary" as const,
  },
]

const systemItems = [
  {
    id: "settings",
    label: "System Settings",
    icon: Settings,
    description: "Platform configuration",
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    description: "Security and compliance",
    badge: "2",
    badgeVariant: "destructive" as const,
  },
  {
    id: "database",
    label: "Database",
    icon: Database,
    description: "Database management",
  },
  {
    id: "performance",
    label: "Performance",
    icon: Activity,
    description: "System performance monitoring",
  },
]

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">AI Whiteboard Platform</p>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">MAIN</h3>
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => onSectionChange(item.id)}
                  >
                    <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant={item.badgeVariant || "outline"} className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* System Navigation */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">SYSTEM</h3>
              <div className="space-y-1">
                {systemItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => onSectionChange(item.id)}
                  >
                    <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant={item.badgeVariant || "outline"} className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">QUICK ACTIONS</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Zap className="w-4 h-4 mr-2" />
                  Restart Services
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  View Alerts
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
