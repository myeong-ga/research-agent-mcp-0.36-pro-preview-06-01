"use client"

import { useState, useCallback, useEffect } from "react"
import type {
  MCPAgentState,
  OpenAIMcpTool,
  MCPApprovalRequest,
  MCPApprovalResponseItem,
  OpenAIAPIInputItem,
} from "@/lib/mcp" // Ensure this path is correct
import { useOpenaiMcpProvider } from "./use-openai-mcp-provider" // Ensure this path is correct
import { useAgentMcpContext } from "@/contexts/agent-mcp-context"

interface UseMCPAgentOptions {
  provider?: "openai" // Currently only supporting openai
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

  const { chatActiveTaskId, getTaskById } = useAgentMcpContext() // Uses chatActiveTaskId
  const openaiProvider = useOpenaiMcpProvider()

  const getProvider = (): MCPClientStore => {
    // Extend this if more providers are added
    return openaiProvider
  }

  const processCallbackEvent: MCPProviderCallback = useCallback((event) => {
    if (event.responseId) {
      setCurrentResponseId(event.responseId)
    }

    switch (event.type) {
      case "message_delta":
        setAccumulatedDelta((prev) => {
          const newContent = prev + event.content
          setState((s) => {
            const lastMessage = s.messages[s.messages.length - 1]
            if (lastMessage && lastMessage.role === "assistant" && s.isLoading) {
              const updatedMessages = [...s.messages]
              updatedMessages[s.messages.length - 1] = { ...lastMessage, content: newContent }
              return { ...s, messages: updatedMessages }
            }
            return s
          })
          return newContent
        })
        break
      case "message":
        setAccumulatedDelta("") // Reset delta when full message arrives
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg, index) =>
            index === prev.messages.length - 1 && msg.role === "assistant"
              ? { ...msg, content: event.content } // Update last assistant message
              : msg,
          ),
        }))
        break
      case "approval_request":
        setAccumulatedDelta("")
        setState((prev) => ({
          ...prev,
          pendingApprovalRequest: event.data,
          isLoading: false, // Stop loading while waiting for approval
        }))
        break
      case "response_id":
        // Handled by setting currentResponseId
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

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        pendingApprovalRequest: null,
        messages: [...prev.messages, { role: "user", content: userInput }],
      }))
      setAccumulatedDelta("") // Reset before new message stream
      // Add a placeholder for assistant's response
      setState((prev) => ({ ...prev, messages: [...prev.messages, { role: "assistant", content: "" }] }))

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
          max_output_tokens: 2048,
          stream: true,
          previous_response_id: currentResponseId, // Continue conversation if ID exists
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

    setState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          role: "tool_approval",
          content: `Tool call to "${requestToApprove.toolName}" on server "${requestToApprove.serverLabel}" was ${approve ? "approved" : "declined"}.`,
        },
      ],
      pendingApprovalRequest: null,
      isLoading: true, // Start loading for the continuation
    }))
    setAccumulatedDelta("")
    setState((prev) => ({ ...prev, messages: [...prev.messages, { role: "assistant", content: "" }] }))

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
  }, [])

  useEffect(() => {
    // If chatActiveTaskId changes, clear messages and reset conversation state
    // This prevents carrying over a conversation from a different task
    clearMessages()
  }, [chatActiveTaskId, clearMessages])

  return {
    ...state,
    currentResponseId,
    sendMessage,
    handleApproval,
    clearMessages,
    activeChatTaskDetails: chatActiveTaskId ? getTaskById(chatActiveTaskId) : null,
  }
}
