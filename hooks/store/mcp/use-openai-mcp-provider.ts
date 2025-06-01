"use client"

import type { MCPClientStore, MCPRequestOptions, MCPProviderCallback } from "./use-mcp-agent"
import type { OpenAIApprovalRequestItem, ApiRouteRequestBody, OpenAIUserMessageContentItem } from "@/lib/mcp"

export function useOpenaiMcpProvider(): MCPClientStore {
  const sendMessage = async (
    message: string | null,
    options: MCPRequestOptions,
    callback: MCPProviderCallback,
  ): Promise<void> => {
    try {
      const apiRequestBody: ApiRouteRequestBody = {
        model: options.model,
        stream: options.stream ?? true,
      }

      if (options.previous_response_id) {
        apiRequestBody.previous_response_id = options.previous_response_id
      }

      if (options.input_items && options.input_items.length > 0) {
        apiRequestBody.input = options.input_items
      } else if (message) {
        const userInputItem: OpenAIUserMessageContentItem = {
          role: "user",
          content: [{ type: "input_text", text: message }],
        }
        apiRequestBody.input = [userInputItem]
      } else {
        throw new Error("Message or input_items must be provided.")
      }

      if (options.tools) {
        apiRequestBody.tools = options.tools
      }
      if (options.temperature !== undefined) apiRequestBody.temperature = options.temperature
      if (options.max_output_tokens !== undefined) apiRequestBody.max_output_tokens = options.max_output_tokens

      const response = await fetch("/api/mcp/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      if (options.stream ?? true) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error("No response body for streaming")
        }

        let currentResponseIdFromStream: string | null = null

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataString = line.substring(6).trim()
              if (dataString === "[DONE]") {
                callback({ type: "done", responseId: currentResponseIdFromStream })
                continue
              }
              if (!dataString) continue

              try {
                const event = JSON.parse(dataString)

                if (event.type === "response.created" && event.response?.id) {
                  currentResponseIdFromStream = event.response.id
                  callback({ type: "response_id", responseId: currentResponseIdFromStream as string})
                }

                if (event.type === "response.output_item.done" && event.item?.type === "mcp_approval_request") {
                  const approvalItem = event.item as OpenAIApprovalRequestItem
                  callback({
                    type: "approval_request",
                    data: {
                      id: approvalItem.id,
                      serverLabel: approvalItem.server_label,
                      toolName: approvalItem.name,
                      toolArguments: approvalItem.arguments,
                    },
                    responseId: currentResponseIdFromStream,
                  })
                } else if (event.type === "response.output_text.done" && event.text) {
                  callback({ type: "message", content: event.text, responseId: currentResponseIdFromStream })
                } else if (event.type === "response.output_text.delta" && event.delta) {
                  callback({ type: "message_delta", content: event.delta, responseId: currentResponseIdFromStream })
                }
              } catch (e) {
                console.error("Failed to parse SSE event data:", dataString, e)
              }
            }
          }
        }
      } else {
        const data = await response.json()
        if (data.output && data.output.length > 0 && data.output[0].type === "message") {
          callback({ type: "message", content: data.output[0].content[0].text, responseId: data.id })
        }
        callback({ type: "done", responseId: data.id })
      }
    } catch (error) {
      console.error("Error in useOpenaiMcpProvider sendMessage:", error)
      callback({ type: "error", error: error instanceof Error ? error.message : String(error), responseId: null })
    }
  }

  return { sendMessage }
}
