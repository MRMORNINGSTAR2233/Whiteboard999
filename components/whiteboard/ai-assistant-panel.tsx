"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Sparkles,
  Wand2,
  Layout,
  PenTool,
  Target,
  GitBranch,
  Database,
  X,
  ChevronRight,
  HelpCircle,
  FileText,
  Download,
  Globe,
  TrendingUp,
  Zap,
  CheckCircle,
  BarChart3,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AIAssistantPanelProps {
  onGenerate: (prompt: string, options?: any) => void
  onClose: () => void
  isOpen: boolean
}

export function AIAssistantPanel({ onGenerate, onClose, isOpen }: AIAssistantPanelProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [showQuestions, setShowQuestions] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [includeAnalysis, setIncludeAnalysis] = useState(false)
  const [includeDocumentation, setIncludeDocumentation] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      await onGenerate(prompt, {
        language: selectedLanguage,
        includeAnalysis,
        includeDocumentation,
        type: selectedType,
      })
      setPrompt("")
      setSelectedType(null)
      setShowQuestions(false)
      onClose()
    } finally {
      setIsGenerating(false)
    }
  }

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  ]

  const diagramTypes = [
    {
      id: "flowchart",
      icon: Layout,
      title: "Business Process Flowchart",
      description: "Professional BPMN-compliant process diagrams with analysis",
      questions: [
        "What business process are you documenting?",
        "Who are the key stakeholders or actors involved?",
        "What triggers the start of this process?",
        "What are the main decision points and criteria?",
        "What are the success criteria and KPIs?",
        "Are there any compliance or regulatory requirements?",
        "What systems or tools are involved?",
      ],
      template:
        "Create a comprehensive business process flowchart for [PROCESS] including:\n• Process triggers and inputs\n• Key stakeholders and responsibilities\n• Decision criteria and business rules\n• System integrations and handoffs\n• Success metrics and outcomes\n• Risk points and mitigation strategies\n• Compliance checkpoints",
    },
    {
      id: "mindmap",
      icon: PenTool,
      title: "Strategic Mind Map",
      description: "Hierarchical idea organization with strategic insights",
      questions: [
        "What is the central strategic objective or challenge?",
        "What are the key strategic pillars or themes?",
        "What dependencies exist between different areas?",
        "What are the success factors and risks?",
        "What resources and capabilities are needed?",
      ],
      template:
        "Generate a strategic mind map for [TOPIC] with:\n• Central strategic objective\n• Key strategic pillars and initiatives\n• Resource requirements and dependencies\n• Risk factors and mitigation strategies\n• Success metrics and milestones",
    },
    {
      id: "architecture",
      icon: Database,
      title: "System Architecture",
      description: "Design technical system components and relationships",
      questions: [
        "What type of system are you designing?",
        "What are the main components or services?",
        "How do components communicate with each other?",
        "What external systems or APIs are involved?",
        "What are the data flows and storage requirements?",
      ],
      template:
        "Draw a system architecture for [SYSTEM] including:\n• Components: [COMPONENTS]\n• Data flows: [DATAFLOWS]\n• External integrations: [EXTERNAL]\n• Storage layers: [STORAGE]\n• Communication protocols: [PROTOCOLS]",
    },
    {
      id: "userjourney",
      icon: GitBranch,
      title: "User Journey",
      description: "Map user interactions and experience flows",
      questions: [
        "Who is the target user or persona?",
        "What is the user's main goal or objective?",
        "What are the key touchpoints or interactions?",
        "Where might users face challenges or drop off?",
        "What are the success metrics or end goals?",
      ],
      template:
        "Create a user journey map for [USER] trying to [GOAL]:\n• User persona: [PERSONA]\n• Key touchpoints: [TOUCHPOINTS]\n• Pain points: [PAINPOINTS]\n• Success paths: [SUCCESS]\n• Emotional states at each step",
    },
    {
      id: "wireframe",
      icon: Wand2,
      title: "Website Wireframe",
      description: "Layout website structure and components",
      questions: [
        "What type of website or page are you designing?",
        "What are the main sections or components?",
        "What is the primary call-to-action?",
        "What content hierarchy do you need?",
        "Are there any specific layout requirements?",
      ],
      template:
        "Create a website wireframe for [PAGETYPE] with:\n• Header: [HEADER]\n• Main sections: [SECTIONS]\n• Call-to-action: [CTA]\n• Navigation: [NAVIGATION]\n• Footer elements: [FOOTER]",
    },
    {
      id: "business",
      icon: Target,
      title: "Business Model",
      description: "Visualize business strategy and value propositions",
      questions: [
        "What value do you provide to customers?",
        "Who are your key customer segments?",
        "What are your main revenue streams?",
        "What key resources and partnerships do you need?",
        "What are your primary cost structures?",
      ],
      template:
        "Generate a business model canvas for [BUSINESS] with:\n• Value propositions: [VALUE]\n• Customer segments: [CUSTOMERS]\n• Revenue streams: [REVENUE]\n• Key partnerships: [PARTNERS]\n• Cost structure: [COSTS]",
    },
  ]

  const superiorFeatures = [
    {
      icon: BarChart3,
      title: "Process Analysis",
      description: "AI-powered bottleneck detection and efficiency recommendations",
      enabled: includeAnalysis,
      toggle: () => setIncludeAnalysis(!includeAnalysis),
    },
    {
      icon: FileText,
      title: "Auto Documentation",
      description: "Generate comprehensive process documentation and SOPs",
      enabled: includeDocumentation,
      toggle: () => setIncludeDocumentation(!includeDocumentation),
    },
    {
      icon: Download,
      title: "BPMN Export",
      description: "Export diagrams in industry-standard BPMN format",
      enabled: true,
      toggle: () => {},
    },
    {
      icon: TrendingUp,
      title: "Process Optimization",
      description: "AI suggestions for process improvements and best practices",
      enabled: true,
      toggle: () => {},
    },
  ]

  const buildSmartPrompt = (type: any, answers: string) => {
    let basePrompt = `${type.template.replace(/\[.*?\]/g, "")} 

Context: ${answers}

Please create a professional, detailed diagram with:
- Clear visual hierarchy and proper spacing
- Logical flow and connections between elements  
- Professional colors and typography
- 12-18 well-connected components minimum
- Proper labels and descriptions`

    if (includeAnalysis) {
      basePrompt += `
- Include process analysis annotations showing potential bottlenecks
- Add efficiency metrics and cycle time indicators
- Highlight optimization opportunities with special markers`
    }

    if (includeDocumentation) {
      basePrompt += `
- Include detailed step descriptions and business rules
- Add role responsibilities and decision criteria
- Include compliance and quality checkpoints`
    }

    if (selectedLanguage !== "en") {
      basePrompt += `
- Generate all text content in ${languages.find((l) => l.code === selectedLanguage)?.name}
- Ensure cultural and business context appropriateness`
    }

    return basePrompt
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div
        className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl mx-4 flex flex-col"
        style={{ height: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Business Process Assistant</h2>
            <Badge variant="secondary" className="text-xs">
              Powered by Kroolo AI
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ maxHeight: "calc(90vh - 140px)" }}>
          {console.log("[v0] Scrollable content area rendered")}
          <div className="space-y-6">
            {/* Superior Features Section */}
            {!selectedType && (
              <>
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium text-gray-900 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      Superior Business Intelligence Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {superiorFeatures.map((feature, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            feature.enabled
                              ? "border-green-300 bg-green-50 shadow-sm"
                              : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                          }`}
                          onClick={feature.toggle}
                        >
                          <div className="flex items-start gap-2">
                            <feature.icon
                              className={`h-4 w-4 mt-0.5 ${feature.enabled ? "text-green-600" : "text-gray-500"}`}
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900 flex items-center gap-1">
                                {feature.title}
                                {feature.enabled && <CheckCircle className="h-3 w-3 text-green-600" />}
                              </div>
                              <div className="text-xs text-gray-600 mt-0.5">{feature.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Language Selection */}
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Language:</span>
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              <span className="flex items-center gap-2">
                                <span>{lang.flag}</span>
                                <span>{lang.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Separator className="bg-gray-200" />
              </>
            )}

            {/* Quick Start Section */}
            {!selectedType && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium text-gray-900 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                    Professional Diagram Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Select a business-ready diagram type with AI-powered analysis and optimization suggestions.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {diagramTypes.map((type) => (
                      <Button
                        key={type.id}
                        variant="outline"
                        className="h-auto p-3 text-left border-gray-200 hover:bg-blue-50 hover:border-blue-300 bg-transparent"
                        onClick={() => {
                          setSelectedType(type.id)
                          setShowQuestions(true)
                        }}
                      >
                        <type.icon className="h-4 w-4 mr-2 flex-shrink-0 text-blue-600" />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">{type.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{type.description}</div>
                        </div>
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Guided Questions Section */}
            {selectedType && showQuestions && (
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium text-gray-900">
                      {diagramTypes.find((t) => t.id === selectedType)?.title} - Guided Setup
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedType(null)
                        setShowQuestions(false)
                      }}
                      className="text-xs"
                    >
                      Back to Types
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">Answer these questions to create a more accurate diagram:</p>
                  {diagramTypes
                    .find((t) => t.id === selectedType)
                    ?.questions.map((question, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-gray-700">{index + 1}. </span>
                        <span className="text-gray-600">{question}</span>
                      </div>
                    ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const type = diagramTypes.find((t) => t.id === selectedType)
                      if (type) {
                        setPrompt(type.template)
                        setShowQuestions(false)
                      }
                    }}
                    className="mt-3"
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Generate Section */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-gray-900">
                  {selectedType ? "Business Process Details" : "Generate Professional Diagram"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={
                    selectedType
                      ? "Provide specific business context, stakeholders, and requirements..."
                      : `Describe your business process or diagram requirements in detail...

Examples:
• 'Create a customer onboarding process with KYC verification, account setup, and compliance checkpoints'
• 'Design a supply chain management flowchart with vendor management, inventory control, and quality assurance'  
• 'Build an incident response workflow with escalation procedures, stakeholder notifications, and resolution tracking'

For superior results, include:
• Business objectives and success criteria
• Key stakeholders and their roles
• Decision points and business rules
• System integrations and data flows
• Compliance and regulatory requirements`
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />

                {(includeAnalysis || includeDocumentation) && (
                  <div className="flex flex-wrap gap-2">
                    {includeAnalysis && (
                      <Badge variant="outline" className="text-xs">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Process Analysis Enabled
                      </Badge>
                    )}
                    {includeDocumentation && (
                      <Badge variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Auto Documentation Enabled
                      </Badge>
                    )}
                    {selectedLanguage !== "en" && (
                      <Badge variant="outline" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        {languages.find((l) => l.code === selectedLanguage)?.name}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 flex-shrink-0">
          {console.log("[v0] Generate button always visible in footer")}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Generating Business-Ready Diagram...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Professional Diagram
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
