"use client"
import { MCPAgentDemo } from "@/components/mcp-agent-demo"
import { AgentMcpProvider } from "@/contexts/agent-mcp-context"

export default function StorePage() {
  return  <AgentMcpProvider><MCPAgentDemo /></AgentMcpProvider>
}
