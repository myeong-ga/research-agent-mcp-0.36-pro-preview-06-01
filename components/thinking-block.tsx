"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Message, ProviderType } from "@/lib/types"

export interface ThinkingBlockProps {
  message: Message
  provider?: ProviderType
  className?: string
}

export function ThinkingBlock({ message, provider, className = "" }: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const getProviderInfo = (provider?: ProviderType) => {
    switch (provider) {
      case "openai":
        return {
          name: "OpenAI",
          color: "text-green-700 dark:text-green-300",
          bgColor: "bg-green-50 dark:bg-green-950/20",
          borderColor: "border-green-300",
        }
      case "anthropic":
        return {
          name: "Anthropic",
          color: "text-orange-700 dark:text-orange-300",
          bgColor: "bg-orange-50 dark:bg-orange-950/20",
          borderColor: "border-orange-300",
        }
      case "gemini":
        return {
          name: "Gemini",
          color: "text-blue-700 dark:text-blue-300",
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
          borderColor: "border-blue-300",
        }
      default:
        return {
          name: "AI",
          color: "text-blue-700 dark:text-blue-300",
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
          borderColor: "border-blue-300",
        }
    }
  }

  const providerInfo = getProviderInfo(provider)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <Card className={`border-dashed ${providerInfo.borderColor} ${providerInfo.bgColor} ${className}`}>
      <CardHeader className="pb-2 relative">
        <CardTitle className={`text-sm flex items-center gap-2 ${providerInfo.color} pr-10`}>
          <Brain className="h-4 w-4" />
          {providerInfo.name} is Thinking...
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpanded}
          className={`absolute top-0 right-3  h-6 w-6 p-0 ${providerInfo.color} hover:bg-black/10 dark:hover:bg-white/10`}
          aria-label={isExpanded ? "Collapse thinking" : "Expand thinking"}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          <div
            className={`text-sm ${providerInfo.color.replace("700", "800").replace("300", "200")} whitespace-pre-wrap font-mono`}
          >
            {message.content}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
