import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TokenUsage, ProviderType, ChatInterface, ResearchAgentInterface } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

interface TokenUsageDisplayProps {
  chat: ChatInterface | null
}

export function TokenUsageDisplay({ chat}: TokenUsageDisplayProps) {

  const tokenUsage = chat?.tokenUsage as TokenUsage | null

  if (!tokenUsage) return null


  const getFinishReasonDescription = (reason: string): string => {
    switch (reason.toLowerCase()) {
      case "stop":
        return "Model reached a natural stopping point or stop token"
      case "length":
        return "Response exceeded maximum allowed tokens"
      case "content_filter":
        return "Content was filtered due to safety settings"
      case "tool_calls":
        return "Model called a tool to complete the response"
      case "function_call":
        return "Model called a function to complete the response"
      case "max_tokens":
        return "Response reached the maximum token limit"
      default:
        return `Finished with reason: ${reason}`
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2 flex items-center justify-between">
        <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
         <CardDescription className="text-xs text-foreground">{chat?.responseSelectModel && `${chat.responseSelectModel}`}  
          {chat?.responseReasoningType === "Thinking"? " 🧠 " : " 🤖 "}
          {chat?.responseReasoningType && `${chat.responseReasoningType}`}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Prompt</span>
            <span className="font-mono">{tokenUsage.promptTokens.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-mono">{tokenUsage.completionTokens.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Total</span>
            <span className="font-mono">{tokenUsage.totalTokens.toLocaleString()}</span>
          </div>
        </div>

        {tokenUsage.finishReason && (
          <div className="mt-2 pt-2 border-t flex items-center">
            <span className="text-xs text-muted-foreground mr-1">Finish Reason:</span>
            <span className="text-xs font-mono">{tokenUsage.finishReason}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-3 w-3 ml-1 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">{getFinishReasonDescription(tokenUsage.finishReason)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
