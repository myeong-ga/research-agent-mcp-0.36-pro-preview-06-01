"use client"

import React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, StopCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { SourcesList } from "@/components/sources-list"
import { SearchSuggestions } from "@/components/search-suggestions"
import { ProviderSelector } from "@/components/provider-selector"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { ProviderType, Message } from "@/lib/types"
import { useAgentResearchContext } from "@/contexts/agent-research-context"
import { LikeButton } from "@/components/like-button"
import { ChatMessageSingle } from "./chat-message-single"
import { ModelConfigDialog } from "./model-config-dialog"
import { AgentModelSelector } from "./agent-model-selector"
import { ModelConfigDisplay } from "./model-config-display"
import { ThinkingStickerAnimated } from "./thinking-sticker-animated"
import { useResearchAgent } from "@/hooks/research/agent/research/use-research-agent"

interface ResearchAgentResearchProps {
  initialProviderId?: ProviderType
}

export function ResearchAgentResearch({ initialProviderId = "gemini" }: ResearchAgentResearchProps) {
  const [input, setInput] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [providerId, setProviderId] = useState<ProviderType>(initialProviderId)
  const { providers, updateSelectedAgentModel } = useAgentResearchContext()
  const research = useResearchAgent()

  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const provider = providers.find((p) => p.id === providerId)

  useEffect(() => {
    const defaultModel =
      providers.find((p) => p.id === initialProviderId)!.models.find((m) => m.isDefault) ||
      providers.find((p) => p.id === initialProviderId)!.models[0]
    updateSelectedAgentModel("research", initialProviderId, defaultModel.id)
  }, [initialProviderId])

  const isLoading = isActive && (research.status === "streaming" || research.status === "submitted")

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSearchSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const toggleActive = () => {
    setIsActive((prev) => !prev)
  }

  const handleProviderChange = (newProviderId: ProviderType) => {
    if (isLoading) {
      research.stop()
    }
    setProviderId(newProviderId)

    const provider = providers.find((p) => p.id === newProviderId)
    if (provider && provider.models.length > 0) {
      const defaultModel = provider.models.find((m) => m.isDefault) || provider.models[0]
      updateSelectedAgentModel("research", newProviderId, defaultModel.id)
    }
  }

  const handleModelChange = (modelId: string) => {
    updateSelectedAgentModel("research", providerId, modelId)
  }

  const handleConfigChange = (config: any, showToast = false) => {
    if (research.updateModelConfig) {
      research.updateModelConfig(config, showToast)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!input.trim() || !isActive) return

    await research.sendMessage(input)
    setInput("")
  }

  const stopGenerating = () => {
    if (isActive && (research.status === "streaming" || research.status === "submitted")) {
      research.stop()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      formRef.current?.requestSubmit()
    }
  }

  const messages_length = research.messages ? research.messages.length : 0

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] mx-auto">
      <div className="flex-1">
        <Card className={`h-full flex flex-col ${!isActive ? "opacity-50" : ""}`}>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">{provider?.name || providerId}</CardTitle>
                <ThinkingStickerAnimated />
                <LikeButton initialCount={Math.floor(Math.random() * 200) + 100} />
              </div>
              <div className="flex items-center space-x-2">
                {research.modelConfig && (
                  <div className="flex items-center gap-1">
                    <ModelConfigDisplay config={research.modelConfig} />
                    <ModelConfigDialog
                      config={research.modelConfig}
                      onConfigChange={handleConfigChange}
                      disabled={isLoading}
                    />
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => research.resetAgent()}
                  disabled={!isActive || research.status === "streaming" || research.status === "submitted"}
                  className="mr-2"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  New Chat
                </Button>
                <Switch
                  id="provider-active"
                  checked={isActive}
                  onCheckedChange={toggleActive}
                  disabled={research.status === "streaming" || research.status === "submitted"}
                />
                <Label htmlFor="provider-active">Active</Label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ProviderSelector
                selectedProvider={providerId}
                onProviderChange={handleProviderChange}
                disabled={research.status === "streaming" || research.status === "submitted"}
              />
              <AgentModelSelector
                agentType="research"
                providerId={providerId}
                disabled={research.status === "streaming" || research.status === "submitted"}
                onModelChange={handleModelChange}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto h-[calc(100vh-16rem)] max-h-[calc(100vh-19rem)]">
            <div className="relative space-y-4">
               <div className="">
                {research.messages.map((message: Message, index) => (
                  <ChatMessageSingle
                    key={message.id}
                    message={message}
                    status={research.status}
                    isLast={index === messages_length - 1}
                    className="rounded-3xl m-1 font-mono"
                    useMarkdown={true}
                  />
                ))}
              </div>

              {research.sources && research.sources.length > 0 && research.status === "ready" && (
                <SourcesList sources={research.sources} />
              )}
              {research.searchSuggestions && research.searchSuggestions.length > 0 && research.status === "ready" && (
                <SearchSuggestions
                  suggestions={research.searchSuggestions}
                  reasoning={research.searchSuggestionsReasoning}
                  confidence={research.searchSuggestionsConfidence}
                  onSuggestionClick={handleSearchSuggestionClick}
                />
              )}

             
            </div>
          </CardContent>
        </Card>
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
                <Button type="submit" size="icon" disabled={!input.trim() || !isActive} className="h-8 w-8">
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
