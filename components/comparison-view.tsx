"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatMessage } from "@/components/chat-message"
import { SourcesList } from "@/components/sources-list"
import { SearchSuggestions } from "@/components/search-suggestions"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { ProviderType, ChatInterface, ModelConfig } from "@/lib/types"
import { ModelSelector } from "@/components/model-selector"
import { LikeButton } from "@/components/like-button"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import type { Message } from "ai"
import { TokenUsageDisplay } from "@/components/token-usage-display"
import { ModelConfigDisplay } from "./model-config-display"
import { ModelConfigBlock } from "./model-config-block"
import { useLlmProvider } from "@/contexts/llm-provider-context"
import { ModelConfigDialog } from "./model-config-dialog"

interface ProviderProps {
  id: ProviderType
  name: string
  chat: ChatInterface | null
  isActive: boolean
  toggleActive: () => void
}

interface ComparisonViewProps {
  firstProvider: ProviderProps
  secondProvider: ProviderProps
  onSearchSuggestionClick: (suggestion: string) => void
}

export function ComparisonView({ firstProvider, secondProvider, onSearchSuggestionClick }: ComparisonViewProps) {
  const { providers } = useLlmProvider()
  const firstProvider_messages_length = firstProvider.chat?.messages ? firstProvider.chat.messages.length : 0
  const secondProvider_messages_length = secondProvider.chat?.messages ? secondProvider.chat.messages.length : 0

  const handleFirstProviderConfigChange = (config: ModelConfig, showToast = false) => {
    if (firstProvider.chat?.updateModelConfig) {
      firstProvider.chat.updateModelConfig(config, showToast)
    }
  }

  const handleSecondProviderConfigChange = (config: ModelConfig, showToast = false) => {
    if (secondProvider.chat?.updateModelConfig) {
      secondProvider.chat.updateModelConfig(config, showToast)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      <Card className={`h-full flex flex-col ${!firstProvider.isActive ? "opacity-50" : ""}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{firstProvider.name}</CardTitle>
              <LikeButton initialCount={Math.floor(Math.random() * 200) + 100} />
            </div>
            <div className="flex items-center space-x-2">
              {firstProvider.chat?.modelConfig && (
                <div className="flex items-center gap-1">
                  <ModelConfigDisplay config={firstProvider.chat.modelConfig} />
                  <ModelConfigDialog
                    config={firstProvider.chat.modelConfig}
                    onConfigChange={handleFirstProviderConfigChange}
                    disabled={
                      !firstProvider.isActive ||
                      firstProvider.chat?.status === "streaming" ||
                      firstProvider.chat?.status === "submitted"
                    }
                  />
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => firstProvider.chat?.resetChat()}
                disabled={
                  !firstProvider.isActive ||
                  firstProvider.chat?.status === "streaming" ||
                  firstProvider.chat?.status === "submitted"
                }
                className="mr-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                New Chat
              </Button>
              <Switch
                id="first-provider-active"
                checked={firstProvider.isActive}
                onCheckedChange={firstProvider.toggleActive}
                disabled={firstProvider.chat?.status === "streaming" || firstProvider.chat?.status === "submitted"}
              />
              <Label htmlFor="first-provider-active">Active</Label>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <ModelSelector
              providerId={firstProvider.id}
              disabled={firstProvider.chat?.status === "streaming" || firstProvider.chat?.status === "submitted"}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto h-[calc(100vh-16rem)] max-h-[calc(100vh-24rem)]">
          <div className="space-y-4">
            <div className="flex flex-col">
              {firstProvider.chat?.messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  status={firstProvider.chat?.status}
                  isLast={index === firstProvider_messages_length - 1}
                  className="hover:bg-muted/20 transition-colors"
                />
              ))}
            </div>

            {firstProvider.chat?.sources &&
              firstProvider.chat.sources.length > 0 &&
              firstProvider.chat?.status === "ready" && <SourcesList sources={firstProvider.chat.sources} />}

            {firstProvider.chat?.searchSuggestions &&
              firstProvider.chat.searchSuggestions.length > 0 &&
              firstProvider.chat?.status === "ready" && (
                <SearchSuggestions
                  suggestions={firstProvider.chat.searchSuggestions}
                  reasoning={firstProvider.chat.searchSuggestionsReasoning}
                  confidence={firstProvider.chat.searchSuggestionsConfidence}
                  onSuggestionClick={onSearchSuggestionClick}
                />
              )}

            {firstProvider.chat?.tokenUsage && firstProvider.chat?.status === "ready" && (
              <TokenUsageDisplay chat={firstProvider.chat}/>
            )}
            {firstProvider.chat?.messages &&
              firstProvider.chat.messages.length > 0 &&
              firstProvider.chat?.status === "ready" && (
                <ModelConfigBlock chat={firstProvider.chat}/>
              )}
          </div>
        </CardContent>
      </Card>

      <Card className={`h-full flex flex-col ${!secondProvider.isActive ? "opacity-50" : ""}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{secondProvider.name}</CardTitle>
              <LikeButton initialCount={Math.floor(Math.random() * 200) + 100} />
            </div>
            <div className="flex items-center space-x-2">
              {secondProvider.chat?.modelConfig && (
                <div className="flex items-center gap-1">
                  <ModelConfigDisplay config={secondProvider.chat.modelConfig} />
                  <ModelConfigDialog
                    config={secondProvider.chat.modelConfig}
                    onConfigChange={handleSecondProviderConfigChange}
                    disabled={
                      !secondProvider.isActive ||
                      secondProvider.chat?.status === "streaming" ||
                      secondProvider.chat?.status === "submitted"
                    }
                  />
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => secondProvider.chat?.resetChat()}
                disabled={
                  !secondProvider.isActive ||
                  secondProvider.chat?.status === "streaming" ||
                  secondProvider.chat?.status === "submitted"
                }
                className="mr-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                New Chat
              </Button>
              <Switch
                id="second-provider-active"
                checked={secondProvider.isActive}
                onCheckedChange={secondProvider.toggleActive}
                disabled={secondProvider.chat?.status === "streaming" || secondProvider.chat?.status === "submitted"}
              />
              <Label htmlFor="second-provider-active">Active</Label>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <ModelSelector
              providerId={secondProvider.id}
              disabled={secondProvider.chat?.status === "streaming" || secondProvider.chat?.status === "submitted"}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto h-[calc(100vh-16rem)] max-h-[calc(100vh-24rem)]">
          <div className="space-y-4">
            <div className="flex flex-col">
              {secondProvider.chat?.messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  status={secondProvider.chat?.status}
                  isLast={index === secondProvider_messages_length - 1}
                />
              ))}
            </div>

            {secondProvider.chat?.sources &&
              secondProvider.chat.sources.length > 0 &&
              secondProvider.chat?.status === "ready" && <SourcesList sources={secondProvider.chat.sources} />}

            {secondProvider.chat?.searchSuggestions &&
              secondProvider.chat.searchSuggestions.length > 0 &&
              secondProvider.chat?.status === "ready" && (
                <SearchSuggestions
                  suggestions={secondProvider.chat.searchSuggestions}
                  reasoning={secondProvider.chat.searchSuggestionsReasoning}
                  confidence={secondProvider.chat.searchSuggestionsConfidence}
                  onSuggestionClick={onSearchSuggestionClick}
                />
              )}

            {secondProvider.chat?.tokenUsage && secondProvider.chat?.status === "ready" && (
              <TokenUsageDisplay chat={secondProvider.chat}/>
            )}
            {secondProvider.chat?.messages &&
              secondProvider.chat.messages.length > 0 &&
              secondProvider.chat?.status === "ready" && (
                <ModelConfigBlock chat={secondProvider.chat}/>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
