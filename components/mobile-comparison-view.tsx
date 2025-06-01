"use client"

import { ChatMessage } from "@/components/chat-message"
import { SourcesList } from "@/components/sources-list"
import { SearchSuggestions } from "@/components/search-suggestions"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProviderType, ChatInterface, Message } from "@/lib/types"
import { ModelSelector } from "@/components/model-selector"
import { LikeButton } from "@/components/like-button"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { TokenUsageDisplay } from "@/components/token-usage-display"

interface ProviderProps {
  id: ProviderType
  name: string
  chat: ChatInterface | null
  isActive: boolean
  toggleActive: () => void
}

interface MobileComparisonViewProps {
  firstProvider: ProviderProps
  secondProvider: ProviderProps
  onSearchSuggestionClick: (suggestion: string) => void
}

export function MobileComparisonView({
  firstProvider,
  secondProvider,
  onSearchSuggestionClick,
}: MobileComparisonViewProps) {
  const firstProvider_messages_length = firstProvider.chat?.messages ? firstProvider.chat.messages.length : 0
  const secondProvider_messages_length = secondProvider.chat?.messages ? secondProvider.chat.messages.length : 0

  return (
    <Tabs defaultValue="first" className="w-full h-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="first" className="flex justify-between items-center">
          <span>{firstProvider.name}</span>
          <div className="flex items-center space-x-2 ml-2">
            <Switch
              id="first-provider-active-mobile"
              checked={firstProvider.isActive}
              onCheckedChange={firstProvider.toggleActive}
              disabled={firstProvider.chat?.status === "streaming" || firstProvider.chat?.status === "submitted"}
            />
          </div>
        </TabsTrigger>
        <TabsTrigger value="second" className="flex justify-between items-center">
          <span>{secondProvider.name}</span>
          <div className="flex items-center space-x-2 ml-2">
            <Switch
              id="second-provider-active-mobile"
              checked={secondProvider.isActive}
              onCheckedChange={secondProvider.toggleActive}
              disabled={secondProvider.chat?.status === "streaming" || secondProvider.chat?.status === "submitted"}
            />
          </div>
        </TabsTrigger>
      </TabsList>
      <div className="p-2">
        <div className="flex items-center justify-between">
          <ModelSelector
            providerId={firstProvider.id}
            className= "flex-1 mr-2"
            disabled={firstProvider.chat?.status === "streaming" || firstProvider.chat?.status === "submitted"}
          />
          <ModelSelector
            providerId={secondProvider.id}
            className="flex-1 mr-2"
            disabled={secondProvider.chat?.status === "streaming" || secondProvider.chat?.status === "submitted"}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
            
                  firstProvider.chat?.resetChat()
             
                  secondProvider.chat?.resetChat()
              
              }}
             
              
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              New Chat
            </Button>
            <div>
              <LikeButton initialCount={Math.floor(Math.random() * 200) + 100} />
            </div>
            <div>
              <LikeButton initialCount={Math.floor(Math.random() * 200) + 100} />
            </div>
          </div>
        </div>
      </div>
      <TabsContent value="first" className="mt-2 h-[calc(100vh-20rem)] overflow-y-auto">
        <div className={`space-y-4 ${!firstProvider.isActive ? "opacity-50" : ""}`}>
          <div className="flex flex-col">
            {firstProvider.chat?.messages.map((message: Message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                status={firstProvider.chat?.status}
                isLast={index === firstProvider_messages_length - 1}
              />
            ))}
          </div>

          {firstProvider.chat?.sources && firstProvider.chat.sources.length > 0 && (
            <SourcesList sources={firstProvider.chat.sources} />
          )}
          {firstProvider.chat?.searchSuggestions && firstProvider.chat.searchSuggestions.length > 0 && (
            <SearchSuggestions
              suggestions={firstProvider.chat.searchSuggestions}
              reasoning={firstProvider.chat.searchSuggestionsReasoning}
              confidence={firstProvider.chat.searchSuggestionsConfidence}
              onSuggestionClick={onSearchSuggestionClick}
            />
          )}

          {firstProvider.chat?.tokenUsage && (
            <TokenUsageDisplay chat={firstProvider.chat}/>
          )}
        </div>
      </TabsContent>
      <TabsContent value="second" className="mt-2 h-[calc(100vh-20rem)] overflow-y-auto">
        <div className={`space-y-4 ${!secondProvider.isActive ? "opacity-50" : ""}`}>
          <div className="flex flex-col">
            {secondProvider.chat?.messages.map((message: Message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                status={secondProvider.chat?.status}
                isLast={index === secondProvider_messages_length - 1}
              />
            ))}
          </div>

          {secondProvider.chat?.sources && secondProvider.chat.sources.length > 0 && (
            <SourcesList sources={secondProvider.chat.sources} />
          )}
          {secondProvider.chat?.searchSuggestions && secondProvider.chat.searchSuggestions.length > 0 && (
            <SearchSuggestions
              suggestions={secondProvider.chat.searchSuggestions}
              reasoning={secondProvider.chat.searchSuggestionsReasoning}
              confidence={secondProvider.chat.searchSuggestionsConfidence}
              onSuggestionClick={onSearchSuggestionClick}
            />
          )}

          {secondProvider.chat?.tokenUsage && (
            <TokenUsageDisplay chat={secondProvider.chat}/>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
