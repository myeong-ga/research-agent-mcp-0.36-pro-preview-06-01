"use client"

import { ApiKeyWarning } from "@/components/api-key-warning"
import { DashboardLayout } from "@/components/dashboard-layout"
import {  SelectResearchAgentModel } from "@/components/select-agent-research-model"
import { AgentResearchContextProvider } from "@/contexts/agent-research-context"
import { useLlmProvider } from "@/contexts/llm-provider-context"

export default function SearchPage() {
    const { providers, isLoading } = useLlmProvider()
  
    const missingProviders = {
      google: providers.find((p) => p.id === "gemini")?.isAvailable === false,
      openai: providers.find((p) => p.id === "openai")?.isAvailable === false,
      anthropic: providers.find((p) => p.id === "anthropic")?.isAvailable === false,
    }
    const isAnyProviderMissing = missingProviders.google || missingProviders.openai || missingProviders.anthropic
  
  return (
    <DashboardLayout>
      <div className="container py-1">
        {isAnyProviderMissing && !isLoading && <ApiKeyWarning missingProviders={missingProviders} />}
        <AgentResearchContextProvider>
          <SelectResearchAgentModel />
        </AgentResearchContextProvider>
      </div>
    </DashboardLayout>
  )
}
