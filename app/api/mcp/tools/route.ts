import { type NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import type { Stream } from "openai/streaming"
import type {
  ResponseCreatedEvent,
  ResponseOutputItemDoneEvent,
  ResponseTextDoneEvent,
} from "openai/resources/responses/responses"

import { zodTextFormat } from "openai/helpers/zod"
import { z } from "zod"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface McpListToolsItem {
  id: string
  type: "mcp_list_tools"
  server_label: string
  tools: Array<{ name: string; description?: string; input_schema?: any }>
}

const SuggestedPromptSchema = z.object({
  output: z.string().describe("A single suggested prompt string."),
})

const SuggestedPromptsListSchema = z.object({
  suggested_prompts: z
    .array(SuggestedPromptSchema)
    .describe("An array of 5 distinct example questions a user might ask related to the MCP server's tools."),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { server_url, server_label } = body

    if (!server_url || !server_label) {
      return NextResponse.json({ error: "server_url and server_label are required" }, { status: 400 })
    }

    const systemPrompt = `You are an assistant that helps configure MCP servers.
1. Interact with the provided MCP server to list its available tools.
2. Based on the listed tools, generate a list of 5 distinct example prompts a user might ask.
  Focus on a shopping context if the tools seem related to e-commerce.
  Return these prompts in the specified JSON format using the 'Suggests' tool.
  The JSON object should have a key "suggested_prompts", which is an array of objects, each with an "output" key holding the question string.`

    // @ts-expect-error Known issue with SDK types for stream with tools
    const stream: Stream<ResponseCreatedEvent | ResponseOutputItemDoneEvent | ResponseTextDoneEvent> =
      await openai.responses.create({
        model: "gpt-4.1-mini",
        input: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `List tools for MCP server "${server_label}" at ${server_url} and provide suggested user prompts.`,
          },
        ],
        tools: [
          {
            type: "mcp",
            server_label: server_label,
            server_url: server_url,
            require_approval: "never",
          },
        ],
        text: {
          format: zodTextFormat(SuggestedPromptsListSchema, "Suggests"),
        },
        stream: true,
      })

    let toolNames: string[] = []
    let suggestedPrompts: string[] = []
    let serverValid = false

    for await (const event of stream) {
      if (event.type === "response.output_item.done") {
        const item = event.item as McpListToolsItem
        if (item.type === "mcp_list_tools" && item.server_label === server_label) {
          serverValid = true
          if (item.tools && Array.isArray(item.tools)) {
            toolNames = item.tools.map((tool) => tool.name).filter(Boolean)
          }
        }
      } else if (event.type === "response.output_text.done") {
        const textContent = event.text
        try {
          const parsedSuggestions = JSON.parse(textContent) as z.infer<typeof SuggestedPromptsListSchema>
          if (parsedSuggestions.suggested_prompts) {
            suggestedPrompts = parsedSuggestions.suggested_prompts.map((p) => p.output)
          }
        } catch (e) {
          console.warn("Failed to parse structured suggestions, might not be in expected JSON format:", textContent, e)
        }
      }
    }

    if (!serverValid && toolNames.length === 0) {
      return NextResponse.json(
        { error: "MCP server did not respond with a valid tool list or label mismatch." },
        { status: 400 },
      )
    }

    return NextResponse.json({ tools: toolNames, suggestedPrompts: suggestedPrompts })
  } catch (error) {
    console.error("Error fetching MCP tools and suggestions:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch MCP tools and suggestions"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
