interface EraserFile {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    name: string
    email: string
  }
  workspace: {
    id: string
    name: string
  }
  content: EraserContent
}

interface EraserContent {
  version: string
  elements: EraserElement[]
  metadata?: {
    theme?: string
    zoom?: number
    viewBox?: { x: number; y: number; width: number; height: number }
  }
}

interface EraserElement {
  id: string
  type: string
  x: number
  y: number
  width?: number
  height?: number
  text?: string
  style?: {
    fill?: string
    stroke?: string
    strokeWidth?: number
    fontSize?: number
    fontFamily?: string
    color?: string
  }
  points?: Array<{ x: number; y: number }>
  path?: string
  url?: string
}

interface EraserIntegrationConfig {
  fileUrl: string
  accessToken?: string
}

export class EraserIntegration {
  private accessToken?: string
  private baseUrl = "https://api.eraser.io/api"

  constructor(config: EraserIntegrationConfig) {
    this.accessToken = config.accessToken
  }

  private extractFileId(fileUrl: string): string {
    // Extract file ID from Eraser URL
    // Format: https://app.eraser.io/workspace/[workspace-id]/[file-id]
    const match = fileUrl.match(/\/workspace\/[^/]+\/([^/?]+)/)
    if (!match) {
      throw new Error("Invalid Eraser file URL format")
    }
    return match[1]
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    }

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized. Check your access token or file permissions.")
      }
      if (response.status === 404) {
        throw new Error("File not found. Check the URL and permissions.")
      }
      throw new Error(`Eraser API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async testConnection(): Promise<boolean> {
    try {
      // Try to access user info or workspace info
      if (this.accessToken) {
        await this.makeRequest("/user")
      }
      return true
    } catch (error) {
      console.error("[v0] Eraser connection test failed:", error)
      return false
    }
  }

  async getFileInfo(fileUrl: string): Promise<EraserFile> {
    const fileId = this.extractFileId(fileUrl)
    console.log("[v0] Fetching Eraser file info for ID:", fileId)

    try {
      const file = await this.makeRequest(`/files/${fileId}`)
      return {
        id: file.id,
        name: file.name,
        description: file.description,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        owner: file.owner,
        workspace: file.workspace,
        content: file.content,
      }
    } catch (error) {
      console.error("[v0] Failed to fetch Eraser file info:", error)
      throw new Error("Failed to access file. Check permissions and URL.")
    }
  }

  async getFileContent(fileUrl: string): Promise<EraserContent> {
    const fileId = this.extractFileId(fileUrl)
    console.log("[v0] Fetching Eraser file content for ID:", fileId)

    try {
      const response = await this.makeRequest(`/files/${fileId}/content`)
      return response.content || { version: "1.0", elements: [] }
    } catch (error) {
      console.error("[v0] Failed to fetch Eraser file content:", error)
      throw new Error("Failed to fetch file content. Check permissions.")
    }
  }

  convertToWhiteboardFormat(content: EraserContent, fileInfo: EraserFile) {
    console.log("[v0] Converting", content.elements.length, "Eraser elements to whiteboard format")

    const elements = content.elements.map((element) => {
      const baseElement = {
        id: element.id,
        x: element.x,
        y: element.y,
      }

      switch (element.type) {
        case "text":
          return {
            ...baseElement,
            type: "text",
            content: element.text || "",
            fontSize: element.style?.fontSize || 14,
            fontFamily: element.style?.fontFamily || "Arial",
            color: element.style?.color || "#000000",
          }

        case "rectangle":
        case "square":
          return {
            ...baseElement,
            type: "shape",
            shape: "rectangle",
            width: element.width || 100,
            height: element.height || 100,
            fillColor: element.style?.fill || "#E3F2FD",
            strokeColor: element.style?.stroke || "#1976D2",
            strokeWidth: element.style?.strokeWidth || 1,
          }

        case "circle":
        case "ellipse":
          return {
            ...baseElement,
            type: "shape",
            shape: element.type,
            width: element.width || 100,
            height: element.height || 100,
            fillColor: element.style?.fill || "#E3F2FD",
            strokeColor: element.style?.stroke || "#1976D2",
            strokeWidth: element.style?.strokeWidth || 1,
          }

        case "line":
          return {
            ...baseElement,
            type: "line",
            startX: element.points?.[0]?.x || element.x,
            startY: element.points?.[0]?.y || element.y,
            endX: element.points?.[1]?.x || element.x + (element.width || 100),
            endY: element.points?.[1]?.y || element.y + (element.height || 0),
            strokeColor: element.style?.stroke || "#000000",
            strokeWidth: element.style?.strokeWidth || 2,
          }

        case "arrow":
          return {
            ...baseElement,
            type: "arrow",
            startX: element.points?.[0]?.x || element.x,
            startY: element.points?.[0]?.y || element.y,
            endX: element.points?.[1]?.x || element.x + (element.width || 100),
            endY: element.points?.[1]?.y || element.y + (element.height || 0),
            strokeColor: element.style?.stroke || "#000000",
            strokeWidth: element.style?.strokeWidth || 2,
          }

        case "path":
        case "freehand":
          return {
            ...baseElement,
            type: "path",
            path: element.path || "",
            points: element.points || [],
            strokeColor: element.style?.stroke || "#000000",
            strokeWidth: element.style?.strokeWidth || 2,
          }

        case "sticky":
        case "note":
          return {
            ...baseElement,
            type: "sticky",
            content: element.text || "",
            color: element.style?.fill || "#FFEB3B",
            width: element.width || 200,
            height: element.height || 200,
          }

        case "image":
          return {
            ...baseElement,
            type: "image",
            url: element.url,
            width: element.width || 200,
            height: element.height || 200,
          }

        case "code":
          return {
            ...baseElement,
            type: "code",
            content: element.text || "",
            language: "javascript", // Default language
            width: element.width || 400,
            height: element.height || 300,
          }

        case "diagram":
          return {
            ...baseElement,
            type: "shape",
            shape: "rectangle",
            width: element.width || 200,
            height: element.height || 150,
            fillColor: element.style?.fill || "#F5F5F5",
            strokeColor: element.style?.stroke || "#CCCCCC",
            content: element.text || "Diagram",
          }

        default:
          console.log("[v0] Unknown Eraser element type:", element.type)
          return {
            ...baseElement,
            type: "unknown",
            originalType: element.type,
            width: element.width || 100,
            height: element.height || 100,
            content: element.text || "",
          }
      }
    })

    return {
      id: fileInfo.id,
      name: fileInfo.name,
      description: fileInfo.description,
      elements,
      metadata: {
        source: "eraser",
        originalUrl: `https://app.eraser.io/workspace/${fileInfo.workspace.id}/${fileInfo.id}`,
        importedAt: new Date().toISOString(),
        owner: fileInfo.owner,
        workspace: fileInfo.workspace,
        version: content.version,
        theme: content.metadata?.theme,
      },
    }
  }

  async importFile(config: EraserIntegrationConfig): Promise<any> {
    console.log("[v0] Starting Eraser file import")

    // Test connection if we have an access token
    if (this.accessToken) {
      const isConnected = await this.testConnection()
      if (!isConnected) {
        throw new Error("Failed to connect to Eraser API. Check your access token.")
      }
    }

    // Get file information
    const fileInfo = await this.getFileInfo(config.fileUrl)
    console.log("[v0] File info retrieved:", fileInfo.name)

    // Get file content
    const content = await this.getFileContent(config.fileUrl)
    console.log("[v0] Retrieved", content.elements.length, "elements from Eraser file")

    // Convert to whiteboard format
    const whiteboardData = this.convertToWhiteboardFormat(content, fileInfo)

    console.log("[v0] Eraser import completed successfully")
    return whiteboardData
  }
}

// Export utility function for easy use
export async function importFromEraser(config: EraserIntegrationConfig) {
  const integration = new EraserIntegration(config)
  return integration.importFile(config)
}
