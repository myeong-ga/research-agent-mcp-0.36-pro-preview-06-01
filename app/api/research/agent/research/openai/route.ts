import { type NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import type { Message, ModelConfig, ReasoningType } from "@/lib/types"
import { OPENAI_SEARCH_SUGGESTIONS_PROMPT } from "@/lib/system-prompt"

interface RequestBody {
  messages: Message[]
  model: string
  sessionId: string
  modelConfig: ModelConfig
  reasoningType?: ReasoningType
}

interface StreamEvent {
  type: string
  [key: string]: any
}

interface SearchSuggestions {
  searchTerms: string[]
  confidence: number
  reasoning: string
}

function extractSearchSuggestionsFromText(text: string): SearchSuggestions | null {
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

function validateMessages(messages: any[]): Message[] {
  return messages
    .filter((message) => {
      const isValid =
        message &&
        typeof message === "object" &&
        (message.role === "user" || message.role === "assistant" || message.role === "system") &&
        typeof message.content === "string"

      if (!isValid) {
        console.warn("Invalid message format detected and filtered out:", message)
      }

      return isValid
    })
    .map((message) => ({
      role: message.role,
      content: message.content,
      id: message.id,
      name: message.name,
    }))
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const body: RequestBody = await request.json()
    const { messages, model, modelConfig, reasoningType } = body

    const client = new OpenAI({ apiKey })

     const systemMessage = {
      role: "system" as const,
      content: OPENAI_SEARCH_SUGGESTIONS_PROMPT,
    }

    const openaiMessages = [
      systemMessage,
      ...messages.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })),
    ]

    const requestOptions: any = {
      model,
      input: openaiMessages,
      stream: true,
      parallel_tool_calls: false,
      temperature: modelConfig.temperature,
      top_p: modelConfig.topP,
      max_output_tokens: modelConfig.maxTokens,
    }
    // NOTE : https://platform.openai.com/docs/api-reference/responses/create#responses-create-reasoning
    if (reasoningType === "Thinking") {
      requestOptions.reasoning = {
        effort: "medium",
        summary: "auto",
      }
    } else {
      requestOptions.tools = [
        {
          type: "web_search_preview_2025_03_11",
          search_context_size: "medium",
        },
      ]
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await client.responses.create(requestOptions)


          let thoughts = ""
           let fullText = ""
          console.log(
            "Starting OpenAI Research stream execution with model:",
            model,
            "reasoningType:",
            reasoningType,
          )

          for await (const event of response as unknown as AsyncIterable<StreamEvent>) {
            const streamEvent = event as StreamEvent

            if (streamEvent.type === "response.output_text.delta") {
              fullText += streamEvent.delta || ""
              const textDeltaData = {
                type: "text-delta",
                text: streamEvent.delta || "",
              }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(textDeltaData)}\n\n`))
            } //else if (streamEvent.type === "response.completed") {
              //
              // Research Agent 의 token usage 는 Telemetry solution ( OpenTelemetry , LangSmith , Braintrust ) 을 통해 지원 예정
              //
              // if (streamEvent.response?.usage) {
              //   const usage = streamEvent.response.usage
              //   controller.enqueue(
              //     new TextEncoder().encode(
              //       `data: ${JSON.stringify({
              //         type: "usage",
              //         usage: {
              //           promptTokens: usage.input_tokens || 0,
              //           completionTokens: usage.output_tokens || 0,
              //           totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
              //           finishReason: "completed",
              //         },
              //       })}\n\n`,
              //     ),
              //   )
              // }
            //} 
            else if (streamEvent.type === "response.reasoning_summary_text.delta") {
              console.log("OpenAI Reasoning Summary Delta:", streamEvent.delta ,streamEvent.summary_index)
              const data = {
                  type: "thinking-delta",
                  thinking: streamEvent.delta ,
                  summary_index: streamEvent.summary_index,
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

            } else if (streamEvent.type === "response.reasoning_summary_text.done") {
              console.log("OpenAI Reasoning Summary Text:", streamEvent.text ,streamEvent.summary_index)
              const data = {
                  type: "openai-thinking-done",
                  thinking: streamEvent.texxt ,
                  summary_index: streamEvent.summary_index,
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

            } else if (streamEvent.type === "response.output_item.done") {
              const item = streamEvent.item
              if (item.type === "reasoning") {
               
                console.log("OpenAI Reasoning response output:", item.summary)
              }

            } else if (streamEvent.type === "error") {
              const errorData = {
                type: "error",
                error: event instanceof Error ? event.message : "Unknown error occurred",
              }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`))
            }
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

          const selectedProviderData = {
            type: "selected-provider",
            provider: "openai",
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(selectedProviderData)}\n\n`))

          const selectedModelData = {
            type: "selected-model",
            model,
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(selectedModelData)}\n\n`))

          if (reasoningType) {
            const reasoningTypeData = {
              type: "reasoning-type",
              reasoning: reasoningType,
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(reasoningTypeData)}\n\n`))
          }

          controller.close()
        } catch (error) {
          console.error("Error in OpenAI stream:", error)
          const errorData = {
            type: "error",
            error: error instanceof Error ? error.message : "Unknown error occurred",
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error in OpenAI research agent:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
