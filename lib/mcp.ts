import type { Message } from "@/lib/types"

export interface MCPServerConfig {
  id: string
  label: string
  url: string
  allowedTools?: string[]
  requireApproval?: "always" | "never"
  suggestedPrompts?: string[]
}

export interface MCPTask {
  id: string
  name: string
  model: string
  reasoningType: string
  servers: MCPServerConfig[]
}

export interface MCPAgentState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  currentProvider: "openai"
  pendingApprovalRequest: MCPApprovalRequest | null
}

export interface MCPApprovalRequest {
  id: string
  serverLabel: string
  toolName: string
  toolArguments: string
}

export interface OpenAIMcpTool {
  type: "mcp"
  server_label: string
  server_url: string
  allowed_tools?: string[]
  require_approval?: "always" | "never"
}

export interface OpenAIUserMessageContentItem {
  role: "user"
  content: Array<{ type: "input_text"; text: string }>
}

export interface MCPApprovalResponseItem {
  type: "mcp_approval_response"
  approval_request_id: string
  approve: boolean
}

export type OpenAIAPIInputItem = OpenAIUserMessageContentItem | MCPApprovalResponseItem

export interface OpenAIApprovalRequestItem {
  id: string
  type: "mcp_approval_request"
  server_label: string
  name: string
  arguments: string
}

export interface ApiRouteRequestBody {
  model: string
  tools?: OpenAIMcpTool[]
  temperature?: number
  max_output_tokens?: number
  stream?: boolean
  previous_response_id?: string
  input?: OpenAIAPIInputItem[]
  reasoningType?: string
}

export interface ReasoningConfig {
  effort: "low" | "medium" | "high"
  summary: "auto" | "concise" | "detailed"
}
