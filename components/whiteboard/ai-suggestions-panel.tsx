"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Brain, Zap, CheckCircle, X, RefreshCw, TrendingUp, Users, Lightbulb } from "lucide-react"

interface Suggestion {
  id: string
  type: "layout" | "content" | "design" | "workflow"
  title: string
  description: string
  confidence: number
  impact: "low" | "medium" | "high"
  category: string
  preview?: string
}

interface AISuggestionsPanelProps {
  isVisible: boolean
  onClose: () => void
  onApplySuggestion: (suggestion: Suggestion) => void
}

const mockSuggestions: Suggestion[] = [
  {
    id: "1",
    type: "layout",
    title: "Improve Visual Hierarchy",
    description: "Group related elements and add more spacing between sections for better readability.",
    confidence: 92,
    impact: "high",
    category: "Design",
    preview: "Move 'Research' closer to 'Project Goals' and increase spacing",
  },
  {
    id: "2",
    type: "content",
    title: "Add Missing Process Steps",
    description: "Your workflow is missing validation and testing phases that are common in this type of process.",
    confidence: 87,
    impact: "medium",
    category: "Process",
    preview: "Insert 'Validation' step between 'Development' and 'Launch'",
  },
  {
    id: "3",
    type: "design",
    title: "Enhance Color Coding",
    description: "Use consistent colors to represent different types of activities or stakeholders.",
    confidence: 78,
    impact: "medium",
    category: "Visual",
    preview: "Apply blue for planning, green for execution, orange for review",
  },
  {
    id: "4",
    type: "workflow",
    title: "Add Decision Points",
    description: "Include decision diamonds to show where the process branches or requires approval.",
    confidence: 85,
    impact: "high",
    category: "Process",
    preview: "Add approval gates after key milestones",
  },
]

export function AISuggestionsPanel({ isVisible, onClose, onApplySuggestion }: AISuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isVisible) {
      analyzeBoard()
    }
  }, [isVisible])

  const analyzeBoard = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setSuggestions([])

    // Simulate AI analysis
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsAnalyzing(false)
          setSuggestions(mockSuggestions)
          return 100
        }
        return prev + 12.5
      })
    }, 300)
  }

  const handleApplySuggestion = (suggestion: Suggestion) => {
    setAppliedSuggestions((prev) => new Set([...prev, suggestion.id]))
    onApplySuggestion(suggestion)
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-500 bg-red-50 border-red-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "layout":
        return <TrendingUp className="w-4 h-4" />
      case "content":
        return <Lightbulb className="w-4 h-4" />
      case "design":
        return <Sparkles className="w-4 h-4" />
      case "workflow":
        return <Users className="w-4 h-4" />
      default:
        return <Brain className="w-4 h-4" />
    }
  }

  if (!isVisible) return null

  return (
    <Card className="absolute top-4 left-4 w-96 h-[500px] shadow-xl z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent" />
            AI Insights
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Smart
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isAnalyzing ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-accent" />
              <span className="text-sm">Analyzing your whiteboard...</span>
            </div>
            <Progress value={analysisProgress} className="w-full" />
            <div className="text-xs text-muted-foreground">
              Examining layout, content structure, and workflow patterns
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{suggestions.length} suggestions found</span>
              <Button variant="ghost" size="sm" onClick={analyzeBoard}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Re-analyze
              </Button>
            </div>

            <ScrollArea className="h-[380px]">
              <div className="space-y-3">
                {suggestions.map((suggestion) => {
                  const isApplied = appliedSuggestions.has(suggestion.id)

                  return (
                    <Card key={suggestion.id} className={`p-3 ${isApplied ? "opacity-60" : ""}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">{getTypeIcon(suggestion.type)}</div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm">{suggestion.title}</h4>
                            <Badge variant="outline" className={`text-xs ${getImpactColor(suggestion.impact)}`}>
                              {suggestion.impact} impact
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground">{suggestion.description}</p>

                          {suggestion.preview && (
                            <div className="bg-muted/50 p-2 rounded text-xs">
                              <span className="font-medium">Preview: </span>
                              {suggestion.preview}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{suggestion.confidence}% confidence</span>
                              <Badge variant="secondary" className="text-xs">
                                {suggestion.category}
                              </Badge>
                            </div>

                            {isApplied ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                <span className="text-xs">Applied</span>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApplySuggestion(suggestion)}
                                className="text-xs h-7"
                              >
                                <Zap className="w-3 h-3 mr-1" />
                                Apply
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
