"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PresenceIndicator } from "./presence-indicator"
import {
  Share2,
  Settings,
  Crown,
  Sparkles,
  Moon,
  Sun,
  Copy,
  Users,
  Undo2,
  Redo2,
  Download,
  Save,
  FolderOpen,
  FileText,
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface HeaderProps {
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
  onSave?: () => void
  onLoad?: () => void
  onNew?: () => void
  onExport?: () => void
}

export function Header({
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onSave,
  onLoad,
  onNew,
  onExport,
}: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [shareUrl] = useState("https://whiteboard.ai/shared/abc123")
  const [settings, setSettings] = useState({
    autoSave: true,
    gridSnap: true,
    realTimeSync: true,
    aiAssistance: true,
    notifications: true,
    gridSize: "20",
    theme: "system",
    language: "en",
  })

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <header className="h-14 border-b border-gray-200 bg-white px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg text-gray-900">AI Whiteboard</h1>
          <Badge variant="secondary" className="text-xs rounded-md bg-purple-100 text-purple-700 border-purple-200">
            <Crown className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        </div>

        <div className="text-sm text-gray-500 font-medium">Untitled Board</div>
      </div>

      <div className="flex items-center gap-2">
        {/* File operations section */}
        <div className="flex items-center gap-1 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNew}
            title="New Whiteboard (Ctrl+N)"
            className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
          >
            <FileText className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            title="Save Whiteboard (Ctrl+S)"
            className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
          >
            <Save className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoad}
            title="Load Whiteboard (Ctrl+O)"
            className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
          >
            <FolderOpen className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={!canUndo}
            onClick={onUndo}
            title="Undo (Ctrl+Z)"
            className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canRedo}
            onClick={onRedo}
            title="Redo (Ctrl+Y)"
            className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        <PresenceIndicator users={[]} />

        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="h-8 px-3 rounded-lg border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-lg border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white border-gray-200 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Share Whiteboard</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="link" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
                <TabsTrigger
                  value="link"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Share Link
                </TabsTrigger>
                <TabsTrigger
                  value="invite"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Invite People
                </TabsTrigger>
              </TabsList>
              <TabsContent value="link" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Share URL</Label>
                  <div className="flex gap-2">
                    <Input value={shareUrl} readOnly className="rounded-lg border-gray-200" />
                    <Button size="sm" onClick={copyShareUrl} className="rounded-lg">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Permission Level</Label>
                  <Select defaultValue="edit">
                    <SelectTrigger className="rounded-lg border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 rounded-lg">
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="comment">Can Comment</SelectItem>
                      <SelectItem value="edit">Can Edit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="invite" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Email Addresses</Label>
                  <Input placeholder="Enter email addresses..." className="rounded-lg border-gray-200" />
                </div>
                <Button className="w-full rounded-lg">
                  <Users className="w-4 h-4 mr-2" />
                  Send Invitations
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100">
              {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-gray-200 rounded-lg">
            <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-md">
              <Sun className="w-4 h-4 mr-2" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-md">
              <Moon className="w-4 h-4 mr-2" />
              Dark
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings Dialog */}
        <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100">
              <Settings className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-white border-gray-200 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Whiteboard Settings</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-lg bg-gray-100 p-1">
                <TabsTrigger
                  value="general"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="collaboration"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Collaboration
                </TabsTrigger>
                <TabsTrigger
                  value="ai"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  AI Features
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save" className="text-gray-700">
                      Auto Save
                    </Label>
                    <Switch
                      id="auto-save"
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
                      className="bg-gray-100"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="grid-snap" className="text-gray-700">
                      Snap to Grid
                    </Label>
                    <Switch
                      id="grid-snap"
                      checked={settings.gridSnap}
                      onCheckedChange={(checked) => handleSettingChange("gridSnap", checked)}
                      className="bg-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Grid Size</Label>
                    <Select value={settings.gridSize} onValueChange={(value) => handleSettingChange("gridSize", value)}>
                      <SelectTrigger className="rounded-lg border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 rounded-lg">
                        <SelectItem value="10">10px</SelectItem>
                        <SelectItem value="20">20px</SelectItem>
                        <SelectItem value="30">30px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="collaboration" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="real-time-sync" className="text-gray-700">
                      Real-time Sync
                    </Label>
                    <Switch
                      id="real-time-sync"
                      checked={settings.realTimeSync}
                      onCheckedChange={(checked) => handleSettingChange("realTimeSync", checked)}
                      className="bg-gray-100"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications" className="text-gray-700">
                      Notifications
                    </Label>
                    <Switch
                      id="notifications"
                      checked={settings.notifications}
                      onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
                      className="bg-gray-100"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ai-assistance" className="text-gray-700">
                      AI Assistance
                    </Label>
                    <Switch
                      id="ai-assistance"
                      checked={settings.aiAssistance}
                      onCheckedChange={(checked) => handleSettingChange("aiAssistance", checked)}
                      className="bg-gray-100"
                    />
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium">AI Features Active</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Smart diagram generation</li>
                      <li>• Layout optimization</li>
                      <li>• Real-time suggestions</li>
                      <li>• Content generation</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  )
}
