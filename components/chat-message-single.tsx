"use client"
import type { Message } from "@/lib/types"
import { User, Bot, Copy, Check } from "lucide-react"
import { MarkdownText } from "./markdown-text"
import { TextShimmerLoader } from "./TextShimmerLoader"
import { ThinkingBlock } from "./thinking-block"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/copy-to-clipboard"
import { cn } from "@/lib/utils"
import { stripMarkdown } from "@/lib/strip-markdown"

export interface ChatMessageSingleProps {
  message: Message
  status?: "submitted" | "streaming" | "ready" | "error"
  isLast?: boolean
  className?: string
  useMarkdown?: boolean
}

export function ChatMessageSingle({ message, status, isLast, className, useMarkdown = false }: ChatMessageSingleProps) {
  const [isCopied, setIsCopied] = useState(false)

  if (message.role === "thinking") {
    return <ThinkingBlock message={message} provider={message.provider} className={className} />
  }

  const cleanContent = !useMarkdown && message.role === "assistant" ? stripMarkdown(message.content) : message.content

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content)
    if (success) {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  if (status === "submitted" && isLast && message.role === "user") {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex flex-col gap-2 w-full p-2 mt-2">
          <div className="flex gap-6 items-start">
            <div className="flex h-8 w-8 items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 w-full max-w-[80%]">{message.content}</div>
          </div>
          <div className="flex h-8 w-full p-2 pl-12 items-start">
            <TextShimmerLoader size="md" className="high-contrast" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex gap-6 p-2 mt-2 items-start">
        <div className="flex h-8 w-8 items-center justify-center">
          {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        <div className="w-full h-full">
          {message.role === "assistant" && useMarkdown ? (
            <div className="flex-1 w-full max-w-[80%]">
              <MarkdownText>{message.content}</MarkdownText>
            </div>
          ) : (
            <div className="flex-1 w-full max-w-[80%]">{cleanContent}</div>
          )}

          {message.role === "assistant" && status === "ready" && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCopy}
                aria-label="Copy message to clipboard"
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
