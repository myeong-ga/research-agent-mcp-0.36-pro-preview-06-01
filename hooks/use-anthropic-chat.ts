"use client"

import { useState, useEffect, useCallback } from "react"
import type { CreateMessage, Message } from "@ai-sdk/react"
import type { Source, ChatStatus, TokenUsage, ModelConfig } from "@/lib/types"
import { nanoid } from "@/lib/nanoid"
import { useLlmProvider } from "@/contexts/llm-provider-context"
import type { SearchSuggestion } from "@/lib/types"
import { getDefaultModelConfig } from "@/lib/models"
import { toast } from "sonner"

export function useAnthropicChat() {
  const { getSelectedModel ,getReasoningType} = useLlmProvider()
  const [messages, setMessages] = useState<Message[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([])
  const [searchSuggestionsReasoning, setSearchSuggestionsReasoning] = useState<string>("")
  const [searchSuggestionsConfidence, setSearchSuggestionsConfidence] = useState<number | null>(null)
  const [status, setStatus] = useState<ChatStatus>("ready")
  const [error, setError] = useState<string | null>(null)
  const [controller, setController] = useState<AbortController | null>(null)
  const [chatId, setChatId] = useState<string>(() => nanoid())
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null)
  const [modelConfig, setModelConfig] = useState<ModelConfig>(() => {
    const selectedModelId = getSelectedModel("anthropic")
    return getDefaultModelConfig(selectedModelId).config
  })
  const [responseModelConfig, setResponseModelConfig] = useState<ModelConfig | null>(null) // 마지막 응답에서 확인할 수 있는 model config , chatting 창 message display 와 함께 사용된다
  const [responseSelectModel, setResponseSelectModel] = useState<string | null>(null) // 마지막 응답에서 확인할 수 있는 model config , chatting 창 message display 와 함께 사용된다
  const [responseReasoningType, setResponseReasoningType] = useState<string | null>(null) // 마지막 응답에서 확인할 수 있는 model config , chatting 창 message display 와 함께 사용된다

  const selectedModelId = getSelectedModel("anthropic")
  const reasoningType = getReasoningType("anthropic", selectedModelId)

  // Update model config when selected model changes
  useEffect(() => {
    const selectedModelId = getSelectedModel("anthropic")
    const defaultConfig = getDefaultModelConfig(selectedModelId).config
    setModelConfig(defaultConfig)
  }, [getSelectedModel])

  useEffect(() => {
    if (error && messages.length > 0) {
      setError(null)
    }
  }, [messages, error])

  useEffect(() => {
    return () => {
      if (controller) {
        controller.abort()
      }
    }
  }, [controller])

  const updateModelConfig = useCallback((config: Partial<ModelConfig>, showToast = false) => {
    setModelConfig((prevConfig) => {
      const newConfig = {
        ...prevConfig,
        ...config,
      }

      if (showToast) {
        toast.success("Model configuration updated", {
          description: `Temperature: ${newConfig.temperature.toFixed(2)}, Max Tokens: ${newConfig.maxTokens}`,
          duration: 3000,
        })
      }

      return newConfig
    })
  }, [])

  const stop = useCallback(() => {
    if (controller) {
      controller.abort()
      setController(null)
      setStatus("ready")
    }
  }, [controller])

  const resetChat = useCallback(() => {
    stop()
    setMessages([])
    setSources([])
    setSearchSuggestions([])
    setSearchSuggestionsReasoning("")
    setSearchSuggestionsConfidence(null)
    setTokenUsage(null)
    setResponseModelConfig(null)
    setError(null)
    setChatId(nanoid())

    // Reset model config to default
    const selectedModelId = getSelectedModel("anthropic")
    setModelConfig(getDefaultModelConfig(selectedModelId).config)
  }, [stop, getSelectedModel])

  const sendMessage = async (message: string | CreateMessage) => {
    try {
      if (controller) {
        controller.abort()
      }

      setSources([])
      setSearchSuggestions([])
      setSearchSuggestionsReasoning("")
      setSearchSuggestionsConfidence(null)
      setTokenUsage(null)
      setResponseModelConfig(null)
      setError(null)

      const newController = new AbortController()
      setController(newController)

      const userMessage: Message =
        typeof message === "string" ? { id: nanoid(), role: "user", content: message } : { id: nanoid(), ...message }

      setStatus("submitted")
      setMessages((prevMessages) => [...prevMessages, userMessage])

      const response = await fetch("/api/chat/anthropic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: selectedModelId,
          chatId,
          modelConfig,
          reasoningType
        }),
        signal: newController.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error("Response body is null")
      }

      setStatus("streaming")

      const assistantMessageId = nanoid()
      setMessages((prevMessages) => [...prevMessages, { id: assistantMessageId, role: "assistant", content: "" }])

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ""

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.substring(6))

                if (data.type === "text-delta") {
                  accumulatedText += data.text

                  setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                      msg.id === assistantMessageId ? { ...msg, content: accumulatedText } : msg,
                    ),
                  )
                } else if (data.type === "sources" && Array.isArray(data.sources)) {
                  setSources(data.sources)
                } else if (data.type === "searchSuggestions") {
                  if (data.searchSuggestions && Array.isArray(data.searchSuggestions)) {
                    const suggestions = data.searchSuggestions.map((term: string) => ({ term }))
                    setSearchSuggestions(suggestions)
                  }

                  if (data.confidence && typeof data.confidence === "number") {
                    setSearchSuggestionsConfidence(data.confidence)
                  }

                  if (data.reasoning && typeof data.reasoning === "string") {
                    setSearchSuggestionsReasoning(data.reasoning)
                  }
                } else if (data.type === "model-config" && typeof data.config === "object") {
                  // Handle model config response from server
                  const config = data.config as ModelConfig
                    setResponseModelConfig(config)
                } else if (data.type === "selected-model" && typeof data.model === "string") {
                  
                    const responseModel = data.model as unknown as string
                  
                    setResponseSelectModel(responseModel)
                    
                } else if (data.type === "reasoning-type" && typeof data.reasoning === "string") {
                  
                    const responseReasoning = data.reasoning as string
                  
                    setResponseReasoningType(responseReasoning)
                    
                } else if (data.type === "cleaned-text" && "text" in data && typeof data.text === "string") {
                  setMessages((prevMessages) => {
                    const newMessages = [...prevMessages]
                    for (let i = newMessages.length - 1; i >= 0; i--) {
                      if (newMessages[i].role === "assistant") {
                        newMessages[i] = {
                          ...newMessages[i],
                          content: data.text as string,
                        }
                        break
                      }
                    }
                    return newMessages
                  })
                } else if (data.type === "usage" && typeof data.usage === "object") {
                  const usage = data.usage
                  setTokenUsage((prev) =>
                    prev
                      ? {
                          ...prev,
                          promptTokens: usage.input_tokens || 0,
                          completionTokens: usage.output_tokens || 0,
                          totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
                        }
                      : {
                          promptTokens: usage.input_tokens || 0,
                          completionTokens: usage.output_tokens || 0,
                          totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
                          finishReason: "unknown",
                        },
                  )
                } else if (data.type === "stop_reason") {
                  setTokenUsage((prev) =>
                    prev
                      ? {
                          ...prev,
                          finishReason: data.stop_reason,
                        }
                      : {
                          promptTokens: 0,
                          completionTokens: 0,
                          totalTokens: 0,
                          finishReason: data.stop_reason,
                        },
                  )
                } else if (data.type === "error") {
                  setError(data.error)
                  setStatus("error")
                }
              } catch (e) {
                console.error("Error parsing SSE data:", e)
              }
            }
          }
        }
        setStatus("ready")
      } catch (err) {
        console.error("Error reading stream:", err)
        setError("Error reading response stream")
        setStatus("error")
      } finally {
        setController(null)
        if (status !== "error") {
          setStatus("ready")
        }
      }
    } catch (err) {
      console.error("Error sending message:", err)
      setController(null)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      setStatus("error")
    }
  }

  return {
    messages,
    status,
    error,
    stop,
    sources,
    searchSuggestions,
    searchSuggestionsReasoning,
    searchSuggestionsConfidence,
    sendMessage,
    chatId,
    resetChat,
    tokenUsage,
    modelConfig,
    responseModelConfig,
    responseSelectModel,
    responseReasoningType,
    updateModelConfig,
  }
}
