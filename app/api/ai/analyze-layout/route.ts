import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: NextRequest) {
  try {
    const { elements, canvasSize } = await request.json()

    if (!elements || !Array.isArray(elements)) {
      return NextResponse.json({ error: "Elements array is required" }, { status: 400 })
    }

    const systemPrompt = `You are an AI layout analyzer for whiteboard applications. Analyze the current layout of elements and provide suggestions for improvement.

Consider:
- Spacing and alignment
- Visual hierarchy
- Grouping related elements
- Flow and readability
- Canvas utilization

Return a JSON object with:
{
  "suggestions": [
    {
      "type": "alignment|spacing|grouping|hierarchy|flow",
      "description": "What to improve",
      "action": "Specific action to take",
      "priority": "high|medium|low"
    }
  ],
  "optimizedLayout": [
    {
      "id": "element-id",
      "x": number,
      "y": number,
      "reasoning": "Why this position is better"
    }
  ],
  "score": number (0-100, current layout quality)
}`

    const elementsDescription = elements
      .map(
        (el) =>
          `Element ${el.id}: ${el.type} at (${el.x}, ${el.y}) size ${el.width}x${el.height} content: "${el.content}"`,
      )
      .join("\n")

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      system: systemPrompt,
      prompt: `Analyze this whiteboard layout:\n\nCanvas size: ${canvasSize?.width || 1200}x${canvasSize?.height || 800}\n\nElements:\n${elementsDescription}`,
    })

    let analysisData
    try {
      analysisData = JSON.parse(text)
    } catch (parseError) {
      // Fallback analysis
      analysisData = {
        suggestions: [
          {
            type: "alignment",
            description: "Elements could be better aligned",
            action: "Align elements to a grid for better visual organization",
            priority: "medium",
          },
        ],
        optimizedLayout: elements.map((el) => ({
          id: el.id,
          x: Math.round(el.x / 20) * 20, // Snap to 20px grid
          y: Math.round(el.y / 20) * 20,
          reasoning: "Aligned to grid for better organization",
        })),
        score: 75,
      }
    }

    return NextResponse.json(analysisData)
  } catch (error) {
    console.error("Layout analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze layout" }, { status: 500 })
  }
}
