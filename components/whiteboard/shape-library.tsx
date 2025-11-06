"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Shapes, Workflow, Users, Database, Network, Sparkles, GitBranch, Calendar, Zap } from "lucide-react"

interface ShapeItem {
  id: string
  name: string
  preview: string
  type: string
  isAI?: boolean
  description?: string
}

interface ShapeCategory {
  id: string
  name: string
  icon: any
  shapes: ShapeItem[]
}

const shapeCategories: ShapeCategory[] = [
  {
    id: "basic",
    name: "Basic Shapes",
    icon: Shapes,
    shapes: [
      { id: "rectangle", name: "Rectangle", preview: "▭", type: "rectangle", description: "Basic rectangle shape" },
      { id: "circle", name: "Circle", preview: "●", type: "circle", description: "Basic circle shape" },
      { id: "triangle", name: "Triangle", preview: "▲", type: "triangle", description: "Basic triangle shape" },
      { id: "diamond", name: "Diamond", preview: "◆", type: "diamond", description: "Diamond/rhombus shape" },
      { id: "star", name: "Star", preview: "★", type: "star", description: "Star shape" },
      { id: "hexagon", name: "Hexagon", preview: "⬡", type: "hexagon", description: "Hexagon shape" },
      { id: "arrow", name: "Arrow", preview: "→", type: "arrow", description: "Arrow connector" },
      { id: "line", name: "Line", preview: "─", type: "line", description: "Straight line" },
    ],
  },
  {
    id: "flowchart",
    name: "Flowchart",
    icon: Workflow,
    shapes: [
      { id: "process", name: "Process", preview: "▭", type: "rectangle", description: "Process step" },
      { id: "decision", name: "Decision", preview: "◇", type: "diamond", description: "Decision point" },
      { id: "start-end", name: "Start/End", preview: "⬭", type: "oval", description: "Start or end point" },
      { id: "connector", name: "Connector", preview: "●", type: "circle", description: "Flow connector" },
      { id: "document", name: "Document", preview: "📄", type: "document", description: "Document symbol" },
      { id: "data", name: "Data", preview: "⬟", type: "parallelogram", description: "Data input/output" },
      { id: "predefined", name: "Predefined", preview: "▢", type: "predefined", description: "Predefined process" },
      { id: "manual", name: "Manual", preview: "⬢", type: "manual", description: "Manual operation" },
    ],
  },
  {
    id: "mindmap",
    name: "Mind Map",
    icon: GitBranch,
    shapes: [
      { id: "central-topic", name: "Central Topic", preview: "●", type: "circle", description: "Main topic" },
      { id: "main-branch", name: "Main Branch", preview: "▭", type: "rectangle", description: "Primary branch" },
      { id: "sub-branch", name: "Sub Branch", preview: "▢", type: "rounded-rect", description: "Secondary branch" },
      { id: "leaf-node", name: "Leaf Node", preview: "○", type: "small-circle", description: "End node" },
      { id: "connection", name: "Connection", preview: "╱", type: "curved-line", description: "Branch connector" },
      { id: "note", name: "Note", preview: "📝", type: "sticky-note", description: "Additional note" },
    ],
  },
  {
    id: "org-chart",
    name: "Org Chart",
    icon: Users,
    shapes: [
      { id: "ceo", name: "CEO", preview: "👑", type: "executive", description: "Chief Executive" },
      { id: "manager", name: "Manager", preview: "👤", type: "manager", description: "Department manager" },
      { id: "employee", name: "Employee", preview: "👥", type: "employee", description: "Team member" },
      { id: "department", name: "Department", preview: "🏢", type: "department", description: "Department box" },
      { id: "team", name: "Team", preview: "👫", type: "team", description: "Team group" },
      { id: "contractor", name: "Contractor", preview: "🔧", type: "contractor", description: "External contractor" },
    ],
  },
  {
    id: "database",
    name: "Database",
    icon: Database,
    shapes: [
      { id: "table", name: "Table", preview: "🗂️", type: "db-table", description: "Database table" },
      { id: "view", name: "View", preview: "👁️", type: "db-view", description: "Database view" },
      { id: "stored-proc", name: "Stored Proc", preview: "⚙️", type: "db-procedure", description: "Stored procedure" },
      { id: "index", name: "Index", preview: "📇", type: "db-index", description: "Database index" },
      { id: "trigger", name: "Trigger", preview: "⚡", type: "db-trigger", description: "Database trigger" },
      { id: "function", name: "Function", preview: "ƒ", type: "db-function", description: "Database function" },
    ],
  },
  {
    id: "network",
    name: "Network",
    icon: Network,
    shapes: [
      { id: "server", name: "Server", preview: "🖥️", type: "server", description: "Server node" },
      { id: "router", name: "Router", preview: "📡", type: "router", description: "Network router" },
      { id: "switch", name: "Switch", preview: "🔀", type: "switch", description: "Network switch" },
      { id: "firewall", name: "Firewall", preview: "🛡️", type: "firewall", description: "Security firewall" },
      { id: "cloud", name: "Cloud", preview: "☁️", type: "cloud", description: "Cloud service" },
      { id: "database-server", name: "DB Server", preview: "🗄️", type: "db-server", description: "Database server" },
    ],
  },
  {
    id: "timeline",
    name: "Timeline",
    icon: Calendar,
    shapes: [
      { id: "milestone", name: "Milestone", preview: "◆", type: "milestone", description: "Project milestone" },
      { id: "task", name: "Task", preview: "▭", type: "task", description: "Task block" },
      { id: "phase", name: "Phase", preview: "▬", type: "phase", description: "Project phase" },
      { id: "deadline", name: "Deadline", preview: "⚠️", type: "deadline", description: "Important deadline" },
      { id: "dependency", name: "Dependency", preview: "↗", type: "dependency", description: "Task dependency" },
    ],
  },
  {
    id: "ai-generated",
    name: "AI Generated",
    icon: Sparkles,
    shapes: [
      {
        id: "ai-process",
        name: "Smart Process",
        preview: "🤖",
        type: "ai-process",
        isAI: true,
        description: "AI-enhanced process",
      },
      {
        id: "ai-decision",
        name: "AI Decision",
        preview: "🧠",
        type: "ai-decision",
        isAI: true,
        description: "AI decision node",
      },
      {
        id: "ai-connector",
        name: "Smart Link",
        preview: "🔗",
        type: "ai-connector",
        isAI: true,
        description: "Intelligent connector",
      },
      {
        id: "ai-custom",
        name: "Custom Shape",
        preview: "✨",
        type: "ai-custom",
        isAI: true,
        description: "AI-generated custom shape",
      },
      {
        id: "ai-analysis",
        name: "Analysis",
        preview: "📊",
        type: "ai-analysis",
        isAI: true,
        description: "Data analysis node",
      },
      {
        id: "ai-prediction",
        name: "Prediction",
        preview: "🔮",
        type: "ai-prediction",
        isAI: true,
        description: "Predictive model",
      },
    ],
  },
]

export function ShapeLibrary() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("basic")

  const currentCategory = shapeCategories.find((cat) => cat.id === activeCategory)
  const filteredShapes =
    currentCategory?.shapes.filter(
      (shape) =>
        shape.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shape.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  const handleDragStart = (e: React.DragEvent, shape: ShapeItem) => {
    e.dataTransfer.setData("shape-type", shape.type)
    e.dataTransfer.setData("shape-id", shape.id)
    e.dataTransfer.setData("shape-name", shape.name)
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <Card className="w-80 h-[600px] shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shapes className="w-5 h-5" />
          Shape Library
          <Badge variant="secondary" className="ml-auto text-xs">
            {shapeCategories.reduce((total, cat) => total + cat.shapes.length, 0)} shapes
          </Badge>
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search shapes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <ScrollArea className="w-full">
            <TabsList className="w-full justify-start px-4 mb-2 flex-wrap h-auto">
              {shapeCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs flex items-center gap-1">
                  <category.icon className="w-3 h-3" />
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          {shapeCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <ScrollArea className="h-[480px] px-4">
                <div className="grid grid-cols-2 gap-2 pb-4">
                  {(searchTerm ? filteredShapes : category.shapes).map((shape) => (
                    <Button
                      key={shape.id}
                      variant="outline"
                      className="h-20 flex flex-col gap-1 relative bg-transparent hover:bg-accent/50 cursor-grab active:cursor-grabbing transition-all"
                      draggable
                      onDragStart={(e) => handleDragStart(e, shape)}
                      title={shape.description}
                    >
                      <span className="text-2xl select-none">{shape.preview}</span>
                      <span className="text-xs font-medium select-none">{shape.name}</span>
                      {shape.isAI && (
                        <Badge
                          variant="secondary"
                          className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-gradient-to-r from-purple-500 to-pink-500"
                        >
                          <Sparkles className="w-3 h-3 text-white" />
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Quick Actions</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" size="sm" className="justify-start bg-transparent">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Shapes
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start bg-transparent">
                      <Workflow className="w-4 h-4 mr-2" />
                      Create Template
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
