import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { GOOGLE_SEARCH_SUGGESTIONS_PROMPT } from "@/lib/system-prompt"
import type { ModelMessage, ModelConfig } from "@/lib/types"
import { DEFAULT_MODEL_CONFIG } from "@/lib/models"

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

function validateMessages(messages: any[]): ModelMessage[] {
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
      ...(message.id && { id: message.id }),
      ...(message.name && { name: message.name }),
    }))
}

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: "Invalid request body. Expected messages array." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    let selectedModel = "gemini-2.5-flash-preview-05-20"

    if (body.model && typeof body.model === "string") {
      selectedModel = body.model
    }

    const modelConfig: ModelConfig = body.modelConfig || DEFAULT_MODEL_CONFIG
    const reasoningType = body.reasoningType || "Thinking"

    const validatedMessages = validateMessages(body.messages)

    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""
          if (!GEMINI_API_KEY) {
            throw new Error("Google API key is not configured")
          }

          const client = new GoogleGenAI({
            vertexai: false,
            apiKey: GEMINI_API_KEY,
            httpOptions: { apiVersion: "v1alpha" },
          })

          const contents = validatedMessages.map((msg) => {
            if (msg.role === "system") {
              return { role: "user", parts: [{ text: msg.content }] }
            }
            return {
              role: msg.role === "assistant" ? "model" : "user",
              parts: [{ text: msg.content }],
            }
          })

          // Add system prompt if not present
          if (!validatedMessages.some((msg) => msg.role === "system")) {
            contents.unshift({
              role: "user",
              parts: [{ text: GOOGLE_SEARCH_SUGGESTIONS_PROMPT }],
            })
          }
          
          const response = await client.models.generateContentStream({
            model: selectedModel,
            contents,
            config: {
              maxOutputTokens: modelConfig.maxTokens,
              temperature: modelConfig.temperature,
              topP: modelConfig.topP,
              candidateCount: 1,
              thinkingConfig: { includeThoughts: true , thinkingBudget: 1600 },
            },
          })

          let fullText = ""
          const sources: any[] = []
          let thoughts = ""
          console.log("Starting Gemini Research stream execution with model:", selectedModel, "reasoningType:", reasoningType)

          for await (const chunk of response) {

            if (chunk.candidates && chunk.candidates.length > 0) {

              const candidate = chunk.candidates[0]

              if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {


                const part = candidate.content.parts[0]

                if(part.thought) {
                  if (part.text) {
                    console.log("Gemini is Thinking  :", JSON.stringify(candidate))

                    const data = {
                      type: "thinking-delta",
                      thinking: part.text,
                    }

                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
                  }
                } else {
                    if (part.text) {
                    fullText += part.text

                    const data = {
                      type: "text-delta",
                      text: part.text,
                    }
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
                  }

                }
                
              }
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

          const selectedModelData = {
            type: "selected-model",
            model: selectedModel,
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(selectedModelData)}\n\n`))

          const selectedProviderData = {
            type: "selected-provider",
            provider: "gemini",
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(selectedProviderData)}\n\n`))

          const reasoningTypeData = {
            type: "reasoning-type",
            reasoning: reasoningType,
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(reasoningTypeData)}\n\n`))

          //
          // Research Agent 의 token usage 는 Telemetry solution ( OpenTelemetry , LangSmith , Braintrust ) 을 통해 지원 예정
          //
          // const usageData = {
          //   type: "usage",
          //   usage: {
          //     promptTokens: validatedMessages.reduce((acc, msg) => acc + msg.content.length / 4, 0),
          //     completionTokens: fullText.length / 4,
          //     totalTokens:
          //       validatedMessages.reduce((acc, msg) => acc + msg.content.length / 4, 0) + fullText.length / 4,
          //     finishReason: "stop",
          //   },
          // }
          // controller.enqueue(encoder.encode(`data: ${JSON.stringify(usageData)}\n\n`))

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
    console.error("Error in Gemini research agent API:", error)
    return NextResponse.json({ error: "Failed to process Gemini research agent request" }, { status: 500 })
  }
}
