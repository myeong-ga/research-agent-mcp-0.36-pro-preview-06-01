
// This file is deprecated and will be removed in the future.

"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { type CreateMessage, type Message, useChat } from "@ai-sdk/react"
import type { Source } from "@/lib/types"
import { nanoid } from "@/lib/nanoid"

export interface SearchSuggestion {
  term: string
  confidence?: number
  reasoning?: string
}

export function useComparisonChat() {
  const [sharedInput, setSharedInput] = useState("")
  const [googleSources, setGoogleSources] = useState<Source[]>([])
  const [openaiSources, setOpenaiSources] = useState<Source[]>([])
  const [googleSearchSuggestions, setGoogleSearchSuggestions] = useState<SearchSuggestion[]>([])
  const [searchSuggestionsReasoning, setSearchSuggestionsReasoning] = useState<string>("")
  const [searchSuggestionsConfidence, setSearchSuggestionsConfidence] = useState<number | null>(null)

  const [isGoogleActive, setIsGoogleActive] = useState(true)
  const [isOpenAIActive, setIsOpenAIActive] = useState(true)

  const {
    messages: googleMessages,
    isLoading: isGoogleLoading,
    stop: stopGoogle,
    data: googleData,
    append: appendGoogle,
    setMessages: setGoogleMessages,
  } = useChat({
    api: "/api/chat/google",
    id: "google-search-chat",
    generateId: nanoid,
    experimental_throttle: 50,
  })

  const {
    messages: openaiMessages,
    isLoading: isOpenAILoading,
    stop: stopOpenAI,
    data: openaiData,
    append: appendOpenAI,
  } = useChat({
    api: "/api/chat/openai",
    id: "openai-search-chat",
    generateId: nanoid,
    experimental_throttle: 50,
  })

  useEffect(() => {
    if (googleData && Array.isArray(googleData)) {
      for (const item of googleData) {
        if (item && typeof item === "object" && "type" in item) {
          if (item.type === "sources" && "sources" in item && Array.isArray(item.sources)) {
            setGoogleSources(item.sources as Source[])
          }

          if (item.type === "searchSuggestions") {
            if ("searchSuggestions" in item && Array.isArray(item.searchSuggestions)) {
              const suggestions = item.searchSuggestions.map((term) => ({ term }))
              setGoogleSearchSuggestions(suggestions as SearchSuggestion[])

              if ("confidence" in item && typeof item.confidence === "number") {
                setSearchSuggestionsConfidence(item.confidence)
              }

              if ("reasoning" in item && typeof item.reasoning === "string") {
                setSearchSuggestionsReasoning(item.reasoning)
              }
            }
          }

          if (item.type === "cleaned-text" && "text" in item && typeof item.text === "string") {
            setGoogleMessages((prevMessages) => {
              const newMessages = [...prevMessages]
              for (let i = newMessages.length - 1; i >= 0; i--) {
                if (newMessages[i].role === "assistant") {
                  newMessages[i] = {
                    ...newMessages[i],
                    content: item.text as string,
                  }
                  break
                }
              }
              return newMessages
            })
          }
        }
      }
    }
  }, [googleData, setGoogleMessages])

  useEffect(() => {
    if (openaiData && Array.isArray(openaiData)) {
      for (const item of openaiData) {
        if (item && typeof item === "object" && "type" in item && item.type === "sources") {
          if ("sources" in item && Array.isArray(item.sources)) {
            setOpenaiSources(item.sources as Source[])
            return
          }
        }
      }
    }
  }, [openaiData])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSharedInput(e.target.value)
  }, [])

  const handleSearchSuggestionClick = useCallback((suggestion: string) => {
    setSharedInput(suggestion)
  }, [])

  const toggleGoogleActive = useCallback(() => {
    setIsGoogleActive((prev) => !prev)
  }, [])

  const toggleOpenAIActive = useCallback(() => {
    setIsOpenAIActive((prev) => !prev)
  }, [])

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()

      if (!sharedInput.trim()) return
      if (!isGoogleActive && !isOpenAIActive) return

      setGoogleSources([])
      setOpenaiSources([])
      setGoogleSearchSuggestions([])
      setSearchSuggestionsReasoning("")
      setSearchSuggestionsConfidence(null)

      const userMessage = { role: "user", content: sharedInput } as Message | CreateMessage

      const appendPromises = []
      if (isGoogleActive) {
        appendPromises.push(appendGoogle(userMessage))
      }
      if (isOpenAIActive) {
        appendPromises.push(appendOpenAI(userMessage))
      }

      await Promise.all(appendPromises)
      setSharedInput("")
    },
    [sharedInput, isGoogleActive, isOpenAIActive, appendGoogle, appendOpenAI],
  )

  const stopGenerating = useCallback(() => {
    if (isGoogleActive && isGoogleLoading) {
      stopGoogle()
    }
    if (isOpenAIActive && isOpenAILoading) {
      stopOpenAI()
    }
  }, [isGoogleActive, isOpenAIActive, isGoogleLoading, isOpenAILoading, stopGoogle, stopOpenAI])

  return {
    googleMessages,
    openaiMessages,
    googleSources,
    openaiSources,
    googleSearchSuggestions,
    searchSuggestionsReasoning,
    searchSuggestionsConfidence,
    isGoogleLoading,
    isOpenAILoading,
    isGoogleActive,
    isOpenAIActive,
    toggleGoogleActive,
    toggleOpenAIActive,
    input: sharedInput,
    handleInputChange,
    handleSearchSuggestionClick,
    handleSubmit,
    stopGenerating,
  }
}
