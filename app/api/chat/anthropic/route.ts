import { ANTHROPIC_SEARCH_SUGGESTIONS_PROMPT } from "@/lib/system-prompt"
import Anthropic from "@anthropic-ai/sdk"
import type { ToolUnion } from "@anthropic-ai/sdk/resources/index.mjs"
import type { NextRequest } from "next/server"
import type { AnthropicModelMessage, ModelConfig } from "@/lib/types"
import { DEFAULT_MODEL_CONFIG } from "@/lib/models"

export const runtime = "nodejs"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
})

function extractSearchSuggestionsFromText(
  text: string,
): { searchTerms: string[]; confidence: number; reasoning: string } | null {
  try {
    const regex = /```SEARCH_TERMS_JSON\s*({[\s\S]*?})\s*```/
    const match = text.match(regex)

    if (match && match[1]) {
      const jsonStr = match[1].trim()
      const searchSuggestions = JSON.parse(jsonStr)

      if (
        searchSuggestions &&
        Array.isArray(searchSuggestions.searchTerms) &&
        typeof searchSuggestions.confidence === "number" &&
        typeof searchSuggestions.reasoning === "string"
      ) {
        return {
          searchTerms: searchSuggestions.searchTerms,
          confidence: searchSuggestions.confidence,
          reasoning: searchSuggestions.reasoning,
        }
      }
    }
    return null
  } catch (error) {
    console.error("Error extracting search suggestions:", error)
    return null
  }
}

function removeSearchTermsJson(text: string): string {
  const pattern = /```SEARCH_TERMS_JSON\s*({[\s\S]*?})\s*```/g
  return text.replace(pattern, "").trim()
}

function validateMessages(messages: any[]): AnthropicModelMessage[] {
  return messages
    .filter((message) => {
      const isValid =
        message &&
        typeof message === "object" &&
        (message.role === "user" || message.role === "assistant") && // Only user or assistant roles
        typeof message.content === "string"

      if (!isValid) {
        console.warn("Invalid message format detected and filtered out:", message)
      }

      return isValid
    })
    .map((message) => ({
      id: message.id || nanoid(),
      role: message.role as "user" | "assistant",
      content: message.content,
    }))
}

// Simple nanoid implementation for generating IDs
function nanoid(size = 21): string {
  const urlAlphabet = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW"
  let id = ""
  let i = size
  while (i--) {
    id += urlAlphabet[(Math.random() * 64) | 0]
  }
  return id
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: "Invalid request body. Expected messages array." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    let selectedModel = "claude-3-5-sonnet-latest"

    if (body.model && typeof body.model === "string") {
      selectedModel = body.model
    } else {
      const modelCookie = req.cookies.get("selectedAnthropicModel")
      if (modelCookie) {
        selectedModel = modelCookie.value
      }
    }

    const modelConfig: ModelConfig = body.modelConfig || DEFAULT_MODEL_CONFIG
    const reasoningType = body.reasoningType || "Reasoning"

    const validatedMessages = validateMessages(body.messages)
    const formattedMessages = validatedMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    const tools = [
      { name: "web_search", type: "web_search_20250305", max_uses: 1, cache_control: { type: "ephemeral" } },
    ] as ToolUnion[]

    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const stream = await anthropic.messages.stream({
            model: selectedModel,
            max_tokens: modelConfig.maxTokens,
            temperature: modelConfig.temperature,
            //top_p: modelConfig.topP,
            system: ANTHROPIC_SEARCH_SUGGESTIONS_PROMPT,
            messages: formattedMessages,
            tools,
            //     claude sonnet 3.7 에서 다음을 지원
            // thinking: { type: 'enabled', budget_tokens: 1600 },
            // thinking 을 사용하려면 temperature 가 1로 설정되어야 하고 
            // top P 는 파라미터에서 사용되어서는 안된다.
            // claude sonnet 3.5는 thinking 을 지원하지 않으니 thinking 이 설정되어서는 안된다.
            // thinking: { type: 'enabled', budget_tokens: 1600 },
          })

          const sources: any[] = []
          let fullText = ""
         
          console.log("Starting Anthropic stream execution with model:", selectedModel, "reasoningType:", reasoningType)

          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta") {
              if (chunk.delta.type === "text_delta") {
                fullText += chunk.delta.text

                const data = {
                  type: "text-delta",
                  text: chunk.delta.text,
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
              } else if (chunk.delta.type === "citations_delta") {
                const citation = chunk.delta.citation
                if (citation.type === "web_search_result_location") {
                  const source = {
                    url: citation.url || "",
                    title: citation.title || "",
                    cited_text: citation.cited_text || "",
                  }

                  const existingSourceIndex = sources.findIndex((s) => s.url === source.url)
                  if (existingSourceIndex >= 0) {
                    if (source.cited_text && !sources[existingSourceIndex].cited_text.includes(source.cited_text)) {
                      sources[existingSourceIndex].cited_text += `\n\n${source.cited_text}`
                    }
                  } else {
                    sources.push(source)
                  }
                }
              } else if (chunk.delta.type === "thinking_delta") {
                console.log(`Claude Thinking: ${chunk.delta.thinking}`)
              }
            } else if (chunk.type === "message_delta") {
              if (chunk.delta.stop_reason) {
                const data = {
                  type: "stop_reason",
                  stop_reason: chunk.delta.stop_reason,
                }

                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
              }

              if (chunk.usage) {
                const data = {
                  type: "usage",
                  usage: chunk.usage,
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
              }
            }
          }

          if (sources.length > 0) {
            const data = {
              type: "sources",
              sources,
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
          }

          const searchSuggestions = extractSearchSuggestionsFromText(fullText)
          if (searchSuggestions) {
            const data = {
              type: "searchSuggestions",
              searchSuggestions: searchSuggestions.searchTerms,
              confidence: searchSuggestions.confidence,
              reasoning: searchSuggestions.reasoning,
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
          }

          const cleanedText = removeSearchTermsJson(fullText)
          if (cleanedText !== fullText) {
            const data = {
              type: "cleaned-text",
              text: cleanedText,
              messageId: Date.now().toString(),
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
          }

          const configData = {
            type: "model-config",
            config: modelConfig,
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(configData)}\n\n`))

          const selectedModelData = {
            type:"selected-model",
            model: selectedModel,
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(selectedModelData)}\n\n`))

          const reasoningTypeData = {
            type:"reasoning-type",
            reasoning: reasoningType,
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(reasoningTypeData)}\n\n`))
          

          controller.close()
        } catch (error) {
          console.error("Error in stream processing:", error)
          const errorData = {
            type: "error",
            error: error instanceof Error ? error.message : String(error),
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error in Anthropic chat API:", error)
    return new Response(JSON.stringify({ error: "Failed to process Anthropic chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
