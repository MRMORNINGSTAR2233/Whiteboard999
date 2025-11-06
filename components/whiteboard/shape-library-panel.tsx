"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  X,
  Square,
  Circle,
  Triangle,
  Diamond,
  Hexagon,
  Star,
  Heart,
  MessageSquare,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  Database,
  Cloud,
  Server,
  Monitor,
  Smartphone,
  Wifi,
  Lock,
  User,
  Users,
  Settings,
  Home,
  Mail,
  Phone,
  Calendar,
  Clock,
  Check,
  AlertTriangle,
  Info,
  HelpCircle,
  FileText,
  Search,
  Globe,
  Shield,
  Cpu,
  HardDrive,
  Router,
  Layers,
} from "lucide-react"

interface ShapeLibraryPanelProps {
  onClose: () => void
  onShapeSelect: (shapeType: string, shapeData: any) => void
}

const basicShapes = [
  { id: "rectangle", name: "Rectangle", icon: Square, color: "#3b82f6", keywords: ["box", "square", "rect"] },
  { id: "ellipse", name: "Circle", icon: Circle, color: "#10b981", keywords: ["oval", "round", "ellipse"] },
  { id: "triangle", name: "Triangle", icon: Triangle, color: "#f59e0b", keywords: ["arrow", "point"] },
  { id: "diamond", name: "Diamond", icon: Diamond, color: "#ef4444", keywords: ["rhombus", "decision"] },
  { id: "hexagon", name: "Hexagon", icon: Hexagon, color: "#8b5cf6", keywords: ["hex", "six"] },
  { id: "star", name: "Star", icon: Star, color: "#f97316", keywords: ["favorite", "rating"] },
  { id: "heart", name: "Heart", icon: Heart, color: "#ec4899", keywords: ["love", "like"] },
]

const flowchartShapes = [
  {
    id: "process",
    name: "Process",
    icon: Square,
    color: "#3b82f6",
    description: "Process step",
    keywords: ["step", "action"],
  },
  {
    id: "decision",
    name: "Decision",
    icon: Diamond,
    color: "#f59e0b",
    description: "Decision point",
    keywords: ["choice", "if"],
  },
  {
    id: "start-end",
    name: "Start/End",
    icon: Circle,
    color: "#10b981",
    description: "Start or end point",
    keywords: ["begin", "finish"],
  },
  {
    id: "data",
    name: "Data",
    icon: Database,
    color: "#6366f1",
    description: "Data storage",
    keywords: ["storage", "db"],
  },
  {
    id: "document",
    name: "Document",
    icon: FileText,
    color: "#8b5cf6",
    description: "Document or report",
    keywords: ["file", "report"],
  },
  {
    id: "connector",
    name: "Connector",
    icon: Circle,
    color: "#64748b",
    description: "Connection point",
    keywords: ["link", "join"],
  },
]

const arrows = [
  { id: "arrow-right", name: "Right Arrow", icon: ArrowRight, color: "#374151", keywords: ["next", "forward"] },
  { id: "arrow-left", name: "Left Arrow", icon: ArrowLeft, color: "#374151", keywords: ["back", "previous"] },
  { id: "arrow-up", name: "Up Arrow", icon: ArrowUp, color: "#374151", keywords: ["top", "increase"] },
  { id: "arrow-down", name: "Down Arrow", icon: ArrowDown, color: "#374151", keywords: ["bottom", "decrease"] },
]

const callouts = [
  {
    id: "speech-bubble",
    name: "Speech Bubble",
    icon: MessageSquare,
    color: "#3b82f6",
    description: "Speech or comment",
    keywords: ["chat", "talk"],
  },
  {
    id: "thought-bubble",
    name: "Thought Bubble",
    icon: Cloud,
    color: "#06b6d4",
    description: "Thought or idea",
    keywords: ["think", "idea"],
  },
  {
    id: "info-callout",
    name: "Info",
    icon: Info,
    color: "#0ea5e9",
    description: "Information callout",
    keywords: ["information", "note"],
  },
  {
    id: "warning-callout",
    name: "Warning",
    icon: AlertTriangle,
    color: "#f59e0b",
    description: "Warning callout",
    keywords: ["alert", "caution"],
  },
  {
    id: "success-callout",
    name: "Success",
    icon: Check,
    color: "#10b981",
    description: "Success callout",
    keywords: ["done", "complete"],
  },
  {
    id: "question-callout",
    name: "Question",
    icon: HelpCircle,
    color: "#8b5cf6",
    description: "Question callout",
    keywords: ["help", "ask"],
  },
]

const techShapes = [
  { id: "server", name: "Server", icon: Server, color: "#374151", keywords: ["backend", "host"] },
  { id: "database", name: "Database", icon: Database, color: "#059669", keywords: ["db", "storage", "data"] },
  { id: "cloud", name: "Cloud", icon: Cloud, color: "#0ea5e9", keywords: ["aws", "azure", "gcp"] },
  { id: "monitor", name: "Monitor", icon: Monitor, color: "#6366f1", keywords: ["screen", "display"] },
  { id: "smartphone", name: "Mobile", icon: Smartphone, color: "#ec4899", keywords: ["phone", "app"] },
  { id: "wifi", name: "Network", icon: Wifi, color: "#f59e0b", keywords: ["internet", "connection"] },
  { id: "security", name: "Security", icon: Lock, color: "#ef4444", keywords: ["auth", "protection"] },
  { id: "cpu", name: "Processor", icon: Cpu, color: "#7c3aed", keywords: ["chip", "compute"] },
  { id: "storage", name: "Storage", icon: HardDrive, color: "#059669", keywords: ["disk", "memory"] },
  { id: "router", name: "Router", icon: Router, color: "#dc2626", keywords: ["network", "gateway"] },
]

const uiElements = [
  { id: "user", name: "User", icon: User, color: "#3b82f6", keywords: ["person", "profile"] },
  { id: "users", name: "Users", icon: Users, color: "#10b981", keywords: ["team", "group"] },
  { id: "settings", name: "Settings", icon: Settings, color: "#6b7280", keywords: ["config", "options"] },
  { id: "home", name: "Home", icon: Home, color: "#f59e0b", keywords: ["house", "main"] },
  { id: "mail", name: "Email", icon: Mail, color: "#ef4444", keywords: ["message", "inbox"] },
  { id: "phone", name: "Phone", icon: Phone, color: "#8b5cf6", keywords: ["call", "contact"] },
  { id: "calendar", name: "Calendar", icon: Calendar, color: "#06b6d4", keywords: ["date", "schedule"] },
  { id: "clock", name: "Time", icon: Clock, color: "#64748b", keywords: ["timer", "duration"] },
  { id: "globe", name: "Web", icon: Globe, color: "#0ea5e9", keywords: ["internet", "website"] },
  { id: "shield", name: "Shield", icon: Shield, color: "#10b981", keywords: ["protect", "secure"] },
]

export function ShapeLibraryPanel({ onClose, onShapeSelect }: ShapeLibraryPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState("basic")
  const [searchQuery, setSearchQuery] = useState("")

  const handleShapeClick = (shape: any) => {
    const shapeData = {
      type: "geo",
      props: {
        geo:
          shape.id === "rectangle"
            ? "rectangle"
            : shape.id === "ellipse"
              ? "ellipse"
              : shape.id === "triangle"
                ? "triangle"
                : shape.id === "diamond"
                  ? "diamond"
                  : shape.id === "hexagon"
                    ? "hexagon"
                    : shape.id === "star"
                      ? "star"
                      : "rectangle",
        w: 120,
        h: 80,
        fill: "solid",
        color: shape.color || "#3b82f6",
        size: "m",
        text: shape.name,
      },
    }
    onShapeSelect(shape.id, shapeData)
  }

  const filterShapes = (shapes: any[]) => {
    if (!searchQuery) return shapes
    return shapes.filter(
      (shape) =>
        shape.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shape.keywords?.some((keyword: string) => keyword.toLowerCase().includes(searchQuery.toLowerCase())),
    )
  }

  const renderShapeGrid = (shapes: any[], columns = 3) => (
    <TooltipProvider>
      <div className={`grid grid-cols-${columns} gap-3 p-4`}>
        {filterShapes(shapes).map((shape) => (
          <Tooltip key={shape.id}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-gray-200 hover:text-gray-800 hover:border-gray-400 hover:shadow-sm transition-all duration-200 bg-transparent group"
                onClick={() => handleShapeClick(shape)}
              >
                {React.createElement(shape.icon, {
                  className: "h-6 w-6 group-hover:scale-105 transition-transform duration-200",
                  style: { color: shape.color },
                })}
                <span className="text-xs font-medium">{shape.name}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 text-white text-xs">
              <p>{shape.description || shape.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )

  const allShapes = [...basicShapes, ...flowchartShapes, ...arrows, ...callouts, ...techShapes, ...uiElements]
  const filteredResults = filterShapes(allShapes)

  return (
    <div className="w-80 h-full bg-background border-r border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Shape Library
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="hover:bg-gray-200 hover:text-gray-800 transition-all duration-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shapes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 hover:border-gray-300 focus:border-gray-400 transition-all duration-200"
          />
        </div>
      </div>

      {searchQuery ? (
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-sm font-medium">Search Results</h4>
              <Badge variant="secondary" className="text-xs">
                {filteredResults.length}
              </Badge>
            </div>
            {filteredResults.length > 0 ? (
              <TooltipProvider>
                <div className="grid grid-cols-3 gap-3">
                  {filteredResults.map((shape) => (
                    <Tooltip key={shape.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-gray-200 hover:text-gray-800 hover:border-gray-400 hover:shadow-sm transition-all duration-200 bg-transparent group"
                          onClick={() => handleShapeClick(shape)}
                        >
                          {React.createElement(shape.icon, {
                            className: "h-6 w-6 group-hover:scale-105 transition-transform duration-200",
                            style: { color: shape.color },
                          })}
                          <span className="text-xs font-medium">{shape.name}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 text-white text-xs">
                        <p>{shape.description || shape.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No shapes found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      ) : (
        <>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-4 w-full mx-4 mt-4">
              <TabsTrigger
                value="basic"
                className="text-xs hover:bg-gray-200 hover:text-gray-800 transition-all duration-200"
              >
                Basic
              </TabsTrigger>
              <TabsTrigger
                value="flowchart"
                className="text-xs hover:bg-gray-200 hover:text-gray-800 transition-all duration-200"
              >
                Flow
              </TabsTrigger>
              <TabsTrigger
                value="callouts"
                className="text-xs hover:bg-gray-200 hover:text-gray-800 transition-all duration-200"
              >
                Callouts
              </TabsTrigger>
              <TabsTrigger
                value="tech"
                className="text-xs hover:bg-gray-200 hover:text-gray-800 transition-all duration-200"
              >
                Tech
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <TabsContent value="basic" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <div className="px-4 py-2 bg-muted/50">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        Basic Shapes
                        <Badge variant="secondary" className="text-xs">
                          {basicShapes.length}
                        </Badge>
                      </h4>
                    </div>
                    {renderShapeGrid(basicShapes)}
                  </div>

                  <div>
                    <div className="px-4 py-2 bg-muted/50">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        Arrows
                        <Badge variant="secondary" className="text-xs">
                          {arrows.length}
                        </Badge>
                      </h4>
                    </div>
                    {renderShapeGrid(arrows)}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="flowchart" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <div className="px-4 py-2 bg-muted/50">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        Flowchart Elements
                        <Badge variant="secondary" className="text-xs">
                          {flowchartShapes.length}
                        </Badge>
                      </h4>
                    </div>
                    {renderShapeGrid(flowchartShapes)}
                  </div>

                  <div>
                    <div className="px-4 py-2 bg-muted/50">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        UI Elements
                        <Badge variant="secondary" className="text-xs">
                          {uiElements.length}
                        </Badge>
                      </h4>
                    </div>
                    {renderShapeGrid(uiElements)}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="callouts" className="mt-0">
                <div>
                  <div className="px-4 py-2 bg-muted/50">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      Callouts & Annotations
                      <Badge variant="secondary" className="text-xs">
                        {callouts.length}
                      </Badge>
                    </h4>
                  </div>
                  <TooltipProvider>
                    <div className="grid grid-cols-2 gap-3 p-4">
                      {filterShapes(callouts).map((shape) => (
                        <Tooltip key={shape.id}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-200 hover:text-gray-800 hover:border-gray-400 hover:shadow-sm transition-all duration-200 bg-transparent group"
                              onClick={() => handleShapeClick(shape)}
                            >
                              {React.createElement(shape.icon, {
                                className: "h-6 w-6 group-hover:scale-105 transition-transform duration-200",
                                style: { color: shape.color },
                              })}
                              <div className="text-center">
                                <div className="text-xs font-medium">{shape.name}</div>
                                <div className="text-xs text-muted-foreground group-hover:text-gray-600">
                                  {shape.description}
                                </div>
                              </div>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-900 text-white text-xs">
                            <p>{shape.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>
              </TabsContent>

              <TabsContent value="tech" className="mt-0">
                <div>
                  <div className="px-4 py-2 bg-muted/50">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      Technology & Infrastructure
                      <Badge variant="secondary" className="text-xs">
                        {techShapes.length}
                      </Badge>
                    </h4>
                  </div>
                  {renderShapeGrid(techShapes)}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </>
      )}
    </div>
  )
}
