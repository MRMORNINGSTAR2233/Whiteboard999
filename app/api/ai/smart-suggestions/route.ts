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

    const { elements, context, userIntent } = await request.json()

    const systemPrompt = `You are an AI assistant that provides smart suggestions for whiteboard improvements. Analyze the current whiteboard state and provide actionable suggestions.

Return a JSON object with:
{
  "suggestions": [
    {
      "id": "unique-id",
      "type": "add-element|modify-element|reorganize|connect|style",
      "title": "Short suggestion title",
      "description": "Detailed explanation",
      "action": {
        "type": "specific action type",
        "data": "action-specific data"
      },
      "confidence": number (0-1),
      "category": "layout|content|visual|workflow"
    }
  ],
  "insights": [
    "General insight about the whiteboard",
    "Pattern or trend observed"
  ]
}`

    const elementsDescription =
      elements?.map((el) => `${el.type}: "${el.content}" at (${el.x}, ${el.y})`).join(", ") || "No elements"

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      system: systemPrompt,
      prompt: `Analyze this whiteboard and provide suggestions:\n\nElements: ${elementsDescription}\nContext: ${context || "General whiteboard"}\nUser intent: ${userIntent || "Improve the whiteboard"}`,
    })

    let suggestionsData
    try {
      suggestionsData = JSON.parse(text)
    } catch (parseError) {
      // Fallback suggestions
      suggestionsData = {
        suggestions: [
          {
            id: "suggestion-1",
            type: "add-element",
            title: "Add connecting arrows",
            description: "Consider adding arrows to show relationships between elements",
            action: {
              type: "add-arrows",
              data: "between-elements",
            },
            confidence: 0.8,
            category: "workflow",
          },
        ],
        insights: [
          "The whiteboard could benefit from better visual connections",
          "Consider grouping related elements together",
        ],
      }
    }

    return NextResponse.json(suggestionsData)
  } catch (error) {
    console.error("Smart suggestions error:", error)
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
