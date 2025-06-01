import { google, GoogleGenerativeAIProviderOptions } from "@ai-sdk/google"
import { createDataStreamResponse, JSONValue, streamText } from "ai"
import type { NextRequest } from "next/server"
import { GOOGLE_SEARCH_SUGGESTIONS_PROMPT } from "@/lib/system-prompt"
import type { ModelMessage, ModelConfig } from "@/lib/types"
import { DEFAULT_MODEL_CONFIG } from "@/lib/models"

interface GoogleGroundingMetadata {
  searchEntryPoint?: {
    renderedContent: string
  }
  groundingChunks?: Array<{
    web?: {
      uri: string
      title: string
    }
  }>
  groundingSupports?: Array<{
    segment: {
      startIndex?: number
      endIndex: number
      text: string
    }
    groundingChunkIndices: number[]
    confidenceScores: number[]
  }>
  webSearchQueries?: string[]
}

interface GoogleProviderMetadata {
  google?: {
    groundingMetadata?: GoogleGroundingMetadata
    safetyRatings?: any
  }
}

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
      // Validate each message has the required properties
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
      // Only include id if it exists
      ...(message.id && { id: message.id }),
      // Only include name if it exists
      ...(message.name && { name: message.name }),
    }))
}

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate request body
    if (!body || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: "Invalid request body. Expected messages array." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get the selected model from the request or use default
    let selectedModel = "gemini-2.0-flash"

    // Check if the request includes a model selection
    if (body.model && typeof body.model === "string") {
      selectedModel = body.model
    } else {
      // Get the selected model from cookies as fallback
      const modelCookie = req.cookies.get("selectedGeminiModel")
      if (modelCookie) {
        selectedModel = modelCookie.value
      }
    }

    // Get model configuration
    const modelConfig: ModelConfig = body.modelConfig || DEFAULT_MODEL_CONFIG
    const reasoningType = body.reasoningType || "Reasoning"

    // Validate and sanitize messages
    const validatedMessages = validateMessages(body.messages)

    return createDataStreamResponse({
      execute: async (dataStream) => {
        
        console.log("Starting Gemini chat stream execution with model:", selectedModel, "reasoningType:", reasoningType)

        let fullText = ""

        const result = streamText({
          model: google(selectedModel, {
            useSearchGrounding: true,
          }),
          messages: validatedMessages,
          system: GOOGLE_SEARCH_SUGGESTIONS_PROMPT,
          temperature: modelConfig.temperature,
          topP: modelConfig.topP,
          maxTokens: modelConfig.maxTokens,
          onChunk: ({ chunk }) => {
            if (chunk.type === "text-delta") {
              fullText += chunk.textDelta

              dataStream.writeData({
                type: "text-delta",
                text: chunk.textDelta,
              })
            }
          },
          onFinish: ({ text, providerMetadata, usage, finishReason , reasoning }) => {
            console.log("Gemini onFinish called")

            try {
              const metadata = providerMetadata as unknown as GoogleProviderMetadata

              if (metadata?.google?.groundingMetadata) {
                const groundingMetadata = metadata.google.groundingMetadata

                if (groundingMetadata.groundingChunks) {
                  const sources = groundingMetadata.groundingChunks
                    .filter((chunk) => chunk.web && chunk.web.uri)
                    .map((chunk, index) => ({
                      url: chunk.web!.uri,
                      title: chunk.web!.title || new URL(chunk.web!.uri).hostname,
                      cited_text: "",
                      index,
                    }))

                  if (groundingMetadata.groundingSupports) {
                    for (const support of groundingMetadata.groundingSupports) {
                      if (support.segment && support.segment.text && support.groundingChunkIndices) {
                        for (const chunkIndex of support.groundingChunkIndices) {
                          const sourceIndex = sources.findIndex((s) => s.index === chunkIndex)
                          if (sourceIndex !== -1) {
                            const source = sources[sourceIndex]
                            if (!source.cited_text.includes(support.segment.text)) {
                              source.cited_text = source.cited_text
                                ? `${source.cited_text}\n\n${support.segment.text}`
                                : support.segment.text
                            }
                          }
                        }
                      }
                    }
                  }

                  const cleanedSources = sources.map(({ url, title, cited_text }) => ({
                    url,
                    title,
                    cited_text,
                  }))
                  //console.log("Gemini Cleaned sources:", cleanedSources)
                  if (cleanedSources.length > 0) {
                    dataStream.writeData({ type: "sources", sources: cleanedSources })
                  }
                }
              }

              const searchSuggestions = extractSearchSuggestionsFromText(fullText)
              if (searchSuggestions) {
                dataStream.writeData({
                  type: "searchSuggestions",
                  searchSuggestions: searchSuggestions.searchTerms,
                  confidence: searchSuggestions.confidence,
                  reasoning: searchSuggestions.reasoning,
                })
              }

              const cleanedText = removeSearchTermsJson(fullText)
              dataStream.writeData({
                type: "cleaned-text",
                text: cleanedText,
                messageId: Date.now().toString(),
              })

              if (usage) {
                dataStream.writeData({
                  type: "usage",
                  usage: {
                    promptTokens: usage.promptTokens,
                    completionTokens: usage.completionTokens,
                    totalTokens: usage.totalTokens,
                    finishReason: finishReason || "unknown",
                  },
                })
              }
              if (reasoning) {
                console.log("Gemini reasoning:", reasoning)
              }
              dataStream.writeData({
                type: "model-config",
                config: modelConfig,
              } as unknown as JSONValue)

              dataStream.writeData({
                type: "selected-model",
                model: selectedModel,
              } as unknown as JSONValue)

              dataStream.writeData({
                type: "reasoning-type",
                reasoning: reasoningType,
              } as unknown as JSONValue)

            } catch (error) {
              console.error("Error processing metadata in onFinish:", error)
            }
          },
        })

        result.mergeIntoDataStream(dataStream)
      },
      onError: (error) => {
        console.error("Error in Google stream:", error)
        return error instanceof Error ? error.message : String(error)
      },
    })
  } catch (error) {
    console.error("Error in Google chat API:", error)
    return new Response(JSON.stringify({ error: "Failed to process Google chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
