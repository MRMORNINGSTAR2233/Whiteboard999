interface MiroBoard {
  id: string
  name: string
  description?: string
  createdAt: string
  modifiedAt: string
  owner: {
    id: string
    name: string
    email: string
  }
  team: {
    id: string
    name: string
  }
}

interface MiroItem {
  id: string
  type: string
  data: any
  style?: any
  geometry?: {
    x: number
    y: number
    width?: number
    height?: number
  }
  createdAt: string
  modifiedAt: string
}

interface MiroIntegrationConfig {
  apiKey: string
  boardUrl: string
}

export class MiroIntegration {
  private apiKey: string
  private baseUrl = "https://api.miro.com/v2"

  constructor(config: MiroIntegrationConfig) {
    this.apiKey = config.apiKey
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Miro API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private extractBoardId(boardUrl: string): string {
    // Extract board ID from Miro URL
    // Format: https://miro.com/app/board/uXjVKXXXXXX=/
    const match = boardUrl.match(/\/board\/([^/=]+)/)
    if (!match) {
      throw new Error("Invalid Miro board URL format")
    }
    return match[1]
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest("/boards?limit=1")
      return true
    } catch (error) {
      console.error("[v0] Miro connection test failed:", error)
      return false
    }
  }

  async getBoardInfo(boardUrl: string): Promise<MiroBoard> {
    const boardId = this.extractBoardId(boardUrl)
    console.log("[v0] Fetching Miro board info for ID:", boardId)

    try {
      const board = await this.makeRequest(`/boards/${boardId}`)
      return {
        id: board.id,
        name: board.name,
        description: board.description,
        createdAt: board.createdAt,
        modifiedAt: board.modifiedAt,
        owner: board.owner,
        team: board.team,
      }
    } catch (error) {
      console.error("[v0] Failed to fetch Miro board info:", error)
      throw new Error("Failed to access board. Check permissions and URL.")
    }
  }

  async getBoardItems(boardUrl: string): Promise<MiroItem[]> {
    const boardId = this.extractBoardId(boardUrl)
    console.log("[v0] Fetching Miro board items for ID:", boardId)

    try {
      const response = await this.makeRequest(`/boards/${boardId}/items?limit=1000`)
      return response.data || []
    } catch (error) {
      console.error("[v0] Failed to fetch Miro board items:", error)
      throw new Error("Failed to fetch board content. Check permissions.")
    }
  }

  convertToWhiteboardFormat(miroItems: MiroItem[], boardInfo: MiroBoard) {
    console.log("[v0] Converting", miroItems.length, "Miro items to whiteboard format")

    const elements = miroItems.map((item) => {
      const baseElement = {
        id: item.id,
        createdAt: item.createdAt,
        modifiedAt: item.modifiedAt,
        x: item.geometry?.x || 0,
        y: item.geometry?.y || 0,
      }

      switch (item.type) {
        case "sticky_note":
          return {
            ...baseElement,
            type: "sticky",
            content: item.data.content || "",
            color: item.style?.fillColor || "#FFEB3B",
            width: item.geometry?.width || 200,
            height: item.geometry?.height || 200,
          }

        case "text":
          return {
            ...baseElement,
            type: "text",
            content: item.data.content || "",
            fontSize: item.style?.fontSize || 14,
            color: item.style?.textColor || "#000000",
          }

        case "shape":
          return {
            ...baseElement,
            type: "shape",
            shape: this.mapMiroShape(item.data.shape),
            width: item.geometry?.width || 100,
            height: item.geometry?.height || 100,
            fillColor: item.style?.fillColor || "#E3F2FD",
            strokeColor: item.style?.borderColor || "#1976D2",
          }

        case "line":
        case "connector":
          return {
            ...baseElement,
            type: "line",
            startX: item.geometry?.x || 0,
            startY: item.geometry?.y || 0,
            endX: (item.geometry?.x || 0) + (item.geometry?.width || 100),
            endY: (item.geometry?.y || 0) + (item.geometry?.height || 0),
            strokeColor: item.style?.strokeColor || "#000000",
            strokeWidth: item.style?.strokeWidth || 2,
          }

        case "image":
          return {
            ...baseElement,
            type: "image",
            url: item.data.url,
            width: item.geometry?.width || 200,
            height: item.geometry?.height || 200,
          }

        default:
          console.log("[v0] Unknown Miro item type:", item.type)
          return {
            ...baseElement,
            type: "unknown",
            originalType: item.type,
            data: item.data,
          }
      }
    })

    return {
      id: boardInfo.id,
      name: boardInfo.name,
      description: boardInfo.description,
      elements,
      metadata: {
        source: "miro",
        originalUrl: `https://miro.com/app/board/${boardInfo.id}/`,
        importedAt: new Date().toISOString(),
        owner: boardInfo.owner,
        team: boardInfo.team,
      },
    }
  }

  private mapMiroShape(miroShape: string): string {
    const shapeMap: Record<string, string> = {
      rectangle: "rectangle",
      round_rectangle: "rounded-rectangle",
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
      arrow_right: "arrow",
      cross: "cross",
    }

    return shapeMap[miroShape] || "rectangle"
  }

  async importBoard(config: MiroIntegrationConfig): Promise<any> {
    console.log("[v0] Starting Miro board import")

    // Test connection first
    const isConnected = await this.testConnection()
    if (!isConnected) {
      throw new Error("Failed to connect to Miro API. Check your API key.")
    }

    // Get board information
    const boardInfo = await this.getBoardInfo(config.boardUrl)
    console.log("[v0] Board info retrieved:", boardInfo.name)

    // Get board items
    const items = await this.getBoardItems(config.boardUrl)
    console.log("[v0] Retrieved", items.length, "items from Miro board")

    // Convert to whiteboard format
    const whiteboardData = this.convertToWhiteboardFormat(items, boardInfo)

    console.log("[v0] Miro import completed successfully")
    return whiteboardData
  }
}

// Export utility function for easy use
export async function importFromMiro(config: MiroIntegrationConfig) {
  const integration = new MiroIntegration(config)
  return integration.importBoard(config)
}
