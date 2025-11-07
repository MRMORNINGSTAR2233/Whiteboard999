import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { 
          error: "GROQ_API_KEY is not configured. Please add it to your .env.local file.",
          setup: "Get your API key from https://console.groq.com/keys"
        }, 
        { status: 500 }
      )
    }

    const { prompt, type = "diagram", context, options = {} } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const systemPrompt = `You are an expert AI Business Process Consultant that creates superior professional diagrams following industry best practices like Eraser. You create clean, professional diagrams with minimal styling.

CRITICAL: Return ONLY a valid JSON object with this exact structure (no markdown, no backticks, no explanations):
{
  "shapes": [
    {
      "id": "shape:unique-id",
      "type": "geo|text|arrow",
      "x": number,
      "y": number,
      "props": {
        "w": number,
        "h": number,
        "geo": "rectangle|ellipse|diamond|triangle|hexagon|star|cloud|x-box|check-box",
        "color": "black|grey|light-violet|violet|blue|light-blue|yellow|orange|green|light-green|light-red|red",
        "fill": "none",
        "dash": "solid",
        "size": "s",
        "font": "sans",
        "text": "descriptive text content",
        "align": "middle"
      }
    }
  ],
  "connections": [
    {
      "from": "shape:source-id",
      "to": "shape:target-id",
      "label": "optional connection label"
    }
  ],
  "title": "Professional Diagram Title",
  "description": "Brief description of the diagram"
}

PROFESSIONAL STYLING REQUIREMENTS (LIKE ERASER):
- DEFAULT FONT: Inter 12px regular (use "sans" font, "s" size)
- BORDERS: Darker grey thin lines (use "grey" color)
- FILL: NO filled colors (always use "fill": "none")
- LINE STYLE: Always solid lines (use "dash": "solid")
- TEXT: Regular Inter font 12px inside shapes (use "align": "middle")

LAYOUT REQUIREMENTS:
- FLOWCHARTS: Top-down vertical layout (start at top, flow downward)
- MINDMAPS: Left-to-right horizontal layout (main topic left, branches right)
- SPACING: Professional spacing - 300px horizontal, 200px vertical between elements
- ALIGNMENT: Grid-aligned positioning for clean appearance

DIAGRAM TYPE SPECIFIC LAYOUTS:
- FLOWCHART: Vertical flow from top to bottom
  - Start event at top (y: 100)
  - Process steps flowing downward (y: 300, 500, 700...)
  - Decision diamonds in flow
  - End event at bottom
- MINDMAP: Horizontal flow from left to right
  - Central topic on left (x: 200)
  - Main branches extending right (x: 500, 800, 1100...)
  - Sub-branches below main branches
- PROCESS DIAGRAM: Left-to-right workflow
  - Input on left, output on right
  - Process steps in sequence horizontally

SHAPE SELECTION:
- Start/End events: Use "ellipse" geometry
- Process steps: Use "rectangle" geometry  
- Decisions: Use "diamond" geometry
- Documents: Use "rectangle" geometry
- Data: Use "rectangle" geometry

PROFESSIONAL STANDARDS:
- Create 8-15 connected elements for comprehensive coverage
- Use consistent sizing: rectangles 200x80, ellipses 160x80, diamonds 180x100
- Include connecting arrows with logical flow
- Use descriptive but concise text labels
- Ensure proper spacing and alignment
- Make diagrams presentation-ready for business use`

    const enhancedPrompt = `Create a professional, clean ${type} diagram like Eraser for: ${prompt}

SPECIFIC STYLING REQUIREMENTS:
- Use Inter 12px font (size: "s", font: "sans")
- Dark grey borders only, no fill colors (fill: "none", color: "grey")
- Clean, minimal professional appearance
- Proper business terminology and clear labels

LAYOUT REQUIREMENTS FOR ${type.toUpperCase()}:
${
  type === "flowchart"
    ? `
- TOP-DOWN VERTICAL LAYOUT ONLY
- Start at y: 100, flow downward
- Vertical spacing: 200px between levels
- Center horizontally around x: 400
- Process flow from top to bottom
- NO horizontal positioning - everything flows vertically down`
    : type === "mindmap"
      ? `
- LEFT-TO-RIGHT HORIZONTAL LAYOUT  
- Central topic at x: 200, y: 300
- Main branches at x: 500, 800, 1100...
- Sub-branches below main branches
- Horizontal expansion from left to right`
      : `
- LOGICAL WORKFLOW LAYOUT
- Input to output flow
- Clear process sequence
- Professional spacing and alignment`
}

BUSINESS REQUIREMENTS:
- Include 8-15 connected elements minimum
- Use proper business process notation
- Include connecting arrows with clear flow
- Professional spacing: 300px horizontal, 200px vertical
- Make it detailed enough for business presentation
- Use consistent professional styling throughout`

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: enhancedPrompt,
    })

    // ... existing code for processing the response ...

    let cleanedText = text.trim()

    // Remove markdown code blocks if present
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    cleanedText = cleanedText.trim()

    let diagramData
    try {
      diagramData = JSON.parse(cleanedText)

      if (!diagramData.shapes || diagramData.shapes.length === 0) {
        throw new Error("No shapes generated")
      }

      diagramData.shapes = diagramData.shapes.map((shape: any, index: number) => {
        const baseShape = {
          ...shape,
          id: shape.id || `shape:ai-${Date.now()}-${index}`,
        }

        let x = shape.x
        let y = shape.y

        // Force proper positioning if not provided or incorrect
        if (type === "flowchart") {
          x = 400 // Always center horizontally
          y = 100 + index * 200 // Strict vertical flow with 200px spacing
        } else if (type === "mindmap") {
          // Left-to-right horizontal layout for mindmaps
          if (index === 0) {
            // Central topic
            x = 200
            y = 300
          } else {
            // Branches extending right
            const branchIndex = index - 1
            const branchesPerLevel = 3
            const level = Math.floor(branchIndex / branchesPerLevel)
            const positionInLevel = branchIndex % branchesPerLevel
            x = 500 + level * 300
            y = 200 + positionInLevel * 150
          }
        } else {
          // Default professional grid layout
          x = x || 200 + (index % 3) * 300
          y = y || 100 + Math.floor(index / 3) * 200
        }

        return {
          ...baseShape,
          x,
          y,
          props: {
            w: shape.props?.geo === "ellipse" ? 160 : shape.props?.geo === "diamond" ? 180 : 200,
            h: shape.props?.geo === "ellipse" ? 80 : shape.props?.geo === "diamond" ? 100 : 80,
            geo: shape.props?.geo || "rectangle",
            color: "grey", // Always use grey for professional borders
            fill: "none", // Never use fill colors for clean appearance
            dash: "solid", // Always solid lines
            size: "s", // Always use small size for 12px Inter font
            font: "sans", // Always use sans (Inter) font
            text: shape.props?.text || `Element ${index + 1}`,
            align: "middle", // Always center-align text
          },
        }
      })

      // ... existing code for connections ...

      if (diagramData.connections && diagramData.connections.length > 0) {
        const shapeMap = new Map()
        diagramData.shapes.forEach((shape: any) => {
          shapeMap.set(shape.id, shape)
        })

        diagramData.connections.forEach((connection: any, index: number) => {
          const fromShape = shapeMap.get(connection.from)
          const toShape = shapeMap.get(connection.to)

          if (fromShape && toShape) {
            const fromCenterX = fromShape.x + fromShape.props.w / 2
            const fromCenterY = fromShape.y + fromShape.props.h / 2
            const toCenterX = toShape.x + toShape.props.w / 2
            const toCenterY = toShape.y + toShape.props.h / 2

            const deltaX = toCenterX - fromCenterX
            const deltaY = toCenterY - fromCenterY
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

            const dirX = deltaX / distance
            const dirY = deltaY / distance

            const fromEdgeX = fromCenterX + dirX * (fromShape.props.w / 2)
            const fromEdgeY = fromCenterY + dirY * (fromShape.props.h / 2)
            const toEdgeX = toCenterX - dirX * (toShape.props.w / 2)
            const toEdgeY = toCenterY - dirY * (toShape.props.h / 2)

            const arrow = {
              id: `shape:arrow-${Date.now()}-${index}`,
              type: "arrow",
              x: fromEdgeX,
              y: fromEdgeY,
              props: {
                start: { x: 0, y: 0 },
                end: { x: toEdgeX - fromEdgeX, y: toEdgeY - fromEdgeY },
                color: "grey", // Use grey for professional appearance
                size: "xs", // Use extra small size for 11px font on arrows/lines
                dash: "solid",
                arrowheadStart: "none",
                arrowheadEnd: "arrow",
                text: connection.label || "",
              },
            }

            diagramData.shapes.push(arrow)
          }
        })
      } else {
        // ... existing fallback connection logic ...
        const nonArrowShapes = diagramData.shapes.filter((s: any) => s.type !== "arrow")
        for (let i = 0; i < nonArrowShapes.length - 1; i++) {
          const fromShape = nonArrowShapes[i]
          const toShape = nonArrowShapes[i + 1]

          const fromCenterX = fromShape.x + fromShape.props.w / 2
          const fromCenterY = fromShape.y + fromShape.props.h / 2
          const toCenterX = toShape.x + toShape.props.w / 2
          const toCenterY = toShape.y + toShape.props.h / 2

          const deltaX = toCenterX - fromCenterX
          const deltaY = toCenterY - fromCenterY
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

          const dirX = deltaX / distance
          const dirY = deltaY / distance

          const fromEdgeX = fromCenterX + dirX * (fromShape.props.w / 2)
          const fromEdgeY = fromCenterY + dirY * (fromShape.props.h / 2)
          const toEdgeX = toCenterX - dirX * (toShape.props.w / 2)
          const toEdgeY = toCenterY - dirY * (toShape.props.h / 2)

          diagramData.shapes.push({
            id: `shape:connector-${Date.now()}-${i}`,
            type: "arrow",
            x: fromEdgeX,
            y: fromEdgeY,
            props: {
              start: { x: 0, y: 0 },
              end: { x: toEdgeX - fromEdgeX, y: toEdgeY - fromEdgeY },
              color: "grey", // Use grey for professional appearance
              size: "xs", // Use extra small size for 11px font on connector lines
              dash: "solid",
              arrowheadStart: "none",
              arrowheadEnd: "arrow",
              text: "",
            },
          })
        }
      }
    } catch (parseError) {
      // ... existing fallback logic ...
      console.error("Failed to parse AI response:", parseError)
      console.error("Raw AI response:", text)
      console.error("Cleaned response:", cleanedText)

      diagramData = {
        shapes: [
          {
            id: `shape:start-${Date.now()}`,
            type: "geo",
            x: 400, // Center horizontally for flowchart
            y: 100, // Start at top
            props: {
              w: 160,
              h: 80,
              geo: "ellipse",
              color: "grey", // Professional grey borders
              fill: "none", // No fill for clean look
              dash: "solid",
              size: "s", // 12px font size for shapes
              font: "sans", // Inter font
              text: "Start",
              align: "middle",
            },
          },
          {
            id: `shape:process-${Date.now()}`,
            type: "geo",
            x: 400,
            y: 300, // Proper vertical spacing for top-down flow
            props: {
              w: 200,
              h: 80,
              geo: "rectangle",
              color: "grey",
              fill: "none",
              dash: "solid",
              size: "s", // 12px font size
              font: "sans",
              text: prompt.slice(0, 30) + (prompt.length > 30 ? "..." : ""),
              align: "middle",
            },
          },
          {
            id: `shape:decision-${Date.now()}`,
            type: "geo",
            x: 400,
            y: 500, // Continue vertical flow
            props: {
              w: 180,
              h: 100,
              geo: "diamond",
              color: "grey",
              fill: "none",
              dash: "solid",
              size: "s", // 12px font size
              font: "sans",
              text: "Decision?",
              align: "middle",
            },
          },
          {
            id: `shape:end-${Date.now()}`,
            type: "geo",
            x: 400,
            y: 700, // End at bottom
            props: {
              w: 160,
              h: 80,
              geo: "ellipse",
              color: "grey",
              fill: "none",
              dash: "solid",
              size: "s", // 12px font size
              font: "sans",
              text: "End",
              align: "middle",
            },
          },
        ],
        title: `Professional ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        description: `Clean, professional diagram for: ${prompt}`,
      }
    }

    return NextResponse.json({ success: true, ...diagramData })
  } catch (error) {
    console.error("AI diagram generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate professional diagram. Please try again with more specific business requirements.",
      },
      { status: 500 },
    )
  }
}
