"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type {
  Message,
  Source,
  TokenUsage,
  ModelConfig,
  AgentStatus,
  SearchSuggestion,
  ProviderType,
  ReasoningType,
  ResearchAgentInterface,
} from "@/lib/types"
import { nanoid } from "@/lib/nanoid"
import { useAgentResearchContext } from "@/contexts/agent-research-context"
import { getDefaultModelConfig } from "@/lib/models"
import { toast } from "sonner"

interface OpenAIThinkingBuffer {
  summaryIndex: number
  content: string
}

export function useResearchAgent(): ResearchAgentInterface {
  const {getSelectedProvider, getSelectedAgentModel, getReasoningType } = useAgentResearchContext()
  const [sources, setSources] = useState<Source[]>([])
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([])
  const [searchSuggestionsReasoning, setSearchSuggestionsReasoning] = useState<string>("")
  const [searchSuggestionsConfidence, setSearchSuggestionsConfidence] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string>(() => nanoid())
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null)
  const [status, setStatus] = useState<AgentStatus>("ready")
  const [error, setError] = useState<string | null>(null)
  const [controller, setController] = useState<AbortController | null>(null)
  const [responseModelConfig, setResponseModelConfig] = useState<ModelConfig | null>(null)
  const [responseSelectModel, setResponseSelectModel] = useState<string | null>(null)
  const [responseSelectProvider, setResponseSelectProvider] = useState<ProviderType | null>(null)
  const [responseReasoningType, setResponseReasoningType] = useState<ReasoningType>(undefined)
  const openaiThinkingBufferRef = useRef<Map<number, OpenAIThinkingBuffer>>(new Map())
  const currentThinkingMessageIdRef = useRef<string | null>(null)

  const selectedProviderId = getSelectedProvider("research")
  const selectedModelId = selectedProviderId ? getSelectedAgentModel("research", selectedProviderId) : null
  const reasoningType =
    selectedProviderId && selectedModelId ? getReasoningType(selectedProviderId, selectedModelId) : undefined

  const [modelConfig, setModelConfig] = useState<ModelConfig>(() => {
    if (selectedProviderId && selectedModelId) {
      return getDefaultModelConfig(selectedModelId).config
    }
    return {
      temperature: 0.2,
      topP: 0.8,
      maxTokens: 4000,
    }
  })

  useEffect(() => {
    if (selectedProviderId && selectedModelId) {
      const defaultConfig = getDefaultModelConfig(selectedModelId).config
      setModelConfig(defaultConfig)
    }
  }, [selectedProviderId, selectedModelId])

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

  const resetAgent = useCallback(() => {
    stop()
    setMessages([])
    setSources([])
    setSearchSuggestions([])
    setSearchSuggestionsReasoning("")
    setSearchSuggestionsConfidence(null)
    setTokenUsage(null)
    setResponseModelConfig(null)
    setResponseSelectModel(null)
    setResponseSelectProvider(null)
    setError(null)
    setSessionId(nanoid())
    openaiThinkingBufferRef.current.clear()
    currentThinkingMessageIdRef.current = null

    if (selectedProviderId && selectedModelId) {
      setModelConfig(getDefaultModelConfig(selectedModelId).config)
    }
  }, [stop, selectedProviderId, selectedModelId])

  const sendMessage = async (message: string) => {
  
    try {
      if (controller) {
        controller.abort()
      }

      if (!selectedProviderId) {
        console.error("No provider useResearchHook")
        setError("No provider selected")
        return
      }

      setSources([])
      setSearchSuggestions([])
      setSearchSuggestionsReasoning("")
      setSearchSuggestionsConfidence(null)
      setTokenUsage(null)
      setResponseModelConfig(null)
      setResponseSelectModel(null)
      setResponseSelectProvider(null)
      setError(null)
      openaiThinkingBufferRef.current.clear()
      currentThinkingMessageIdRef.current = null

      const newController = new AbortController()
      setController(newController)

      const userMessage: Message = {
        id: nanoid(),
        role: "user",
        content: message,
      }
      
      // setOptimisticMessages([userMessage])
      // optimisticMessageIdRef.current = userMessage.id

      setStatus("submitted")


      setMessages((prevMessages) => [...prevMessages, userMessage])
      const filteredMessages = messages.filter((msg) => msg.role !== "thinking")
      const apiEndpoint = `/api/research/agent/research/${selectedProviderId}`
      console.log("useResearchHook apiEndpoint:", apiEndpoint)
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...filteredMessages, userMessage],
          model: selectedModelId,
          sessionId,
          modelConfig,
          reasoningType,
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
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: assistantMessageId, role: "assistant", content: "", provider: selectedProviderId },
      ])
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
                } else if (data.type === "thinking-delta") {
                  if (selectedProviderId === "openai") {
                    const summaryIndex = data.summary_index || 0
                    const existingBuffer = openaiThinkingBufferRef.current.get(summaryIndex)

                    if (existingBuffer) {
                      existingBuffer.content += data.thinking || ""
                    } else {
                      openaiThinkingBufferRef.current.set(summaryIndex, {
                        summaryIndex,
                        content: data.thinking || "",
                      })
                    }
                  } else {
                    if (!currentThinkingMessageIdRef.current) {
                      const thinkingMessageId = nanoid()
                      currentThinkingMessageIdRef.current = thinkingMessageId

                      setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                          id: thinkingMessageId,
                          role: "thinking",
                          content: data.thinking || "",
                          provider: selectedProviderId,
                        },
                      ])
                    } else {
                      setMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                          msg.id === currentThinkingMessageIdRef.current
                            ? { ...msg, content: msg.content + (data.thinking || "") }
                            : msg,
                        ),
                      )
                    }
                  }
                } else if (data.type === "openai-thinking-done") {
                  const summaryIndex = data.summary_index || 0
                  const buffer = openaiThinkingBufferRef.current.get(summaryIndex)

                  if (buffer) {
                    const thinkingMessageId = nanoid()
                    setMessages((prevMessages) => [
                      ...prevMessages,
                        {
                        id: thinkingMessageId,
                        role: "thinking",
                        content: buffer.content,
                        provider: selectedProviderId,
                      },
                    ])
                    openaiThinkingBufferRef.current.delete(summaryIndex)
                  }
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
                } else if (data.type === "selected-model" && typeof data.model === "string") {
                  setResponseSelectModel(data.model)
                } else if (data.type === "selected-provider" && typeof data.provider === "string") {
                  setResponseSelectProvider(data.provider as ProviderType)
                } else if (data.type === "reasoning-type" && typeof data.reasoning === "string") {
                  setResponseReasoningType(data.reasoning as ReasoningType)
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
        currentThinkingMessageIdRef.current = null
      } catch (err) {
        //if (err.name !== "AbortError") {
          console.error("Error reading stream:", err)
          setError("Error reading response stream")
          setStatus("error")
       // }
      } finally {
        setController(null)
        if (status !== "error") {
          setStatus("ready")
        }
      }
    } catch (err) {
    //   if (err.name !== "AbortError") {
        console.error("Error sending message:", err)
        setController(null)
        setError(err instanceof Error ? err.message : "Unknown error occurred")
        setStatus("error")
      //}
    }
  }

  // const combinedMessages = [
  //   ...optimisticMessages,
  //   ...messages.filter((msg) => !optimisticMessages.some((optMsg) => optMsg.id === msg.id)),
  // ]

  return {
    messages, //: combinedMessages,
    status,
    stop,
    sources,
    sendMessage,
    searchSuggestions,
    searchSuggestionsReasoning,
    searchSuggestionsConfidence,
    sessionId,
    resetAgent,
    modelConfig,
    responseSelectModel,
    responseSelectProvider,
    responseReasoningType,
    updateModelConfig,
  }
}
