"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ModelConfigDialog } from "./model-config-dialog"
import type { ChatInterface, ModelConfig, ProviderType, ResearchAgentInterface } from "@/lib/types"

interface ModelConfigBlockProps {
 chat: ChatInterface | null
}

export function ModelConfigBlock({ chat }: ModelConfigBlockProps) {

  if (!chat?.modelConfig) {
    console.error("ModelConfigBlock: chat or Research is null")
    return null
  }

  const handleConfigChange = (config: ModelConfig) => {
    if (chat?.updateModelConfig) {
      chat.updateModelConfig(config)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CardTitle className="text-sm font-medium">Model Configuration</CardTitle>
            <ModelConfigDialog
              config={chat.modelConfig}
              onConfigChange={handleConfigChange}
              disabled={chat.status === "streaming" || chat.status === "submitted"}
              buttonClassName="h-6 w-6"
            />
          </div>
        
        <CardDescription className="text-xs text-foreground">{chat?.responseSelectModel && `${chat.responseSelectModel}`}  
          {chat?.responseReasoningType === "Thinking"? " 🧠 " : " 🤖 "}
          {chat?.responseReasoningType && `${chat.responseReasoningType}`}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Temperature</span>
            <span className="font-mono">{chat.responseModelConfig?.temperature.toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Top P</span>
            <span className="font-mono">{chat.responseModelConfig && chat.responseModelConfig.topP?.toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Max Tokens</span>
            <span className="font-mono">{chat.responseModelConfig?.maxTokens.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
