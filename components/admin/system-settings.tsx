"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Database, Zap, Bell, Globe, AlertTriangle, Save } from "lucide-react"

interface SystemConfig {
  general: {
    siteName: string
    siteUrl: string
    adminEmail: string
    timezone: string
    language: string
  }
  ai: {
    enabled: boolean
    provider: string
    apiKey: string
    maxRequestsPerUser: number
    enableAutoLayout: boolean
    enableSmartSuggestions: boolean
  }
  security: {
    enableTwoFactor: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    enableAuditLog: boolean
    enableEncryption: boolean
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    slackIntegration: boolean
    webhookUrl: string
  }
  storage: {
    provider: string
    maxFileSize: number
    allowedFileTypes: string[]
    enableVersioning: boolean
  }
}

export function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>({
    general: {
      siteName: "AI Whiteboard Platform",
      siteUrl: "https://whiteboard.company.com",
      adminEmail: "admin@company.com",
      timezone: "UTC",
      language: "en",
    },
    ai: {
      enabled: true,
      provider: "openai",
      apiKey: "sk-*********************",
      maxRequestsPerUser: 100,
      enableAutoLayout: true,
      enableSmartSuggestions: true,
    },
    security: {
      enableTwoFactor: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      enableAuditLog: true,
      enableEncryption: true,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      slackIntegration: true,
      webhookUrl: "https://hooks.slack.com/services/...",
    },
    storage: {
      provider: "aws-s3",
      maxFileSize: 10,
      allowedFileTypes: ["png", "jpg", "svg", "pdf"],
      enableVersioning: true,
    },
  })

  const [hasChanges, setHasChanges] = useState(false)

  const updateConfig = (section: keyof SystemConfig, key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    console.log("[v0] Saving system configuration:", config)
    setHasChanges(false)
    // Here you would typically save to your backend
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Configure platform settings and integrations</p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-800 dark:text-orange-200">
                You have unsaved changes. Don't forget to save your configuration.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI Configuration</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={config.general.siteName}
                    onChange={(e) => updateConfig("general", "siteName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={config.general.siteUrl}
                    onChange={(e) => updateConfig("general", "siteUrl", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={config.general.adminEmail}
                    onChange={(e) => updateConfig("general", "adminEmail", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={config.general.timezone}
                    onValueChange={(value) => updateConfig("general", "timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable AI Features</Label>
                  <p className="text-sm text-muted-foreground">Allow users to access AI-powered tools</p>
                </div>
                <Switch
                  checked={config.ai.enabled}
                  onCheckedChange={(checked) => updateConfig("ai", "enabled", checked)}
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="aiProvider">AI Provider</Label>
                  <Select value={config.ai.provider} onValueChange={(value) => updateConfig("ai", "provider", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="google">Google AI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRequests">Max Requests per User/Day</Label>
                  <Input
                    id="maxRequests"
                    type="number"
                    value={config.ai.maxRequestsPerUser}
                    onChange={(e) => updateConfig("ai", "maxRequestsPerUser", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={config.ai.apiKey}
                  onChange={(e) => updateConfig("ai", "apiKey", e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Layout Suggestions</Label>
                    <p className="text-sm text-muted-foreground">Automatically suggest layout improvements</p>
                  </div>
                  <Switch
                    checked={config.ai.enableAutoLayout}
                    onCheckedChange={(checked) => updateConfig("ai", "enableAutoLayout", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Smart Suggestions</Label>
                    <p className="text-sm text-muted-foreground">Provide contextual AI suggestions</p>
                  </div>
                  <Switch
                    checked={config.ai.enableSmartSuggestions}
                    onCheckedChange={(checked) => updateConfig("ai", "enableSmartSuggestions", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Switch
                    checked={config.security.enableTwoFactor}
                    onCheckedChange={(checked) => updateConfig("security", "enableTwoFactor", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">Log all admin actions</p>
                  </div>
                  <Switch
                    checked={config.security.enableAuditLog}
                    onCheckedChange={(checked) => updateConfig("security", "enableAuditLog", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>End-to-End Encryption</Label>
                    <p className="text-sm text-muted-foreground">Encrypt sensitive data</p>
                  </div>
                  <Switch
                    checked={config.security.enableEncryption}
                    onCheckedChange={(checked) => updateConfig("security", "enableEncryption", checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={config.security.sessionTimeout}
                    onChange={(e) => updateConfig("security", "sessionTimeout", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    value={config.security.maxLoginAttempts}
                    onChange={(e) => updateConfig("security", "maxLoginAttempts", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send system alerts via email</p>
                  </div>
                  <Switch
                    checked={config.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateConfig("notifications", "emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Browser push notifications</p>
                  </div>
                  <Switch
                    checked={config.notifications.pushNotifications}
                    onCheckedChange={(checked) => updateConfig("notifications", "pushNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Slack Integration</Label>
                    <p className="text-sm text-muted-foreground">Send alerts to Slack channel</p>
                  </div>
                  <Switch
                    checked={config.notifications.slackIntegration}
                    onCheckedChange={(checked) => updateConfig("notifications", "slackIntegration", checked)}
                  />
                </div>
              </div>

              {config.notifications.slackIntegration && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Slack Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      value={config.notifications.webhookUrl}
                      onChange={(e) => updateConfig("notifications", "webhookUrl", e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Storage Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storageProvider">Storage Provider</Label>
                  <Select
                    value={config.storage.provider}
                    onValueChange={(value) => updateConfig("storage", "provider", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aws-s3">Amazon S3</SelectItem>
                      <SelectItem value="google-cloud">Google Cloud Storage</SelectItem>
                      <SelectItem value="azure">Azure Blob Storage</SelectItem>
                      <SelectItem value="local">Local Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={config.storage.maxFileSize}
                    onChange={(e) => updateConfig("storage", "maxFileSize", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Allowed File Types</Label>
                <div className="flex flex-wrap gap-2">
                  {config.storage.allowedFileTypes.map((type, index) => (
                    <Badge key={index} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable File Versioning</Label>
                  <p className="text-sm text-muted-foreground">Keep multiple versions of uploaded files</p>
                </div>
                <Switch
                  checked={config.storage.enableVersioning}
                  onCheckedChange={(checked) => updateConfig("storage", "enableVersioning", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
