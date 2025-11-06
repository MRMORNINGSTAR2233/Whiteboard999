interface LucidChartDocument {
  id: string
  title: string
  description?: string
  createdDate: string
  lastModified: string
  owner: {
    id: string
    name: string
    email: string
  }
  pages: LucidChartPage[]
}

interface LucidChartPage {
  id: string
  title: string
  objects: LucidChartObject[]
}

interface LucidChartObject {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  text?: string
  style?: {
    fill?: string
    stroke?: string
    strokeWidth?: number
    fontSize?: number
    fontColor?: string
  }
  shape?: string
  lineStart?: { x: number; y: number }
  lineEnd?: { x: number; y: number }
}

interface LucidChartIntegrationConfig {
  username: string
  password: string
  documentId: string
}

export class LucidChartIntegration {
  private username: string
  private password: string
  private sessionToken?: string
  private baseUrl = "https://api.lucidchart.com/1"

  constructor(config: LucidChartIntegrationConfig) {
    this.username = config.username
    this.password = config.password
  }

  private async authenticate(): Promise<string> {
    console.log("[v0] Authenticating with LucidChart API")

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: this.username,
        password: this.password,
      }),
    })

    if (!response.ok) {
      throw new Error(`LucidChart authentication failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    this.sessionToken = data.sessionToken
    return this.sessionToken
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.sessionToken) {
      await this.authenticate()
    }

    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.sessionToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, re-authenticate
        await this.authenticate()
        return this.makeRequest(endpoint, options)
      }
      throw new Error(`LucidChart API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest("/documents?limit=1")
      return true
    } catch (error) {
      console.error("[v0] LucidChart connection test failed:", error)
      return false
    }
  }

  async getDocumentInfo(documentId: string): Promise<LucidChartDocument> {
    console.log("[v0] Fetching LucidChart document info for ID:", documentId)

    try {
      const document = await this.makeRequest(`/documents/${documentId}`)
      return {
        id: document.id,
        title: document.title,
        description: document.description,
        createdDate: document.createdDate,
        lastModified: document.lastModified,
        owner: document.owner,
        pages: document.pages || [],
      }
    } catch (error) {
      console.error("[v0] Failed to fetch LucidChart document info:", error)
      throw new Error("Failed to access document. Check permissions and document ID.")
    }
  }

  async getDocumentObjects(documentId: string): Promise<LucidChartObject[]> {
    console.log("[v0] Fetching LucidChart document objects for ID:", documentId)

    try {
      const response = await this.makeRequest(`/documents/${documentId}/objects`)
      return response.objects || []
    } catch (error) {
      console.error("[v0] Failed to fetch LucidChart document objects:", error)
      throw new Error("Failed to fetch document content. Check permissions.")
    }
  }

  convertToWhiteboardFormat(objects: LucidChartObject[], documentInfo: LucidChartDocument) {
    console.log("[v0] Converting", objects.length, "LucidChart objects to whiteboard format")

    const elements = objects.map((obj) => {
      const baseElement = {
        id: obj.id,
        x: obj.x,
        y: obj.y,
      }

      switch (obj.type) {
        case "text":
          return {
            ...baseElement,
            type: "text",
            content: obj.text || "",
            fontSize: obj.style?.fontSize || 14,
            color: obj.style?.fontColor || "#000000",
          }

        case "shape":
          return {
            ...baseElement,
            type: "shape",
            shape: this.mapLucidShape(obj.shape || "rectangle"),
            width: obj.width,
            height: obj.height,
            fillColor: obj.style?.fill || "#E3F2FD",
            strokeColor: obj.style?.stroke || "#1976D2",
            strokeWidth: obj.style?.strokeWidth || 1,
          }

        case "sticky":
        case "note":
          return {
            ...baseElement,
            type: "sticky",
            content: obj.text || "",
            color: obj.style?.fill || "#FFEB3B",
            width: obj.width || 200,
            height: obj.height || 200,
          }

        case "line":
        case "connector":
          return {
            ...baseElement,
            type: "line",
            startX: obj.lineStart?.x || obj.x,
            startY: obj.lineStart?.y || obj.y,
            endX: obj.lineEnd?.x || obj.x + obj.width,
            endY: obj.lineEnd?.y || obj.y + obj.height,
            strokeColor: obj.style?.stroke || "#000000",
            strokeWidth: obj.style?.strokeWidth || 2,
          }

        case "flowchart":
          return {
            ...baseElement,
            type: "shape",
            shape: "flowchart",
            width: obj.width,
            height: obj.height,
            fillColor: obj.style?.fill || "#E8F5E8",
            strokeColor: obj.style?.stroke || "#4CAF50",
            content: obj.text || "",
          }

        case "uml":
          return {
            ...baseElement,
            type: "shape",
            shape: "rectangle",
            width: obj.width,
            height: obj.height,
            fillColor: obj.style?.fill || "#FFF3E0",
            strokeColor: obj.style?.stroke || "#FF9800",
            content: obj.text || "",
          }

        default:
          console.log("[v0] Unknown LucidChart object type:", obj.type)
          return {
            ...baseElement,
            type: "unknown",
            originalType: obj.type,
            width: obj.width,
            height: obj.height,
            content: obj.text || "",
          }
      }
    })

    return {
      id: documentInfo.id,
      name: documentInfo.title,
      description: documentInfo.description,
      elements,
      metadata: {
        source: "lucidchart",
        originalUrl: `https://lucidchart.com/documents/edit/${documentInfo.id}`,
        importedAt: new Date().toISOString(),
        owner: documentInfo.owner,
        pages: documentInfo.pages.length,
      },
    }
  }

  private mapLucidShape(lucidShape: string): string {
    const shapeMap: Record<string, string> = {
      rectangle: "rectangle",
      square: "rectangle",
      circle: "circle",
      ellipse: "ellipse",
      triangle: "triangle",
      diamond: "diamond",
      parallelogram: "parallelogram",
      trapezoid: "trapezoid",
      pentagon: "pentagon",
      hexagon: "hexagon",
      octagon: "octagon",
      star: "star",
      arrow: "arrow",
      cross: "cross",
      cylinder: "cylinder",
      process: "rectangle",
      decision: "diamond",
      terminator: "rounded-rectangle",
      document: "document",
      data: "parallelogram",
    }

    return shapeMap[lucidShape] || "rectangle"
  }

  async importDocument(config: LucidChartIntegrationConfig): Promise<any> {
    console.log("[v0] Starting LucidChart document import")

    // Test connection first
    const isConnected = await this.testConnection()
    if (!isConnected) {
      throw new Error("Failed to connect to LucidChart API. Check your credentials.")
    }

    // Get document information
    const documentInfo = await this.getDocumentInfo(config.documentId)
    console.log("[v0] Document info retrieved:", documentInfo.title)

    // Get document objects
    const objects = await this.getDocumentObjects(config.documentId)
    console.log("[v0] Retrieved", objects.length, "objects from LucidChart document")

    // Convert to whiteboard format
    const whiteboardData = this.convertToWhiteboardFormat(objects, documentInfo)

    console.log("[v0] LucidChart import completed successfully")
    return whiteboardData
  }
}

// Export utility function for easy use
export async function importFromLucidChart(config: LucidChartIntegrationConfig) {
  const integration = new LucidChartIntegration(config)
  return integration.importDocument(config)
}
