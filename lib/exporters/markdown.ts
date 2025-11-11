import MarkdownIt from "markdown-it"

/**
 * Convert TLDraw whiteboard data to Markdown format
 */
export function exportToMarkdown(whiteboardData: any, whiteboardName: string): string {
  const md = new MarkdownIt()
  let markdown = `# ${whiteboardName}\n\n`

  // Extract text shapes
  const textShapes = Object.values(whiteboardData.records || {}).filter(
    (record: any) => record.typeName === "shape" && record.type === "text"
  )

  if (textShapes.length > 0) {
    markdown += "## Content\n\n"
    textShapes.forEach((shape: any) => {
      if (shape.props?.text) {
        markdown += `${shape.props.text}\n\n`
      }
    })
  }

  // Extract draw shapes
  const drawShapes = Object.values(whiteboardData.records || {}).filter(
    (record: any) => record.typeName === "shape" && record.type === "draw"
  )

  if (drawShapes.length > 0) {
    markdown += `## Drawings\n\n`
    markdown += `*This whiteboard contains ${drawShapes.length} drawing(s)*\n\n`
  }

  // Extract geo shapes (rectangles, circles, etc.)
  const geoShapes = Object.values(whiteboardData.records || {}).filter(
    (record: any) => record.typeName === "shape" && record.type === "geo"
  )

  if (geoShapes.length > 0) {
    markdown += `## Shapes\n\n`
    geoShapes.forEach((shape: any) => {
      const geo = shape.props?.geo || "shape"
      const text = shape.props?.text || ""
      markdown += `- **${geo}**: ${text}\n`
    })
    markdown += "\n"
  }

  // Add metadata
  markdown += `---\n\n`
  markdown += `*Exported from AI Whiteboard on ${new Date().toLocaleString()}*\n`

  return markdown
}
