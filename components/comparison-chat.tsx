"use client"

import type React from "react"
import { useRef, useState } from "react"
import { ComparisonView } from "@/components/comparison-view"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, StopCircle } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useGeminiChat } from "@/hooks/use-gemini-chat"
import { useOpenAIChat } from "@/hooks/use-openai-chat"
import { useAnthropicChat } from "@/hooks/use-anthropic-chat"
import type { ProviderType, ChatInterface } from "@/lib/types"
import { useLlmProvider } from "@/contexts/llm-provider-context"
import { MobileComparisonView } from "./mobile-comparison-view"

interface ComparisonChatProps {
  selectedProviders: ProviderType[]
}

export function ComparisonChat({ selectedProviders }: ComparisonChatProps) {
  const [input, setInput] = useState("")
  const [isFirstProviderActive, setIsFirstProviderActive] = useState(true)
  const [isSecondProviderActive, setIsSecondProviderActive] = useState(true)

  const { providers } = useLlmProvider()
  const geminiChat = useGeminiChat()
  const openaiChat = useOpenAIChat()
  const anthropicChat = useAnthropicChat()

  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const firstProvider = selectedProviders[0]
  const secondProvider = selectedProviders[1]

  const getProviderName = (providerId: ProviderType) => {
    const provider = providers.find((p) => p.id === providerId)
    return provider ? provider.name : providerId
  }

  const firstProviderName = getProviderName(firstProvider)
  const secondProviderName = getProviderName(secondProvider)

  const getProviderChat = (providerId: ProviderType): ChatInterface | null => {
    switch (providerId) {
      case "gemini":
        return geminiChat
      case "openai":
        return openaiChat
      case "anthropic":
        return anthropicChat
      default:
        return null
    }
  }

  const firstProviderChat = getProviderChat(firstProvider)
  const secondProviderChat = getProviderChat(secondProvider)

  const isLoading =
    (isFirstProviderActive && firstProviderChat?.status === "streaming") ||
    firstProviderChat?.status === "submitted" ||
    (isSecondProviderActive && secondProviderChat?.status === "streaming") ||
    secondProviderChat?.status === "submitted"

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSearchSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const toggleFirstProviderActive = () => {
    setIsFirstProviderActive((prev) => !prev)
  }

  const toggleSecondProviderActive = () => {
    setIsSecondProviderActive((prev) => !prev)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!input.trim()) return
    if (!isFirstProviderActive && !isSecondProviderActive) return

    const promises = []
    if (isFirstProviderActive && firstProviderChat?.sendMessage) {
      promises.push(firstProviderChat.sendMessage(input))
    }
    if (isSecondProviderActive && secondProviderChat?.sendMessage) {
      promises.push(secondProviderChat.sendMessage(input))
    }

    await Promise.all(promises)
    setInput("")
  }

  const stopGenerating = () => {
    if (
      isFirstProviderActive &&
      (firstProviderChat?.status === "streaming" || firstProviderChat?.status === "submitted") &&
      firstProviderChat?.stop
    ) {
      firstProviderChat.stop()
    }
    if (
      isSecondProviderActive &&
      (secondProviderChat?.status === "streaming" || secondProviderChat?.status === "submitted") &&
      secondProviderChat?.stop
    ) {
      secondProviderChat.stop()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      formRef.current?.requestSubmit()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] mx-auto">
      <div className="flex-1">
        <div className="space-y-4 h-full">
          {isMobile ? (
            <MobileComparisonView
              firstProvider={{
                id: firstProvider,
                name: firstProviderName,
                chat: firstProviderChat,
                isActive: isFirstProviderActive,
                toggleActive: toggleFirstProviderActive,
              }}
              secondProvider={{
                id: secondProvider,
                name: secondProviderName,
                chat: secondProviderChat,
                isActive: isSecondProviderActive,
                toggleActive: toggleSecondProviderActive,
              }}
              onSearchSuggestionClick={handleSearchSuggestionClick}
            />
          ) : (
            <ComparisonView
              firstProvider={{
                id: firstProvider,
                name: firstProviderName,
                chat: firstProviderChat,
                isActive: isFirstProviderActive,
                toggleActive: toggleFirstProviderActive,
              }}
              secondProvider={{
                id: secondProvider,
                name: secondProviderName,
                chat: secondProviderChat,
                isActive: isSecondProviderActive,
                toggleActive: toggleSecondProviderActive,
              }}
              onSearchSuggestionClick={handleSearchSuggestionClick}
            />
          )}
        </div>
      </div>

      <div className="p-4 w-full">
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-2 w-full items-center">
          <div className="relative w-full max-w-[768px] mx-auto"> 
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="min-h-24 resize-none pr-20"
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2">
              {isLoading ? (
                <Button type="button" size="icon" variant="ghost" onClick={stopGenerating} className="h-8 w-8">
                  <StopCircle className="h-4 w-4" />
                  <span className="sr-only">Stop generating</span>
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || (!isFirstProviderActive && !isSecondProviderActive)}
                  className="h-8 w-8"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              )}
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-right w-full max-w-[768px]">
            Press <kbd className="rounded border px-1 py-0.5 bg-muted">Ctrl</kbd> +{" "}
            <kbd className="rounded border px-1 py-0.5 bg-muted">Enter</kbd> to send
          </div>
        </form>
      </div>
    </div>
  )
}
