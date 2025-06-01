"use client"

import { MCPControlSection } from "./mcp-control-section"
import { MCPDemoSection } from "./mcp-demo-section"

export function MCPAgentDemo() {
  return (
    <div className="container mx-auto p-4 max-w-6xl h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <MCPControlSection className="md:col-span-1" />
        <MCPDemoSection className="md:col-span-2" />
      </div>
    </div>
  )
}
