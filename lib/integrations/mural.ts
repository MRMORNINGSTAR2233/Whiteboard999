interface MuralWorkspace {
  id: string
  name: string
  description?: string
}

interface MuralBoard {
  id: string
  title: string
  description?: string
  createdOn: string
  updatedOn: string
  createdBy: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  workspace: MuralWorkspace
  widgets: MuralWidget[]
}

interface MuralWidget {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  text?: string
  style?: {
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    fontSize?: number
    fontColor?: string
  }
  shape?: string
  connectorStart?: { x: number; y: number }
  connectorEnd?: { x: number; y: number }
  imageUrl?: string
}

interface MuralIntegrationConfig {
  apiToken: string
  workspaceId: string
  muralId: string
}

export class MuralIntegration {
  private apiToken: string
  private baseUrl = "https://app.mural.co/api/public/v1"

  constructor(config: MuralIntegrationConfig) {
    this.apiToken = config.apiToken
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Mural API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest("/workspaces?limit=1")
      return true
    } catch (error) {
      console.error("[v0] Mural connection test failed:", error)
      return false
    }
  }

  async getMuralInfo(workspaceId: string, muralId: string): Promise<MuralBoard> {
    console.log("[v0] Fetching Mural info for workspace:", workspaceId, "mural:", muralId)

    try {
      const mural = await this.makeRequest(`/workspaces/${workspaceId}/murals/${muralId}`)
      return {
        id: mural.id,
        title: mural.title,
        description: mural.description,
        createdOn: mural.createdOn,
        updatedOn: mural.updatedOn,
        createdBy: mural.createdBy,
        workspace: mural.workspace,
        widgets: mural.widgets || [],
      }
    } catch (error) {
      console.error("[v0] Failed to fetch Mural info:", error)
      throw new Error("Failed to access mural. Check permissions and IDs.")
    }
  }

  async getMuralWidgets(workspaceId: string, muralId: string): Promise<MuralWidget[]> {
    console.log("[v0] Fetching Mural widgets for workspace:", workspaceId, "mural:", muralId)

    try {
      const response = await this.makeRequest(`/workspaces/${workspaceId}/murals/${muralId}/widgets`)
      return response.value || []
    } catch (error) {
      console.error("[v0] Failed to fetch Mural widgets:", error)
      throw new Error("Failed to fetch mural content. Check permissions.")
    }
  }

  convertToWhiteboardFormat(widgets: MuralWidget[], muralInfo: MuralBoard) {
    console.log("[v0] Converting", widgets.length, "Mural widgets to whiteboard format")

    const elements = widgets.map((widget) => {
      const baseElement = {
        id: widget.id,
        x: widget.x,
        y: widget.y,
      }

      switch (widget.type) {
        case "sticky-note":
        case "sticky_note":
          return {
            ...baseElement,
            type: "sticky",
            content: widget.text || "",
            color: widget.style?.backgroundColor || "#FFEB3B",
            width: widget.width || 200,
            height: widget.height || 200,
          }

        case "text":
          return {
            ...baseElement,
            type: "text",
            content: widget.text || "",
            fontSize: widget.style?.fontSize || 14,
            color: widget.style?.fontColor || "#000000",
          }

        case "shape":
          return {
            ...baseElement,
            type: "shape",
            shape: this.mapMuralShape(widget.shape || "rectangle"),
            width: widget.width,
            height: widget.height,
            fillColor: widget.style?.backgroundColor || "#E3F2FD",
            strokeColor: widget.style?.borderColor || "#1976D2",
            strokeWidth: widget.style?.borderWidth || 1,
          }

        case "connector":
        case "line":
          return {
            ...baseElement,
            type: "line",
            startX: widget.connectorStart?.x || widget.x,
            startY: widget.connectorStart?.y || widget.y,
            endX: widget.connectorEnd?.x || widget.x + widget.width,
            endY: widget.connectorEnd?.y || widget.y + widget.height,
            strokeColor: widget.style?.borderColor || "#000000",
            strokeWidth: widget.style?.borderWidth || 2,
          }

        case "image":
          return {
            ...baseElement,
            type: "image",
            url: widget.imageUrl,
            width: widget.width || 200,
            height: widget.height || 200,
          }

        case "area":
          return {
            ...baseElement,
            type: "shape",
            shape: "rectangle",
            width: widget.width,
            height: widget.height,
            fillColor: widget.style?.backgroundColor || "#F5F5F5",
            strokeColor: widget.style?.borderColor || "#CCCCCC",
            strokeWidth: widget.style?.borderWidth || 1,
            content: widget.text || "",
          }

        case "icon":
          return {
            ...baseElement,
            type: "icon",
            iconType: widget.shape || "circle",
            width: widget.width || 50,
            height: widget.height || 50,
            color: widget.style?.backgroundColor || "#2196F3",
          }

        default:
          console.log("[v0] Unknown Mural widget type:", widget.type)
          return {
            ...baseElement,
            type: "unknown",
            originalType: widget.type,
            width: widget.width,
            height: widget.height,
            content: widget.text || "",
          }
      }
    })

    return {
      id: muralInfo.id,
      name: muralInfo.title,
      description: muralInfo.description,
      elements,
      metadata: {
        source: "mural",
        originalUrl: `https://app.mural.co/t/${muralInfo.workspace.id}/m/${muralInfo.workspace.id}/${muralInfo.id}`,
        importedAt: new Date().toISOString(),
        createdBy: muralInfo.createdBy,
        workspace: muralInfo.workspace,
      },
    }
  }

  private mapMuralShape(muralShape: string): string {
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
      heart: "heart",
      cloud: "cloud",
      bubble: "bubble",
      "rounded-rectangle": "rounded-rectangle",
    }

    return shapeMap[muralShape] || "rectangle"
  }

  async importMural(config: MuralIntegrationConfig): Promise<any> {
    console.log("[v0] Starting Mural import")

    // Test connection first
    const isConnected = await this.testConnection()
    if (!isConnected) {
      throw new Error("Failed to connect to Mural API. Check your API token.")
    }

    // Get mural information
    const muralInfo = await this.getMuralInfo(config.workspaceId, config.muralId)
    console.log("[v0] Mural info retrieved:", muralInfo.title)

    // Get mural widgets
    const widgets = await this.getMuralWidgets(config.workspaceId, config.muralId)
    console.log("[v0] Retrieved", widgets.length, "widgets from Mural")

    // Convert to whiteboard format
    const whiteboardData = this.convertToWhiteboardFormat(widgets, muralInfo)

    console.log("[v0] Mural import completed successfully")
    return whiteboardData
  }
}

// Export utility function for easy use
export async function importFromMural(config: MuralIntegrationConfig) {
  const integration = new MuralIntegration(config)
  return integration.importMural(config)
}
