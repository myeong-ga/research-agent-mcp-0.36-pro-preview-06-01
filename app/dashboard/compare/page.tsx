"use client"

import { SelectChatModel } from "@/components/select-chat-model"
import { ApiKeyWarning } from "@/components/api-key-warning"
import { LlmProviderContextProvider, useLlmProvider } from "@/contexts/llm-provider-context"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function Home() {
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
         <LlmProviderContextProvider>
          <SelectChatModel />
         </LlmProviderContextProvider>
      </div>
    </DashboardLayout>
  )
}



