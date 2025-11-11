import pptxgen from "pptxgenjs"

/**
 * Convert TLDraw whiteboard data to PowerPoint format
 */
export async function exportToPPTX(
  whiteboardData: any,
  whiteboardName: string
): Promise<Buffer> {
  const pptx = new pptxgen()

  // Set presentation properties
  pptx.author = "AI Whiteboard"
  pptx.title = whiteboardName
  pptx.subject = "Whiteboard Export"

  // Create title slide
  const titleSlide = pptx.addSlide()
  titleSlide.background = { color: "FFFFFF" }
  titleSlide.addText(whiteboardName, {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: "363636",
    align: "center",
  })
  titleSlide.addText(`Exported on ${new Date().toLocaleDateString()}`, {
    x: 0.5,
    y: 3.5,
    w: 9,
    h: 0.5,
    fontSize: 18,
    color: "666666",
    align: "center",
  })

  // Extract shapes
  const shapes = Object.values(whiteboardData.records || {}).filter(
    (record: any) => record.typeName === "shape"
  )

  // Group shapes by type
  const textShapes = shapes.filter((s: any) => s.type === "text")
  const geoShapes = shapes.filter((s: any) => s.type === "geo")
  const drawShapes = shapes.filter((s: any) => s.type === "draw")

  // Add text shapes slide
  if (textShapes.length > 0) {
    const textSlide = pptx.addSlide()
    textSlide.background = { color: "FFFFFF" }
    textSlide.addText("Text Content", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.75,
      fontSize: 32,
      bold: true,
      color: "3B82F6",
    })

    let yPos = 1.5
    textShapes.slice(0, 10).forEach((shape: any) => {
      if (shape.props?.text && yPos < 6.5) {
        textSlide.addText(shape.props.text, {
          x: 0.5,
          y: yPos,
          w: 9,
          h: 0.5,
          fontSize: 16,
          color: "363636",
        })
        yPos += 0.6
      }
    })
  }

  // Add shapes slide
  if (geoShapes.length > 0) {
    const shapesSlide = pptx.addSlide()
    shapesSlide.background = { color: "FFFFFF" }
    shapesSlide.addText("Shapes", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.75,
      fontSize: 32,
      bold: true,
      color: "3B82F6",
    })

    let yPos = 1.5
    geoShapes.slice(0, 10).forEach((shape: any) => {
      const geo = shape.props?.geo || "shape"
      const text = shape.props?.text || ""

      if (yPos < 6.5) {
        shapesSlide.addText(`${geo}: ${text}`, {
          x: 0.5,
          y: yPos,
          w: 9,
          h: 0.5,
          fontSize: 16,
          color: "363636",
        })
        yPos += 0.6
      }
    })
  }

  // Add summary slide
  const summarySlide = pptx.addSlide()
  summarySlide.background = { color: "FFFFFF" }
  summarySlide.addText("Summary", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.75,
    fontSize: 32,
    bold: true,
    color: "3B82F6",
  })
  summarySlide.addText(
    [
      { text: `Total Shapes: ${shapes.length}\n`, options: { fontSize: 18 } },
      { text: `Text Elements: ${textShapes.length}\n`, options: { fontSize: 18 } },
      { text: `Geometric Shapes: ${geoShapes.length}\n`, options: { fontSize: 18 } },
      { text: `Drawings: ${drawShapes.length}`, options: { fontSize: 18 } },
    ],
    {
      x: 0.5,
      y: 2,
      w: 9,
      h: 3,
      color: "363636",
    }
  )

  // Generate and return buffer
  const buffer = await pptx.write({ outputType: "nodebuffer" })
  return buffer as Buffer
}
