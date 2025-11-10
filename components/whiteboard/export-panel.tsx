"use client"

import { TabsTrigger } from "@/components/ui/tabs"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Download, Share2, Link, Mail, X } from "lucide-react"
import type { WhiteboardElement } from "@/types/whiteboard"

interface ExportPanelProps {
  elements?: WhiteboardElement[]
  onExport: (format: "png" | "svg" | "pdf" | "json") => void
  onClose: () => void
}

export function ExportPanel({ elements, onExport, onClose }: ExportPanelProps) {
  const [exportFormat, setExportFormat] = useState("png")
  const [quality, setQuality] = useState("high")
  const [includeBackground, setIncludeBackground] = useState(true)
  const [exportBounds, setExportBounds] = useState("all")
  const [fileName, setFileName] = useState("whiteboard-export")

  const handleExport = (format: "png" | "svg" | "pdf" | "json") => {
    onExport(format)
  }

  const handleShare = async (method: string) => {
    const shareData = {
      title: "AI Whiteboard",
      text: "Check out this whiteboard diagram",
      url: window.location.href,
    }

    if (method === "link" && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log("Share cancelled")
      }
    } else if (method === "copy") {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Export & Share</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 p-4">
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="share">Share</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-medium">File Name</Label>
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="mt-1"
                placeholder="whiteboard-export"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Export Area</Label>
              <Select value={exportBounds} onValueChange={setExportBounds}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Elements</SelectItem>
                  <SelectItem value="selected">Selected Only</SelectItem>
                  <SelectItem value="visible">Visible Area</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Include Background</Label>
              <Switch checked={includeBackground} onCheckedChange={setIncludeBackground} />
            </div>

            <div className="space-y-3 pt-2">
              <Button onClick={() => handleExport("png")} variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export PNG
              </Button>

              <Button onClick={() => handleExport("svg")} variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export SVG
              </Button>

              <Button onClick={() => handleExport("pdf")} variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>

              <Button onClick={() => handleExport("json")} className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="share" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-10 rounded-lg border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                onClick={() => handleShare("link")}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-10 rounded-lg border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                onClick={() => handleShare("copy")}
              >
                <Link className="w-4 h-4 mr-2" />
                Copy Link
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-10 rounded-lg border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                onClick={() => handleShare("email")}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Link
              </Button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <Label className="text-sm font-medium mb-2 block">Embed Code</Label>
              <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono text-gray-600">
                {`<iframe src="${window.location.href}" width="800" height="600"></iframe>`}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
