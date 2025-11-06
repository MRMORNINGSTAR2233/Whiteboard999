"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Download,
  Users,
  Sparkles,
  Save,
  FolderOpen,
  FileText,
  Undo,
  Redo,
  Shapes,
  Palette,
  Grid,
  ZoomIn,
  ZoomOut,
  Share,
  Play,
  Type,
  Hash,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CustomToolbarProps {
  onExport: () => void
  onCollaboration: () => void
  onAI: () => void
  onShapeLibrary: () => void
  onStylePanel: () => void
  onPresent?: () => void
  onShare?: () => void
  showExportPanel: boolean
  showCollaborationPanel: boolean
  showAIPanel: boolean
  showShapeLibrary: boolean
  showStylePanel: boolean
  onFontFamilyChange?: (font: string) => void
  onFontSizeChange?: (size: number) => void
  currentFontFamily?: string
  currentFontSize?: number
}

const toolbarFonts = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Poppins", label: "Poppins" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Georgia", label: "Georgia" },
]

const toolbarFontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72]

export function CustomToolbar({
  onExport,
  onCollaboration,
  onAI,
  onShapeLibrary,
  onStylePanel,
  onPresent = () => {},
  onShare = () => {},
  showExportPanel,
  showCollaborationPanel,
  showAIPanel,
  showShapeLibrary,
  showStylePanel,
  onFontFamilyChange = () => {},
  onFontSizeChange = () => {},
  currentFontFamily = "Inter",
  currentFontSize = 16,
}: CustomToolbarProps) {
  return (
    <div className="h-16 border-b border-border bg-background flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <img src="/images/kroolo-logo.png" alt="Kroolo" className="h-8 w-auto" />
          </div>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New (Ctrl+N)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open (Ctrl+O)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save (Ctrl+S)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-2" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-2" />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <Select value={currentFontFamily} onValueChange={onFontFamilyChange}>
                    <SelectTrigger className="w-32 h-8 text-xs hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 transition-all duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toolbarFonts.map((font) => (
                        <SelectItem
                          key={font.value}
                          value={font.value}
                          className="hover:bg-gray-100 hover:text-black transition-colors data-[highlighted]:bg-gray-100 data-[highlighted]:text-black"
                        >
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>Font Family</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <Select value={currentFontSize.toString()} onValueChange={(value) => onFontSizeChange(Number(value))}>
                    <SelectTrigger className="w-16 h-8 text-xs hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 transition-all duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toolbarFontSizes.map((size) => (
                        <SelectItem
                          key={size}
                          value={size.toString()}
                          className="hover:bg-gray-100 hover:text-black transition-colors data-[highlighted]:bg-gray-100 data-[highlighted]:text-black"
                        >
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>Font Size</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-2" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showShapeLibrary ? "default" : "ghost"}
                  size="sm"
                  onClick={onShapeLibrary}
                  className={`gap-2 transition-all duration-200 ${!showShapeLibrary ? "hover:bg-gray-100 hover:text-gray-900" : ""}`}
                >
                  <Shapes className="h-4 w-4" />
                  <span className="hidden sm:inline">Shapes</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Shape Library (Ctrl+Shift+S)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showStylePanel ? "default" : "ghost"}
                  size="sm"
                  onClick={onStylePanel}
                  className={`gap-2 transition-all duration-200 ${!showStylePanel ? "hover:bg-gray-100 hover:text-gray-900" : ""}`}
                >
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Style</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Style Panel (Ctrl+Shift+P)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-2" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out (-)</TooltipContent>
            </Tooltip>

            <div className="px-2 py-1 text-sm font-medium bg-muted rounded">100%</div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In (+)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Grid (Ctrl+G)</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showAIPanel ? "default" : "ghost"}
                size="sm"
                onClick={onAI}
                className={`gap-2 transition-all duration-200 ${!showAIPanel ? "hover:bg-gray-100 hover:text-gray-900" : ""}`}
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AI Assistant</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>AI Assistant (Ctrl+I)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showCollaborationPanel ? "default" : "ghost"}
                size="sm"
                onClick={onCollaboration}
                className={`gap-2 transition-all duration-200 ${!showCollaborationPanel ? "hover:bg-gray-100 hover:text-gray-900" : ""}`}
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Collaborate</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Collaboration (Ctrl+K)</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
                className="hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
              >
                <Share className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onPresent}
                className="hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
              >
                <Play className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Present</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showExportPanel ? "default" : "ghost"}
                size="sm"
                onClick={onExport}
                className={`gap-2 transition-all duration-200 ${!showExportPanel ? "hover:bg-gray-100 hover:text-gray-900" : ""}`}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export (Ctrl+E)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
