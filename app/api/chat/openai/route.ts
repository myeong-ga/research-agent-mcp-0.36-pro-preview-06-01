import { openai } from "@ai-sdk/openai"
import { createDataStreamResponse, type JSONValue, streamText } from "ai"
import type { NextRequest } from "next/server"
import { OPENAI_SEARCH_SUGGESTIONS_PROMPT } from "@/lib/system-prompt"
import type { ModelMessage, ModelConfig } from "@/lib/types"
import { DEFAULT_MODEL_CONFIG } from "@/lib/models"

export const runtime = "nodejs"
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: "Invalid request body. Expected messages array." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    let selectedModel = "gpt-4.1-mini"

    if (body.model && typeof body.model === "string") {
      selectedModel = body.model
    } else {
      const modelCookie = req.cookies.get("selectedOpenAIModel")
      if (modelCookie) {
        selectedModel = modelCookie.value
      }
    }

    const modelConfig: ModelConfig = body.modelConfig || DEFAULT_MODEL_CONFIG
    const reasoningType = body.reasoningType || "Reasoning"

    const validatedMessages = validateMessages(body.messages)

    return createDataStreamResponse({
      execute: async (dataStream) => {
          console.log("Starting OpenAI stream execution with model:", selectedModel, "reasoningType:", reasoningType)

        let fullText = ""
        const streamOptions = {
          model: openai.responses(selectedModel),
          messages: validatedMessages,
          system: OPENAI_SEARCH_SUGGESTIONS_PROMPT,
          temperature: modelConfig.temperature,
          topP: modelConfig.topP,
          maxTokens: modelConfig.maxTokens,
          maxSteps: 5,
          // @ts-expect-error
          onChunk: ({ chunk }) => {
            if (chunk.type === "text-delta") {
              fullText += chunk.textDelta
              dataStream.writeData({ type: "text-delta", text: chunk.textDelta })
            } else  { //if (chunk.type === 'reasoning') {
              process.stdout.write('\x1b[34m' + chunk.textDelta + '\x1b[0m');
            } 
          },
          // @ts-expect-error
          onFinish: ({ reasoning, sources, usage, finishReason }) => {
            if (sources && sources.length > 0) {
              const formattedSources = sources
                // @ts-expect-error
                .filter((source) => source.sourceType === "url")
                // @ts-expect-error
                .map((source) => ({
                  url: source.url,
                  title: source.title || new URL(source.url).hostname,
                }))

              if (formattedSources.length > 0) {
                dataStream.writeData({ type: "sources", sources: formattedSources })
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
                  prompt_tokens: usage.promptTokens,
                  completion_tokens: usage.completionTokens,
                  total_tokens: usage.totalTokens,
                  finishReason: finishReason || "unknown",
                },
              })
            }
            if (reasoning) {
              console.log("OpenAI reasoning:", reasoning)
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
          },
        }

        if (reasoningType === "Intelligence") {
          Object.assign(streamOptions, {
            tools: {
              web_search_preview: openai.tools.webSearchPreview({
                searchContextSize: "medium",
              }),
            },
            toolChoice: { type: "tool", toolName: "web_search_preview" },
          })
        }

        if (reasoningType === "Thinking") {
          Object.assign(streamOptions, {
            providerOptions: {
              openai: { reasoningEffort: 'low' }, // This parameter can be set to `'low'`, `'medium'`, or `'high'` to adjust how much time and computation the model spends on internal reasoning before producing a response.
              reasoningSummary: "auto",
            },
          })
        }

        const result = streamText(streamOptions)

        result.mergeIntoDataStream(dataStream)
      },
      onError: (error) => {
        console.error("Error in OpenAI stream:", error)
        return error instanceof Error ? error.message : String(error)
      },
    })
  } catch (error) {
    console.error("Error in OpenAI chat API:", error)
    return new Response(JSON.stringify({ error: "Failed to process OpenAI chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
