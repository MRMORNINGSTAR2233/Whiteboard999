"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Brain, Zap, Wand2, Layout, Lightbulb, RefreshCw, CheckCircle } from "lucide-react"

interface AIAssistantProps {
  onGenerateDiagram: (prompt: string, type: string) => void
  onApplyLayout: (layoutType: string) => void
  onGenerateContent: (contentType: string, context: string) => void
}

const diagramTypes = [
  { id: "flowchart", name: "Flowchart", icon: "🔄", description: "Process flows and decision trees" },
  { id: "mindmap", name: "Mind Map", icon: "🧠", description: "Ideas and concept mapping" },
  { id: "orgchart", name: "Org Chart", icon: "👥", description: "Organizational structures" },
  { id: "timeline", name: "Timeline", icon: "📅", description: "Project timelines and schedules" },
  { id: "wireframe", name: "Wireframe", icon: "📱", description: "UI/UX mockups and layouts" },
  { id: "database", name: "Database Schema", icon: "🗄️", description: "Data models and relationships" },
]

const layoutSuggestions = [
  { id: "auto-align", name: "Auto Align", description: "Align objects to grid" },
  { id: "distribute", name: "Distribute", description: "Even spacing between objects" },
  { id: "hierarchy", name: "Hierarchy", description: "Organize in hierarchical structure" },
  { id: "circular", name: "Circular", description: "Arrange in circular pattern" },
  { id: "tree", name: "Tree Layout", description: "Tree-like organization" },
  { id: "force-directed", name: "Force Directed", description: "Physics-based layout" },
]

const contentTypes = [
  { id: "brainstorm", name: "Brainstorm Ideas", icon: "💡" },
  { id: "user-stories", name: "User Stories", icon: "📝" },
  { id: "meeting-notes", name: "Meeting Notes", icon: "📋" },
  { id: "project-plan", name: "Project Plan", icon: "📊" },
  { id: "swot-analysis", name: "SWOT Analysis", icon: "⚖️" },
  { id: "personas", name: "User Personas", icon: "👤" },
]

export function AIAssistant({ onGenerateDiagram, onApplyLayout, onGenerateContent }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState("generate")
  const [prompt, setPrompt] = useState("")
  const [selectedDiagramType, setSelectedDiagramType] = useState("flowchart")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [contentContext, setContentContext] = useState("")

  const handleGenerateDiagram = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      const response = await fetch("/api/ai/generate-diagram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          type: selectedDiagramType,
          context: "whiteboard canvas",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate diagram")
      }

      const diagramData = await response.json()

      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            setIsGenerating(false)
            onGenerateDiagram(prompt, selectedDiagramType)
            return 100
          }
          return prev + 20
        })
      }, 100)
    } catch (error) {
      console.error("Diagram generation failed:", error)
      setIsGenerating(false)
      setGenerationProgress(0)
      onGenerateDiagram(prompt, selectedDiagramType)
    }
  }

  const handleSmartSuggestions = async () => {
    try {
      const response = await fetch("/api/ai/smart-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          elements: [],
          context: "whiteboard analysis",
          userIntent: "improve layout",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get suggestions")
      }

      const suggestionsData = await response.json()
      setSuggestions(suggestionsData.insights || [])
    } catch (error) {
      console.error("Smart suggestions failed:", error)
      setSuggestions([])
    }
  }

  const handleGenerateContent = async (contentType: string) => {
    try {
      const response = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType,
          context: contentContext,
          prompt: "",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate content")
      }

      const contentData = await response.json()
      onGenerateContent(contentType, JSON.stringify(contentData))
    } catch (error) {
      console.error("Content generation failed:", error)
      onGenerateContent(contentType, contentContext)
    }
  }

  return (
    <Card className="w-96 h-[600px] shadow-xl border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          AI Assistant
          <Badge variant="secondary" className="ml-auto rounded-md">
            <Brain className="w-3 h-3 mr-1" />
            Groq
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mx-4 mb-4 rounded-md">
            <TabsTrigger value="generate" className="rounded-md">
              Generate
            </TabsTrigger>
            <TabsTrigger value="layout" className="rounded-md">
              Layout
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-md">
              Content
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[480px] px-4">
            <TabsContent value="generate" className="space-y-4 mt-0">
              <div>
                <label className="text-sm font-medium mb-2 block">Describe what you want to create</label>
                <Textarea
                  placeholder="e.g., Create a user onboarding flowchart with login, verification, and welcome steps..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] resize-none rounded-md border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Diagram Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {diagramTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant={selectedDiagramType === type.id ? "default" : "outline"}
                      size="sm"
                      className="h-auto p-3 flex flex-col gap-1 rounded-md border-border"
                      onClick={() => setSelectedDiagramType(type.id)}
                    >
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-xs font-medium">{type.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                    <span className="text-sm">Generating diagram with AI...</span>
                  </div>
                  <Progress value={generationProgress} className="w-full" />
                </div>
              )}

              <Button
                onClick={handleGenerateDiagram}
                disabled={!prompt.trim() || isGenerating}
                className="w-full rounded-md"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Diagram
              </Button>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Quick Templates
                </h4>
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs rounded-md">
                    Software Development Workflow
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs rounded-md">
                    Customer Journey Map
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs rounded-md">
                    Project Planning Timeline
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs rounded-md">
                    System Architecture Diagram
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4 mt-0">
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Layout className="w-4 h-4" />
                  Smart Layout Suggestions
                </h4>
                <div className="space-y-2">
                  {layoutSuggestions.map((layout) => (
                    <Button
                      key={layout.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start h-auto p-3 rounded-md border-border bg-transparent"
                      onClick={() => onApplyLayout(layout.id)}
                    >
                      <div className="text-left">
                        <div className="font-medium text-sm">{layout.name}</div>
                        <div className="text-xs text-muted-foreground">{layout.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <Button
                  onClick={handleSmartSuggestions}
                  variant="outline"
                  className="w-full rounded-md border-border bg-transparent"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Current Layout
                </Button>

                {suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <h5 className="text-sm font-medium">AI Suggestions:</h5>
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-accent/10 rounded-md text-xs">
                        <CheckCircle className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-0">
              <div>
                <h4 className="text-sm font-medium mb-3">Generate Content</h4>
                <div className="grid grid-cols-2 gap-2">
                  {contentTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant="outline"
                      size="sm"
                      className="h-auto p-3 flex flex-col gap-1 rounded-md border-border bg-transparent"
                      onClick={() => handleGenerateContent(type.id)}
                    >
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-xs font-medium text-center">{type.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Context (Optional)</label>
                <Textarea
                  placeholder="Provide context about your project, team, or goals..."
                  className="min-h-[80px] resize-none rounded-md border-border"
                  value={contentContext}
                  onChange={(e) => setContentContext(e.target.value)}
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">AI Writing Tools</h4>
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start rounded-md">
                    <Zap className="w-4 h-4 mr-2" />
                    Improve Text Clarity
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start rounded-md">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Variations
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start rounded-md">
                    <Brain className="w-4 h-4 mr-2" />
                    Summarize Content
                  </Button>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  )
}
