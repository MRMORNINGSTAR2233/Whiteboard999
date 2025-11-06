"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Upload, CheckCircle, AlertCircle, Loader2, Info } from "lucide-react"
import { processImport, type ImportConfig } from "@/lib/file-processor"

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportSuccess: (boardData: any) => void
}

interface ImportStatus {
  status: "idle" | "connecting" | "importing" | "success" | "error"
  message: string
  progress?: number
}

export function ImportModal({ isOpen, onClose, onImportSuccess }: ImportModalProps) {
  const [activeTab, setActiveTab] = useState("miro")
  const [importStatus, setImportStatus] = useState<ImportStatus>({ status: "idle", message: "" })
  const [formData, setFormData] = useState({
    miro: { apiKey: "", boardUrl: "" },
    lucidchart: { username: "", password: "", documentId: "" },
    mural: { apiToken: "", workspaceId: "", muralId: "" },
    eraser: { fileUrl: "", accessToken: "" },
  })
  const { toast } = useToast()

  const handleInputChange = (platform: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [platform]: { ...prev[platform as keyof typeof prev], [field]: value },
    }))
  }

  const handleImport = async () => {
    const currentData = formData[activeTab as keyof typeof formData]

    // Validation
    const requiredFields = {
      miro: ["apiKey", "boardUrl"],
      lucidchart: ["username", "password", "documentId"],
      mural: ["apiToken", "workspaceId", "muralId"],
      eraser: ["fileUrl"],
    }

    const required = requiredFields[activeTab as keyof typeof requiredFields]
    const missing = required.filter((field) => !currentData[field as keyof typeof currentData])

    if (missing.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missing.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    try {
      setImportStatus({ status: "connecting", message: `Connecting to ${activeTab}...` })

      const config: ImportConfig = {
        platform: activeTab as any,
        credentials: currentData,
        options: {
          validateElements: true,
          maxElements: 5000,
          timeout: 30000,
          retryAttempts: 3,
        },
      }

      console.log("[v0] Starting import with file processor")
      const result = await processImport(config)

      if (!result.success) {
        setImportStatus({
          status: "error",
          message: result.error || "Import failed",
        })
        return
      }

      setImportStatus({ status: "importing", message: "Processing imported data...", progress: 80 })
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setImportStatus({ status: "success", message: "Import completed successfully!" })

      // Show warnings if any
      if (result.warnings && result.warnings.length > 0) {
        toast({
          title: "Import completed with warnings",
          description: result.warnings.join(", "),
        })
      }

      setTimeout(() => {
        onImportSuccess({
          ...result.data,
          platform: activeTab,
          processingMetadata: result.metadata,
        })
        onClose()
        resetForm()
      }, 1500)
    } catch (error) {
      console.error("[v0] Import error:", error)
      setImportStatus({
        status: "error",
        message: error instanceof Error ? error.message : "Import failed. Please check your credentials and try again.",
      })
    }
  }

  const resetForm = () => {
    setImportStatus({ status: "idle", message: "" })
    setFormData({
      miro: { apiKey: "", boardUrl: "" },
      lucidchart: { username: "", password: "", documentId: "" },
      mural: { apiToken: "", workspaceId: "", muralId: "" },
      eraser: { fileUrl: "", accessToken: "" },
    })
  }

  const handleClose = () => {
    if (importStatus.status === "importing" || importStatus.status === "connecting") {
      return // Prevent closing during import
    }
    resetForm()
    onClose()
  }

  const getStatusIcon = () => {
    switch (importStatus.status) {
      case "connecting":
      case "importing":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Whiteboard
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Import Features:</p>
              <ul className="text-xs space-y-1">
                <li>• Automatic data validation and optimization</li>
                <li>• Support for up to 5,000 elements per import</li>
                <li>• Retry logic with error recovery</li>
                <li>• Element deduplication and coordinate optimization</li>
              </ul>
            </div>
          </div>
        </div>

        {importStatus.status !== "idle" && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon()}
              <span className="font-medium">{importStatus.message}</span>
            </div>
            {importStatus.progress !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${importStatus.progress}%` }}
                />
              </div>
            )}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="miro">Miro</TabsTrigger>
            <TabsTrigger value="lucidchart">LucidChart</TabsTrigger>
            <TabsTrigger value="mural">Mural</TabsTrigger>
            <TabsTrigger value="eraser">Eraser</TabsTrigger>
          </TabsList>

          <TabsContent value="miro" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="miro-api-key">Miro API Key</Label>
                <Input
                  id="miro-api-key"
                  type="password"
                  placeholder="Enter your Miro API key"
                  value={formData.miro.apiKey}
                  onChange={(e) => handleInputChange("miro", "apiKey", e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Get your API key from{" "}
                  <a
                    href="https://developers.miro.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Miro Developer Console
                  </a>
                </p>
              </div>
              <div>
                <Label htmlFor="miro-board-url">Board URL</Label>
                <Input
                  id="miro-board-url"
                  placeholder="https://miro.com/app/board/..."
                  value={formData.miro.boardUrl}
                  onChange={(e) => handleInputChange("miro", "boardUrl", e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">Copy the full URL from your Miro board</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lucidchart" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="lucid-username">Username/Email</Label>
                <Input
                  id="lucid-username"
                  placeholder="your.email@company.com"
                  value={formData.lucidchart.username}
                  onChange={(e) => handleInputChange("lucidchart", "username", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lucid-password">Password</Label>
                <Input
                  id="lucid-password"
                  type="password"
                  placeholder="Your LucidChart password"
                  value={formData.lucidchart.password}
                  onChange={(e) => handleInputChange("lucidchart", "password", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lucid-document-id">Document ID</Label>
                <Input
                  id="lucid-document-id"
                  placeholder="Document ID from URL"
                  value={formData.lucidchart.documentId}
                  onChange={(e) => handleInputChange("lucidchart", "documentId", e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Found in the URL: lucidchart.com/documents/edit/[DOCUMENT_ID]
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mural" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="mural-api-token">API Token</Label>
                <Input
                  id="mural-api-token"
                  type="password"
                  placeholder="Enter your Mural API token"
                  value={formData.mural.apiToken}
                  onChange={(e) => handleInputChange("mural", "apiToken", e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Get your API token from{" "}
                  <a
                    href="https://developers.mural.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Mural Developer Portal
                  </a>
                </p>
              </div>
              <div>
                <Label htmlFor="mural-workspace-id">Workspace ID</Label>
                <Input
                  id="mural-workspace-id"
                  placeholder="Workspace ID"
                  value={formData.mural.workspaceId}
                  onChange={(e) => handleInputChange("mural", "workspaceId", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="mural-id">Mural ID</Label>
                <Input
                  id="mural-id"
                  placeholder="Mural ID"
                  value={formData.mural.muralId}
                  onChange={(e) => handleInputChange("mural", "muralId", e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Found in the URL: app.mural.co/t/[workspace]/m/[workspace]/[MURAL_ID]
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="eraser" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="eraser-file-url">File URL</Label>
                <Input
                  id="eraser-file-url"
                  placeholder="https://app.eraser.io/workspace/..."
                  value={formData.eraser.fileUrl}
                  onChange={(e) => handleInputChange("eraser", "fileUrl", e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">Copy the full URL from your Eraser file</p>
              </div>
              <div>
                <Label htmlFor="eraser-access-token">Access Token (Optional)</Label>
                <Input
                  id="eraser-access-token"
                  type="password"
                  placeholder="For private files"
                  value={formData.eraser.accessToken}
                  onChange={(e) => handleInputChange("eraser", "accessToken", e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Only required for private files. Get from{" "}
                  <a
                    href="https://docs.eraser.io/docs/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Eraser API docs
                  </a>
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={importStatus.status === "importing" || importStatus.status === "connecting"}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={importStatus.status === "importing" || importStatus.status === "connecting"}
            className="bg-foreground hover:bg-foreground/90 text-background"
          >
            {importStatus.status === "importing" || importStatus.status === "connecting" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Board
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
