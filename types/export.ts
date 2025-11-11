export type ExportFormat =
  | "png"
  | "svg"
  | "pdf"
  | "json"
  | "markdown"
  | "html"
  | "pptx"
  | "excalidraw"

export interface ExportOptions {
  format: ExportFormat
  quality?: number
  includeBackground?: boolean
  scale?: number
}

export interface BatchExportRequest {
  whiteboardIds: string[]
  format: ExportFormat
  options?: Omit<ExportOptions, "format">
}
