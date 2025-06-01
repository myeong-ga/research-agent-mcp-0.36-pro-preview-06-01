"use client"
import type { Message } from "@/lib/types"
import { User, Bot, Copy, Check } from "lucide-react"
import { TextShimmerLoader } from "./TextShimmerLoader"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/copy-to-clipboard"
import { cn } from "@/lib/utils"
import { stripMarkdown } from "@/lib/strip-markdown"

export interface ChatMessageProps {
  message: Message
  status?: "submitted" | "streaming" | "ready" | "error"
  isLast?: boolean
  className?: string
}

export function ChatMessage({ message, status, isLast, className }: ChatMessageProps) {
  const [isCopied, setIsCopied] = useState(false)

  // 마크다운 제거 (어시스턴트 메시지만)
  const cleanContent = message.role === "assistant" ? stripMarkdown(message.content) : message.content

  const handleCopy = async () => {
    const success = await copyToClipboard(cleanContent)
    if (success) {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  if (status === "submitted" && isLast && message.role === "user") {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex gap-6 p-2 items-start">
          <div className="flex h-5 w-5 m-1 shrink-0 select-none items-center justify-center bg-background">
            {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </div>
          <div
            className="px-3 py-2 max-w-[88%] font-mono"
            style={{
              whiteSpace: "pre-wrap",
              fontSize: "14px",
              lineHeight: "20px",
              fontWeight: 400,
            }}
          >
            {message.content}
          </div>
        </div>
        <div className="flex h-8 w-full p-2 pl-8 items-start">
          <TextShimmerLoader size="md" className="high-contrast" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex gap-6 p-2 items-start">
        <div className="flex h-5 w-5 m-1 shrink-0 select-none items-center justify-center bg-background">
          {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        <div className="w-full h-full">
          <div
            className="px-3 py-2 max-w-[88%] font-mono"
            style={{
              whiteSpace: "pre-wrap",
              fontSize: "14px",
              lineHeight: "20px",
              fontWeight: 400,
            }}
          >
            {cleanContent}
          </div>

          {message.role === "assistant" && status === "ready" && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopy}
                aria-label="Copy message to clipboard"
              >
                {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
