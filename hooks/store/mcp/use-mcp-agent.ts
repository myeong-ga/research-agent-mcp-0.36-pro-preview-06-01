"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import type {
  MCPAgentState,
  OpenAIMcpTool,
  MCPApprovalRequest,
  MCPApprovalResponseItem,
  OpenAIAPIInputItem,
} from "@/lib/mcp"
import type { Message } from "@/lib/types"
import { nanoid } from "@/lib/nanoid"
import { useOpenaiMcpProvider } from "./use-openai-mcp-provider"
import { useAgentMcpContext } from "@/contexts/agent-mcp-context"

interface UseMCPAgentOptions {
  provider?: "openai"
}

export interface MCPRequestOptions {
  model: string
  tools?: OpenAIMcpTool[]
  temperature?: number
  max_output_tokens?: number
  stream?: boolean
  previous_response_id?: string | null
  input_items?: OpenAIAPIInputItem[]
}

export type MCPProviderCallbackEvent =
  | { type: "message"; content: string; responseId: string | null }
  | { type: "message_delta"; content: string; responseId: string | null }
  | { type: "approval_request"; data: MCPApprovalRequest; responseId: string | null }
  | { type: "response_id"; responseId: string }
  | { type: "done"; responseId: string | null }
  | { type: "error"; error: string; responseId: string | null }
  | { type: "thinking_delta"; content: string; summaryIndex: number; itemId: string; responseId: string | null }
  | { type: "thinking_done"; content: string; summaryIndex: number; itemId: string; responseId: string | null }
  | { type: "reasoning_complete"; content: string; responseId: string | null }

export type MCPProviderCallback = (event: MCPProviderCallbackEvent) => void

export interface MCPClientStore {
  sendMessage: (message: string | null, options: MCPRequestOptions, callback: MCPProviderCallback) => Promise<void>
}

export function useMCPAgent(options: UseMCPAgentOptions = {}) {
  const { provider = "openai" } = options
  const [state, setState] = useState<MCPAgentState>({
    messages: [],
    isLoading: false,
    error: null,
    currentProvider: provider,
    pendingApprovalRequest: null,
  })
  const [currentResponseId, setCurrentResponseId] = useState<string | null>(null)
  const [accumulatedDelta, setAccumulatedDelta] = useState<string>("")
  const previousTaskModelRef = useRef<string | null>(null)

  const { chatActiveTaskId, getTaskById } = useAgentMcpContext()
  const openaiProvider = useOpenaiMcpProvider()

  const getProvider = (): MCPClientStore => {
    return openaiProvider
  }

  const processCallbackEvent: MCPProviderCallback = useCallback((event) => {
    if (event.responseId) {
      setCurrentResponseId(event.responseId)
    }

    switch (event.type) {
      case "thinking_delta":
        setState((prev) => {
          const existingThinkingMessage = prev.messages.find(
            (msg) => msg.id === event.itemId && msg.role === "thinking",
          )

          if (existingThinkingMessage) {
            return {
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === event.itemId ? { ...msg, content: msg.content + event.content } : msg,
              ),
            }
          } else {
            const newThinkingMessage: Message = {
              id: event.itemId,
              role: "thinking",
              content: event.content,
              provider: "openai",
            }
            return {
              ...prev,
              messages: [...prev.messages, newThinkingMessage],
            }
          }
        })
        break
      case "thinking_done":
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) => (msg.id === event.itemId ? { ...msg, content: event.content } : msg)),
        }))
        break
      case "reasoning_complete":
        console.log("Reasoning complete:", event.content)
        break
      case "message_delta":
        setAccumulatedDelta((prev) => {
          const newContent = prev + event.content
          setState((s) => {
            const lastAssistantMessage = [...s.messages].reverse().find((msg) => msg.role === "assistant")

            if (lastAssistantMessage) {
              return {
                ...s,
                messages: s.messages.map((msg) =>
                  msg.id === lastAssistantMessage.id ? { ...msg, content: newContent } : msg,
                ),
              }
            }
            return s
          })
          return newContent
        })
        break
      case "message":
        setAccumulatedDelta("")
        setState((prev) => {
          const lastAssistantMessage = [...prev.messages].reverse().find((msg) => msg.role === "assistant")

          if (lastAssistantMessage) {
            return {
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === lastAssistantMessage.id ? { ...msg, content: event.content } : msg,
              ),
            }
          }
          return prev
        })
        break
      case "approval_request":
        setAccumulatedDelta("")
        setState((prev) => ({
          ...prev,
          pendingApprovalRequest: event.data,
          isLoading: false,
        }))
        break
      case "response_id":
        break
      case "done":
        setAccumulatedDelta("")
        setState((prev) => ({ ...prev, isLoading: false }))
        break
      case "error":
        setAccumulatedDelta("")
        setState((prev) => ({ ...prev, error: event.error, isLoading: false }))
        break
    }
  }, [])

  const sendMessage = useCallback(
    async (userInput: string) => {
      if (!chatActiveTaskId) {
        setState((prev) => ({ ...prev, error: "No active chat task selected." }))
        return
      }
      const task = getTaskById(chatActiveTaskId)
      if (!task) {
        setState((prev) => ({ ...prev, error: "Active chat task not found." }))
        return
      }
      if (!task.servers || task.servers.length === 0) {
        setState((prev) => ({ ...prev, error: `Task "${task.name}" has no MCP servers configured.` }))
        return
      }

      const userMessage: Message = {
        id: nanoid(),
        role: "user",
        content: userInput,
      }

      const assistantMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content: "",
        provider: "openai",
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        pendingApprovalRequest: null,
        messages: [...prev.messages, userMessage, assistantMessage],
      }))
      setAccumulatedDelta("")

      try {
        const mcpTools: OpenAIMcpTool[] = task.servers.map((server) => ({
          type: "mcp",
          server_label: server.label,
          server_url: server.url,
          allowed_tools: server.allowedTools,
          require_approval: server.requireApproval,
        }))

        const requestOptions: MCPRequestOptions = {
          model: task.model,
          tools: mcpTools,
          temperature: 1,
          max_output_tokens: task.model === "o3" ? 8000 : 2048,
          stream: true,
          previous_response_id: currentResponseId,
        }

        const providerImpl = getProvider()
        await providerImpl.sendMessage(userInput, requestOptions, processCallbackEvent)
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "An error occurred during message sending",
        }))
      }
    },
    [chatActiveTaskId, getTaskById, currentResponseId, processCallbackEvent],
  )

  const handleApproval = async (approve: boolean) => {
    const requestToApprove = state.pendingApprovalRequest
    if (!requestToApprove || !currentResponseId) {
      console.error("No pending approval request or previous response ID to handle.")
      setState((prev) => ({ ...prev, pendingApprovalRequest: null, isLoading: false }))
      return
    }
    if (!chatActiveTaskId) {
      setState((prev) => ({
        ...prev,
        error: "No active chat task selected for approval.",
        pendingApprovalRequest: null,
        isLoading: false,
      }))
      return
    }
    const task = getTaskById(chatActiveTaskId)
    if (!task) {
      setState((prev) => ({
        ...prev,
        error: "Active chat task not found for approval.",
        pendingApprovalRequest: null,
        isLoading: false,
      }))
      return
    }

    const approvalMessage: Message = {
      id: nanoid(),
      role: "system",
      content: `Tool call to "${requestToApprove.toolName}" with Arguments "${requestToApprove.toolArguments}" on server "${requestToApprove.serverLabel}" was ${approve ? "approved" : "declined"}.`,
    }

    const assistantMessage: Message = {
      id: nanoid(),
      role: "assistant",
      content: "",
      provider: "openai",
    }

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, approvalMessage, assistantMessage],
      pendingApprovalRequest: null,
      isLoading: true,
    }))
    setAccumulatedDelta("")

    const approvalResponseItem: MCPApprovalResponseItem = {
      type: "mcp_approval_response",
      approval_request_id: requestToApprove.id,
      approve: approve,
    }

    const mcpToolsForContinuation: OpenAIMcpTool[] = task.servers.map((server) => ({
      type: "mcp",
      server_label: server.label,
      server_url: server.url,
      allowed_tools: server.allowedTools,
      require_approval: server.requireApproval,
    }))

    const options: MCPRequestOptions = {
      model: task.model,
      tools: mcpToolsForContinuation,
      previous_response_id: currentResponseId,
      input_items: [approvalResponseItem],
      stream: true,
    }

    const providerImpl = getProvider()
    await providerImpl.sendMessage(null, options, processCallbackEvent)
  }

  const clearMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
      pendingApprovalRequest: null,
      error: null,
      isLoading: false,
    }))
    setCurrentResponseId(null)
    setAccumulatedDelta("")
    previousTaskModelRef.current = null
  }, [])

  const clearStateByActiveTaskId = useCallback(() => {
    const currentTask = chatActiveTaskId ? getTaskById(chatActiveTaskId) : null
    const currentModel = currentTask?.model || null
    const previousModel = previousTaskModelRef.current

    setState((prev) => ({
      ...prev,
      pendingApprovalRequest: null,
      error: null,
      isLoading: false,
    }))

    if (previousModel !== null && currentModel !== previousModel) {
      setCurrentResponseId(null)
    }

    setAccumulatedDelta("")
    previousTaskModelRef.current = currentModel
  }, [chatActiveTaskId, getTaskById])

  useEffect(() => {
    clearMessages()
  }, [clearMessages])

  useEffect(() => {
    clearStateByActiveTaskId()
  }, [chatActiveTaskId, clearStateByActiveTaskId])

  return {
    ...state,
    currentResponseId,
    sendMessage,
    handleApproval,
    clearMessages,
    activeChatTaskDetails: chatActiveTaskId ? getTaskById(chatActiveTaskId) : null,
  }
}
