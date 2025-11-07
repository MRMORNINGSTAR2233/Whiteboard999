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

    const { contentType, context, prompt } = await request.json()

    if (!contentType) {
      return NextResponse.json({ error: "Content type is required" }, { status: 400 })
    }

    const contentPrompts = {
      brainstorm: "Generate creative brainstorming ideas and organize them into categories",
      "user-stories": 'Create user stories in the format "As a [user], I want [goal] so that [benefit]"',
      "meeting-notes": "Structure meeting notes with agenda, discussion points, decisions, and action items",
      "project-plan": "Create a project plan with phases, milestones, and deliverables",
      "swot-analysis": "Generate a SWOT analysis with Strengths, Weaknesses, Opportunities, and Threats",
      personas: "Create detailed user personas with demographics, goals, pain points, and behaviors",
    }

    const systemPrompt = `You are an AI content generator for whiteboard applications. Generate structured content that can be organized into whiteboard elements.

Content type: ${contentType}
Task: ${contentPrompts[contentType as keyof typeof contentPrompts] || "Generate relevant content"}

Return a JSON object with:
{
  "content": {
    "title": "Main title",
    "sections": [
      {
        "heading": "Section title",
        "items": ["item 1", "item 2", "item 3"],
        "type": "list|text|grid"
      }
    ]
  },
  "suggestedLayout": {
    "type": "grid|linear|radial|hierarchical",
    "description": "How to arrange the content visually"
  }
}`

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      system: systemPrompt,
      prompt: `Generate ${contentType} content. ${context ? `Context: ${context}` : ""} ${prompt ? `Additional requirements: ${prompt}` : ""}`,
    })

    let contentData
    try {
      contentData = JSON.parse(text)
    } catch (parseError) {
      // Fallback content
      contentData = {
        content: {
          title: `AI Generated ${contentType}`,
          sections: [
            {
              heading: "Main Points",
              items: ["Point 1", "Point 2", "Point 3"],
              type: "list",
            },
          ],
        },
        suggestedLayout: {
          type: "linear",
          description: "Arrange items in a linear flow from left to right",
        },
      }
    }

    return NextResponse.json(contentData)
  } catch (error) {
    console.error("Content generation error:", error)
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
