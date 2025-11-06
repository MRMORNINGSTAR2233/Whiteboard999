"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search, Settings, Eye } from "lucide-react"

interface Template {
  id: string
  name: string
  category: string
  description: string
  preview: string
  color: string
}

const templates: Template[] = [
  {
    id: "1",
    name: "Customer experience journey map",
    category: "Customer success teams recommend these templates",
    description: "Map out customer touchpoints and experiences",
    preview: "/customer-journey-map-with-colorful-timeline.jpg",
    color: "bg-pink-500",
  },
  {
    id: "2",
    name: "Buyer experience journey map",
    category: "Customer success teams recommend these templates",
    description: "Track buyer interactions and decision points",
    preview: "/buyer-journey-flowchart-with-stages.jpg",
    color: "bg-red-500",
  },
  {
    id: "3",
    name: "Stakeholder interviews",
    category: "Customer success teams recommend these templates",
    description: "Structure stakeholder interview sessions",
    preview: "/stakeholder-interview-template-with-sections.jpg",
    color: "bg-blue-500",
  },
  {
    id: "4",
    name: "Process flowchart",
    category: "Customer success teams recommend these templates",
    description: "Create detailed process flow diagrams",
    preview: "/process-flowchart-with-decision-points.jpg",
    color: "bg-red-500",
  },
  {
    id: "5",
    name: "Service blueprint",
    category: "Customer success teams recommend these templates",
    description: "Design comprehensive service blueprints",
    preview: "/service-blueprint-with-swim-lanes.jpg",
    color: "bg-purple-500",
  },
  {
    id: "6",
    name: "Simple feedback",
    category: "Customer success teams recommend these templates",
    description: "Collect and organize feedback effectively",
    preview: "/feedback-collection-template-with-categories.jpg",
    color: "bg-pink-500",
  },
  {
    id: "7",
    name: "Sprint planning",
    category: "50-minute meetings for customer success teams",
    description: "Plan and organize sprint activities",
    preview: "/sprint-planning-board-with-tasks.jpg",
    color: "bg-gray-800",
  },
  {
    id: "8",
    name: "Retrospective",
    category: "50-minute meetings for customer success teams",
    description: "Conduct effective team retrospectives",
    preview: "/retrospective-template-with-sections.jpg",
    color: "bg-gray-800",
  },
  {
    id: "9",
    name: "Mind map",
    category: "Brainstorm",
    description: "Create visual mind maps for ideation",
    preview: "/mind-map-with-central-topic-and-branches.jpg",
    color: "bg-green-500",
  },
  {
    id: "10",
    name: "SWOT analysis",
    category: "Strategize",
    description: "Analyze strengths, weaknesses, opportunities, threats",
    preview: "/swot-analysis-matrix-template.jpg",
    color: "bg-blue-500",
  },
]

const categories = [
  { id: "for-you", name: "For you", icon: "👤" },
  { id: "starred", name: "Starred", icon: "⭐" },
  { id: "strategize", name: "Strategize", icon: "🎯" },
  { id: "plan", name: "Plan", icon: "📋" },
  { id: "research", name: "Research", icon: "❓" },
  { id: "brainstorm", name: "Brainstorm", icon: "💡" },
  { id: "prioritize", name: "Prioritize", icon: "📊" },
  { id: "create", name: "Create", icon: "👥" },
  { id: "present", name: "Present", icon: "🎤" },
  { id: "reflect", name: "Reflect", icon: "🎬" },
  { id: "connect", name: "Connect", icon: "❤️" },
  { id: "luma", name: "LUMA System", icon: "🔲" },
  { id: "agile", name: "Agile", icon: "⚡" },
  { id: "design-thinking", name: "Design thinking", icon: "🧠" },
]

interface TemplateLibraryProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: Template) => void
}

export function TemplateLibrary({ isOpen, onClose, onSelectTemplate }: TemplateLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState("for-you")
  const [searchQuery, setSearchQuery] = useState("")

  if (!isOpen) return null

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const groupedTemplates = filteredTemplates.reduce(
    (acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = []
      }
      acc[template.category].push(template)
      return acc
    },
    {} as Record<string, Template[]>,
  )

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Templates</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="space-y-1">
                {categories.slice(0, 2).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedCategory === category.id ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span>{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Use cases</h3>
                <div className="space-y-1">
                  {categories.slice(2, 11).map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category.id ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span>{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Ways of working</h3>
                <div className="space-y-1">
                  {categories.slice(11).map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category.id ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span>{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Find a template"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base border-2 border-blue-500 rounded-lg"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {Object.entries(groupedTemplates).map(([categoryName, categoryTemplates]) => (
              <div key={categoryName} className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{categoryName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`${template.color} rounded-lg p-6 cursor-pointer hover:opacity-90 transition-opacity group`}
                      onClick={() => onSelectTemplate(template)}
                    >
                      <div className="bg-white rounded-md p-4 mb-4 min-h-[120px] flex items-center justify-center relative overflow-hidden">
                        <img
                          src={template.preview || "/placeholder.svg"}
                          alt={template.name}
                          className="max-w-full max-h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-2">
                            <Eye className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                      </div>
                      <h4 className="text-white font-medium text-lg">{template.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
