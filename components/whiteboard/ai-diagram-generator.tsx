"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Wand2, Brain, Sparkles, Download, RefreshCw, Zap, FileText, ImageIcon, Code } from "lucide-react"

interface DiagramGeneratorProps {
  isVisible: boolean
  onClose: () => void
  onGenerate: (config: DiagramConfig) => void
}

interface DiagramConfig {
  prompt: string
  type: string
  style: string
  complexity: number
  includeLabels: boolean
  colorScheme: string
  layout: string
}

const diagramTypes = [
  { id: "flowchart", name: "Flowchart", description: "Process flows and workflows" },
  { id: "mindmap", name: "Mind Map", description: "Ideas and concept mapping" },
  { id: "orgchart", name: "Organization Chart", description: "Hierarchical structures" },
  { id: "timeline", name: "Timeline", description: "Sequential events and milestones" },
  { id: "wireframe", name: "Wireframe", description: "UI/UX layouts and mockups" },
  { id: "architecture", name: "System Architecture", description: "Technical system designs" },
  { id: "userjourney", name: "User Journey", description: "User experience flows" },
  { id: "database", name: "Database Schema", description: "Data models and relationships" },
]

const styleOptions = [
  { id: "modern", name: "Modern", preview: "Clean lines, minimal design" },
  { id: "hand-drawn", name: "Hand-drawn", preview: "Sketchy, organic feel" },
  { id: "corporate", name: "Corporate", preview: "Professional, structured" },
  { id: "creative", name: "Creative", preview: "Colorful, expressive" },
  { id: "technical", name: "Technical", preview: "Precise, detailed" },
]

const colorSchemes = [
  { id: "default", name: "Default", colors: ["#15803d", "#84cc16", "#f97316"] },
  { id: "blue", name: "Blue", colors: ["#3b82f6", "#06b6d4", "#8b5cf6"] },
  { id: "warm", name: "Warm", colors: ["#f59e0b", "#ef4444", "#ec4899"] },
  { id: "cool", name: "Cool", colors: ["#10b981", "#06b6d4", "#6366f1"] },
  { id: "monochrome", name: "Monochrome", colors: ["#374151", "#6b7280", "#9ca3af"] },
]

export function AIDiagramGenerator({ isVisible, onClose, onGenerate }: DiagramGeneratorProps) {
  const [config, setConfig] = useState<DiagramConfig>({
    prompt: "",
    type: "flowchart",
    style: "modern",
    complexity: 50,
    includeLabels: true,
    colorScheme: "default",
    layout: "auto",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("prompt")

  const handleGenerate = async () => {
    if (!config.prompt.trim()) return

    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate AI generation
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsGenerating(false)
          onGenerate(config)
          return 100
        }
        return prev + 8
      })
    }, 200)
  }

  const updateConfig = (updates: Partial<DiagramConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }

  if (!isVisible) return null

  return (
    <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[700px] shadow-2xl z-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-accent" />
          AI Diagram Generator
          <Badge variant="secondary" className="ml-auto">
            <Brain className="w-3 h-3 mr-1" />
            GPT-4 Vision
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prompt">Prompt</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <div className="mt-4 h-[500px] overflow-y-auto">
            <TabsContent value="prompt" className="space-y-4 mt-0">
              <div>
                <Label className="text-sm font-medium">Describe your diagram</Label>
                <Textarea
                  placeholder="e.g., Create a user registration flowchart with email verification, password setup, and welcome email steps..."
                  value={config.prompt}
                  onChange={(e) => updateConfig({ prompt: e.target.value })}
                  className="mt-2 min-h-[120px] resize-none"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Diagram Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {diagramTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant={config.type === type.id ? "default" : "outline"}
                      size="sm"
                      className="h-auto p-3 flex flex-col gap-1 text-left"
                      onClick={() => updateConfig({ type: type.id })}
                    >
                      <span className="font-medium text-sm">{type.name}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-medium mb-2 block">Quick Examples</Label>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-auto p-2"
                    onClick={() =>
                      updateConfig({
                        prompt: "Software development lifecycle from planning to deployment with testing phases",
                        type: "flowchart",
                      })
                    }
                  >
                    <FileText className="w-3 h-3 mr-2" />
                    Software Development Lifecycle
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-auto p-2"
                    onClick={() =>
                      updateConfig({
                        prompt: "E-commerce customer journey from discovery to purchase and support",
                        type: "userjourney",
                      })
                    }
                  >
                    <Zap className="w-3 h-3 mr-2" />
                    Customer Journey Map
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-auto p-2"
                    onClick={() =>
                      updateConfig({
                        prompt: "Mobile app wireframe with login, dashboard, and settings screens",
                        type: "wireframe",
                      })
                    }
                  >
                    <ImageIcon className="w-3 h-3 mr-2" />
                    Mobile App Wireframe
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-4 mt-0">
              <div>
                <Label className="text-sm font-medium mb-3 block">Visual Style</Label>
                <div className="space-y-2">
                  {styleOptions.map((style) => (
                    <Button
                      key={style.id}
                      variant={config.style === style.id ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start h-auto p-3"
                      onClick={() => updateConfig({ style: style.id })}
                    >
                      <div className="text-left">
                        <div className="font-medium text-sm">{style.name}</div>
                        <div className="text-xs text-muted-foreground">{style.preview}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Color Scheme</Label>
                <div className="grid grid-cols-2 gap-2">
                  {colorSchemes.map((scheme) => (
                    <Button
                      key={scheme.id}
                      variant={config.colorScheme === scheme.id ? "default" : "outline"}
                      size="sm"
                      className="h-auto p-3 flex flex-col gap-2"
                      onClick={() => updateConfig({ colorScheme: scheme.id })}
                    >
                      <span className="text-sm font-medium">{scheme.name}</span>
                      <div className="flex gap-1">
                        {scheme.colors.map((color, index) => (
                          <div key={index} className="w-4 h-4 rounded-full border" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Complexity Level</Label>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted-foreground">Simple</span>
                  <Slider
                    value={[config.complexity]}
                    onValueChange={(value) => updateConfig({ complexity: value[0] })}
                    max={100}
                    step={10}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground">Detailed</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Current: {config.complexity}% complexity</div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Include Labels</Label>
                    <p className="text-xs text-muted-foreground">Add descriptive text to elements</p>
                  </div>
                  <Switch
                    checked={config.includeLabels}
                    onCheckedChange={(checked) => updateConfig({ includeLabels: checked })}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Layout Algorithm</Label>
                  <div className="space-y-2">
                    {["auto", "hierarchical", "circular", "grid", "force-directed"].map((layout) => (
                      <Button
                        key={layout}
                        variant={config.layout === layout ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start capitalize"
                        onClick={() => updateConfig({ layout })}
                      >
                        {layout.replace("-", " ")}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-2 block">Export Options</Label>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Download className="w-4 h-4 mr-2" />
                      Export as SVG
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Code className="w-4 h-4 mr-2" />
                      Export as Code
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <FileText className="w-4 h-4 mr-2" />
                      Export as Template
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>

          {isGenerating && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                <span className="text-sm">Generating your diagram...</span>
              </div>
              <Progress value={generationProgress} className="w-full" />
            </div>
          )}

          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={!config.prompt.trim() || isGenerating} className="flex-1">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Diagram
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
