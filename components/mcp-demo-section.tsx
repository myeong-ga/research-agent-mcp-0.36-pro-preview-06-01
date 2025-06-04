"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Loader2,
  Send,
  Settings2,
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
} from "lucide-react"
import { useMCPAgent } from "@/hooks/store/mcp/use-mcp-agent"
import { useAgentMcpContext } from "@/contexts/agent-mcp-context"
import { cn } from "@/lib/utils"
import type { MCPServerConfig, MCPTask } from "@/lib/mcp"
import { ConnectingStickerAnimated } from "./connecting-sticker-animated"
import { MarkdownText } from "./markdown-text"
import { ThinkingBlock } from "./thinking-block"

interface MCPDemoSectionProps {
  className?: string
}

const staticShoppingSuggestions = [
  "Find the best deals on summer dresses",
  "Compare prices for Nike Air Max sneakers",
  "Show me popular electronics on sale",
  "What are the latest fashion trends for men?",
  "Add a new sofa to my cart",
]

function getRandomUniqueSuggestions(allPrompts: string[], count: number): string[] {
  if (!allPrompts || allPrompts.length === 0) {
    return []
  }
  const uniquePrompts = Array.from(new Set(allPrompts))
  const shuffled = [...uniquePrompts].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

function getTaskDisplayName(task: MCPTask): string {
  const robotIcon = task.reasoningType === "Thinking" ? "🧠" : "🤖"
  return `${task.name} ${robotIcon} ${task.model}`
}

export function MCPDemoSection({ className }: MCPDemoSectionProps) {
  const [input, setInput] = useState("")
  const { messages, isLoading, error, sendMessage, clearMessages, pendingApprovalRequest, handleApproval } =
    useMCPAgent()
  const { tasks, chatActiveTaskId, setChatActiveTaskId } = useAgentMcpContext()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const activeChatTask = tasks.find((t) => t.id === chatActiveTaskId)

  const currentSuggestions = useMemo(() => {
    const aggregatedSuggestions: string[] = []
    if (activeChatTask && activeChatTask.servers && activeChatTask.servers.length > 0) {
      activeChatTask.servers.forEach((server: MCPServerConfig) => {
        if (server.suggestedPrompts && server.suggestedPrompts.length > 0) {
          aggregatedSuggestions.push(...server.suggestedPrompts)
        }
      })
    }

    if (aggregatedSuggestions.length > 0) {
      return getRandomUniqueSuggestions(aggregatedSuggestions, 5)
    }
    return staticShoppingSuggestions
  }, [activeChatTask])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || pendingApprovalRequest || !activeChatTask) return
    await sendMessage(input)
    setInput("")
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  useEffect(() => {
    // console.log("Messages updated:", messages)
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[style*="overflow: scroll;"]') as HTMLElement
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight
      } else {
        const mainDiv = scrollAreaRef.current.children[0] as HTMLElement
        if (mainDiv && mainDiv.children[0]) {
          const contentWrapper = mainDiv.children[0] as HTMLElement
          contentWrapper.scrollTop = contentWrapper.scrollHeight
        }
      }
    }
  }, [messages])

  const showSuggestions =
    messages.length === 0 &&
    !pendingApprovalRequest &&
    activeChatTask &&
    activeChatTask.servers.length > 0 &&
    currentSuggestions.length > 0

  const activeServerForApproval = pendingApprovalRequest
    ? activeChatTask?.servers.find((s) => s.label === pendingApprovalRequest.serverLabel)
    : null

  const lightBg = "bg-[#FBF9F7]"
  const darkBg = "dark:bg-[#2B2623]"
  const lightText = "text-[#4A403A]"
  const darkText = "dark:text-[#E8E3E0]"
  const lightBorder = "border-[#E0D9D3]"
  const darkBorder = "dark:border-[#423A36]"
  const lightCardBg = "bg-[#F5F1ED]"
  const darkCardBg = "dark:bg-[#362F2C]"
  const lightMutedText = "text-[#8C7F78]"
  const darkMutedText = "dark:text-[#A39B96]"
  const lightAccent = "text-[#D8A0A7]"
  const darkAccent = "dark:text-[#C98A9A]"
  const lightInputBg = "bg-[#F3EFEC]"
  const darkInputBg = "dark:bg-[#312B28]"
  const lightPrimaryButtonBg = "bg-[#D8A0A7]"
  const darkPrimaryButtonBg = "dark:bg-[#C98A9A]"
  const lightPrimaryButtonText = "text-[#FFFFFF]"
  const darkPrimaryButtonText = "dark:text-[#FFFFFF]"
  const lightSecondaryButtonBg = "bg-[#E0D9D3]"
  const darkSecondaryButtonBg = "dark:bg-[#423A36]"
  const lightSecondaryButtonText = "text-[#4A403A]"
  const darkSecondaryButtonText = "dark:text-[#E8E3E0]"

  const approvalResultBg = "bg-[#FFFFE0]"
  const approvalResultText = "text-[#D90429]"
  const approvalResultBorder = "border-2 border-[#D90429]"

  return (
    <Card
      className={cn("flex flex-col h-full", lightBg, darkBg, lightText, darkText, lightBorder, darkBorder, className)}
    >
      <CardHeader className={cn("flex flex-row items-center justify-between", "border-b", lightBorder, darkBorder)}>
        <div className="flex items-center space-x-2">
          <CardTitle className={cn("font-normal", lightText, darkText)}>MCP Playground</CardTitle>
          {isLoading && !pendingApprovalRequest && <ConnectingStickerAnimated />}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearMessages}
          disabled={messages.length === 0 && !pendingApprovalRequest}
          className={cn(
            lightSecondaryButtonBg,
            darkSecondaryButtonBg,
            lightSecondaryButtonText,
            darkSecondaryButtonText,
            lightBorder,
            darkBorder,
            "hover:bg-[#F3EFEC] dark:hover:bg-[#312B28]",
          )}
        >
          Clear Chat
        </Button>
      </CardHeader>
      <CardContent
        className={cn("flex-1 flex flex-col space-y-4 overflow-hidden p-4", {
          "justify-center": messages.length === 0 && !pendingApprovalRequest,
        })}
      >
        {messages.length === 0 && !pendingApprovalRequest && (
          <div className={cn("text-center text-2xl font-normal mb-8", lightMutedText, darkMutedText)}>
            {tasks.length === 0
              ? "No tasks available. Please create one in configuration."
              : !activeChatTask
                ? "Select a task from the 'Task' menu to begin."
                : "What can I help with?"}
          </div>
        )}

        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {messages.map((message, index) => {
              // Skip rendering assistant messages with empty content
              if (message.role === "assistant" && (!message.content || message.content.trim() === "")) {
                return null
              }

              if (message.role === "thinking") {
                return <ThinkingBlock key={message.id} message={message} provider={message.provider} className="mb-4" />
              }

              if (message.role === "system") {
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "p-3 my-2 max-w-[90%] mx-auto rounded-md shadow-md",
                      approvalResultBg,
                      approvalResultText,
                      approvalResultBorder,
                    )}
                  >
                    <div className="flex items-center text-sm font-semibold mb-1">
                      <AlertTriangle className={cn("h-5 w-5 mr-2", approvalResultText)} />
                      MCP Tool Approval Result
                    </div>
                    <div className={cn("whitespace-pre-wrap text-sm font-medium", approvalResultText)}>
                      {message.content}
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg shadow-sm break-words text-sm ${
                    message.role === "user"
                      ? `bg-[#D8A0A7]/20 dark:bg-[#C98A9A]/20 ${lightText} ${darkText} ml-auto max-w-[80%]`
                      : `${lightCardBg} ${darkCardBg} ${lightText} ${darkText} mr-auto max-w-[80%]`
                  }`}
                >
                  <div className={cn("font-semibold mb-1 capitalize", lightMutedText, darkMutedText)}>
                    {message.role}
                  </div>
                  <MarkdownText>{message.content}</MarkdownText>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {error && (
          <Alert
            variant="destructive"
            className="mt-auto bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-700 text-red-700 dark:text-red-300"
          >
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Dialog
          open={!!pendingApprovalRequest}
          onOpenChange={(isOpen) => {
            if (!isOpen && pendingApprovalRequest) handleApproval(false)
          }}
        >
          <DialogContent
            className={cn("sm:max-w-md", lightCardBg, darkCardBg, lightText, darkText, lightBorder, darkBorder)}
          >
            <DialogHeader>
              <DialogTitle className={cn("flex items-center", lightText, darkText)}>
                <Info className={cn("mr-2 h-5 w-5", lightAccent, darkAccent)} /> MCP Tool Approval Request
              </DialogTitle>
            </DialogHeader>
            {pendingApprovalRequest && (
              <div className="space-y-3 py-4 text-sm">
                <p>The AI assistant wants to use the following tool:</p>
                <div>
                  <div className={cn("text-xs mb-1", lightMutedText, darkMutedText)}>On MCP Server:</div>
                  <p>
                    <span className="font-medium">{pendingApprovalRequest.serverLabel}</span>
                  </p>
                  {activeServerForApproval && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 break-all"> {activeServerForApproval.url}</p>
                  )}
                </div>
                <div className="my-3">
                  <div className={cn("text-xs mb-1", lightMutedText, darkMutedText)}>Tool to be used:</div>
                  <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                    <Settings2 className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="text-lg font-semibold text-blue-700 dark:text-blue-300 break-words">
                      {pendingApprovalRequest.toolName}
                    </span>
                  </div>
                </div>
                <div>
                  <div className={cn("text-xs mb-1", lightMutedText, darkMutedText)}>With arguments:</div>
                  <ScrollArea className=" h-40 w-full max-h-40 mt-1 rounded bg-gray-100 dark:bg-gray-800 border dark:border-gray-700">
                    <div className="p-2">
                      <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                        {JSON.stringify(JSON.parse(pendingApprovalRequest.toolArguments || "{}"), null, 2)}
                      </pre>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => handleApproval(false)}
                className={cn(
                  lightSecondaryButtonBg,
                  darkSecondaryButtonBg,
                  lightSecondaryButtonText,
                  darkSecondaryButtonText,
                  lightBorder,
                  darkBorder,
                  "hover:bg-[#F3EFEC] dark:hover:bg-[#312B28]",
                )}
              >
                <XCircle className="mr-2 h-4 w-4" /> Decline
              </Button>
              <Button
                onClick={() => handleApproval(true)}
                className={cn(
                  lightPrimaryButtonBg,
                  darkPrimaryButtonBg,
                  lightPrimaryButtonText,
                  darkPrimaryButtonText,
                  "hover:bg-[#C98A9A] dark:hover:bg-[#D8A0A7]",
                )}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div
          className={cn(
            "mt-auto pt-4 border-t",
            lightBorder,
            darkBorder,
            messages.length === 0 && !pendingApprovalRequest ? "max-w-2xl mx-auto w-full" : "",
          )}
        >
          <form onSubmit={handleSubmit} className="relative">
            <div
              className={cn(
                "flex items-start gap-2 border rounded-lg p-2 pr-14",
                lightInputBg,
                darkInputBg,
                lightBorder,
                darkBorder,
              )}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center gap-1 px-2 shrink-0 mt-1.5",
                      lightMutedText,
                      darkMutedText,
                      `hover:${lightText} dark:hover:${darkText}`,
                    )}
                    disabled={!!pendingApprovalRequest || tasks.length === 0}
                  >
                    <Settings2 className="h-4 w-4" />
                    Task
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className={cn(lightCardBg, darkCardBg, lightText, darkText, lightBorder, darkBorder)}
                >
                  {tasks.length === 0 && (
                    <DropdownMenuItem disabled className={cn(lightMutedText, darkMutedText)}>
                      No tasks available
                    </DropdownMenuItem>
                  )}
                  {tasks.map((task) => (
                    <DropdownMenuItem
                      key={task.id}
                      onClick={() => setChatActiveTaskId(task.id)}
                      disabled={chatActiveTaskId === task.id}
                      className={cn(`hover:${lightInputBg} dark:hover:${darkInputBg}`)}
                    >
                      {getTaskDisplayName(task)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {activeChatTask && !pendingApprovalRequest && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "flex items-center gap-1 shrink-0 mt-1.5 bg-[#D8A0A7]/30 dark:bg-[#C98A9A]/30 text-[#4A403A] dark:text-[#E8E3E0] border-transparent",
                  )}
                >
                  <ShoppingCart className="h-3 w-3" />
                  {activeChatTask.name}
                </Badge>
              )}

              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  pendingApprovalRequest
                    ? "Awaiting your approval for the tool call above..."
                    : tasks.length === 0
                      ? "No tasks available. Configure tasks first."
                      : !activeChatTask
                        ? "Select a task from the 'Task' menu to begin..."
                        : !activeChatTask.servers.length
                          ? `Add MCP servers to "${activeChatTask.name}" in configuration...`
                          : "Type your message..."
                }
                className={cn(
                  "flex-1 min-h-[20px] h-auto py-1.5 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none bg-transparent",
                  `placeholder:${lightMutedText} dark:placeholder:${darkMutedText}`,
                  lightText,
                  darkText,
                )}
                rows={1}
                disabled={
                  isLoading ||
                  !!pendingApprovalRequest ||
                  tasks.length === 0 ||
                  !activeChatTask ||
                  (!activeChatTask.servers.length && !pendingApprovalRequest)
                }
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2",
                lightPrimaryButtonBg,
                darkPrimaryButtonBg,
                lightPrimaryButtonText,
                darkPrimaryButtonText,
                "hover:bg-[#C98A9A] dark:hover:bg-[#D8A0A7]",
              )}
              disabled={
                isLoading ||
                !!pendingApprovalRequest ||
                !input.trim() ||
                !activeChatTask ||
                (!activeChatTask.servers.length && !pendingApprovalRequest)
              }
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
            {tasks.length > 0 && !activeChatTask && messages.length === 0 && !pendingApprovalRequest && (
              <div className={cn("text-xs mt-2 text-center", lightMutedText, darkMutedText)}>
                Please select a task from the "Task" menu to begin your chat.
              </div>
            )}
          </form>

          {showSuggestions && (
            <div className={cn("w-full mx-auto pt-4", messages.length === 0 ? "max-w-2xl" : "")}>
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-2">
                {currentSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className={cn(
                      "justify-start text-left h-auto py-2 font-light",
                      lightMutedText,
                      darkMutedText,
                      `hover:${lightInputBg} dark:hover:${darkInputBg}`,
                      `hover:${lightText} dark:hover:${darkText}`,
                    )}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={!!pendingApprovalRequest}
                  >
                    <TrendingUp className="h-4 w-4 mr-2 shrink-0" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
