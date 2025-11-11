/**
 * Convert TLDraw whiteboard data to Excalidraw format
 */
export function exportToExcalidraw(whiteboardData: any, whiteboardName: string): string {
  const excalidrawData = {
    type: "excalidraw",
    version: 2,
    source: "https://excalidraw.com",
    elements: [] as any[],
    appState: {
      gridSize: null,
      viewBackgroundColor: "#ffffff",
    },
    files: {},
  }

  // Convert TLDraw shapes to Excalidraw elements
  const shapes = Object.values(whiteboardData.records || {}).filter(
    (record: any) => record.typeName === "shape"
  )

  shapes.forEach((shape: any, index: number) => {
    const element: any = {
      id: shape.id || `element-${index}`,
      type: "text",
      x: shape.x || 0,
      y: shape.y || 0,
      width: shape.props?.w || 200,
      height: shape.props?.h || 100,
      angle: 0,
      strokeColor: "#000000",
      backgroundColor: "transparent",
      fillStyle: "hachure",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      groupIds: [],
      strokeSharpness: "sharp",
      seed: Math.floor(Math.random() * 1000000),
      version: 1,
      versionNonce: Math.floor(Math.random() * 1000000),
      isDeleted: false,
      boundElements: null,
      updated: Date.now(),
      link: null,
      locked: false,
    }

    // Map shape types
    if (shape.type === "text") {
      element.type = "text"
      element.text = shape.props?.text || ""
      element.fontSize = 20
      element.fontFamily = 1
      element.textAlign = "left"
      element.verticalAlign = "top"
    } else if (shape.type === "geo") {
      const geo = shape.props?.geo || "rectangle"
      if (geo === "rectangle") {
        element.type = "rectangle"
      } else if (geo === "ellipse") {
        element.type = "ellipse"
      } else if (geo === "diamond") {
        element.type = "diamond"
      } else {
        element.type = "rectangle"
      }
      element.text = shape.props?.text || ""
    } else if (shape.type === "draw") {
      element.type = "freedraw"
      element.points = shape.props?.segments || []
    } else if (shape.type === "arrow") {
      element.type = "arrow"
      element.startBinding = null
      element.endBinding = null
    }

    excalidrawData.elements.push(element)
  })

  return JSON.stringify(excalidrawData, null, 2)
}
