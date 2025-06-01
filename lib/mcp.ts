export interface OpenAIMcpTool {
  type: "mcp"
  server_label: string
  server_url: string
  allowed_tools?: string[]
  require_approval?: "always" | "never" 
}

export interface MCPMessage {
  role: "user" | "assistant" | "system" | "tool_approval"
  content: string
  approvalRequest?: MCPApprovalRequest
}

export interface MCPApprovalRequest {
  id: string
  serverLabel: string
  toolName: string
  toolArguments: string
}

export interface MCPApprovalResponseItem {
  type: "mcp_approval_response"
  approval_request_id: string
  approve: boolean
}

export interface MCPAgentState {
  messages: MCPMessage[]
  isLoading: boolean
  error: string | null
  currentProvider: "openai" | "gemini" | "anthropic"
  pendingApprovalRequest: MCPApprovalRequest | null
}

export interface MCPServerConfig {
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
  servers: MCPServerConfig[]
}

export interface OpenAIApprovalRequestItem {
  id: string
  type: "mcp_approval_request"
  arguments: string
  name: string
  server_label: string
}

export interface OpenAIInputTextItem {
  type: "input_text"
  text: string
}
export interface OpenAIUserMessageContentItem {
  role: "user"
  content: OpenAIInputTextItem[]
}

export type OpenAIAPIInputItem = OpenAIUserMessageContentItem | MCPApprovalResponseItem

export interface ApiRouteRequestBody {
  model: string
  stream: boolean
  input?: OpenAIAPIInputItem[]
  message?: string
  tools?: OpenAIMcpTool[]
  temperature?: number
  max_output_tokens?: number
  previous_response_id?: string | null
}
