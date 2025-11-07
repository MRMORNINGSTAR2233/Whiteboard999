export interface WhiteboardElement {
  id: string
  type: "rectangle" | "circle" | "triangle" | "diamond" | "arrow" | "text" | "sticky-note" | "line" | "freehand" | "image"
  x: number
  y: number
  width: number
  height: number
  rotation: number
  style: ElementStyle
  content?: string
  points?: Point[]
  path?: Point[] // Added path for freehand drawing
  locked: boolean
  layer: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface ElementStyle {
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  fontSize?: number
  fontFamily?: string
  fontWeight?: "normal" | "bold"
  textAlign?: "left" | "center" | "right"
  borderRadius?: number
}

export interface Point {
  x: number
  y: number
  pressure?: number
}

export interface User {
  id: string
  name: string
  avatar: string
  role: "owner" | "editor" | "viewer"
  status: "online" | "away" | "offline"
  currentAction?: string
  cursor?: Point
  color: string
}

export interface Comment {
  id: string
  x: number
  y: number
  content: string
  author: User
  createdAt: Date
  resolved: boolean
  replies: CommentReply[]
}

export interface CommentReply {
  id: string
  content: string
  author: User
  createdAt: Date
}

export interface AIGenerationRequest {
  prompt: string
  type: "flowchart" | "mindmap" | "orgchart" | "timeline" | "wireframe" | "database"
  context?: string
  style?: "minimal" | "detailed" | "colorful"
}

export interface AIGenerationResult {
  elements: WhiteboardElement[]
  suggestions: string[]
  confidence: number
  processingTime: number
}

export interface LayoutSuggestion {
  id: string
  name: string
  description: string
  preview?: string
  confidence: number
}

export interface WhiteboardState {
  elements: WhiteboardElement[]
  selectedElements: string[]
  viewport: {
    x: number
    y: number
    zoom: number
  }
  tool: Tool
  users: User[]
  comments: Comment[]
  history: HistoryEntry[]
  historyIndex: number
}

export type Tool =
  | "select"
  | "pan"
  | "rectangle"
  | "circle"
  | "triangle"
  | "diamond"
  | "arrow"
  | "text"
  | "sticky-note"
  | "line"
  | "pen"
  | "eraser"
  | "image"

export interface HistoryEntry {
  id: string
  action: "create" | "update" | "delete" | "move" | "resize"
  elements: WhiteboardElement[]
  timestamp: Date
  userId: string
}
