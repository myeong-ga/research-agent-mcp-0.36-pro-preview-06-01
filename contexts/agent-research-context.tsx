"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { ProviderInfo, ProviderType, ReasoningType, AgentType, AgentProviderModel } from "@/lib/types"
import { providers as initialProviders } from "@/lib/providers"
import Cookies from "js-cookie"

interface AgentResearchContextType {
  providers: ProviderInfo[]
  isLoading: boolean
  agentProviderModels: AgentProviderModel[]
  checkAvailability: () => Promise<void>
  updateSelectedAgentModel: (agentType: AgentType, providerId: ProviderType, modelId: string) => void
  getSelectedProvider: (agentType: AgentType) => ProviderType | null
  getSelectedAgentModel: (agentType: AgentType, providerId: ProviderType) => string | null
  getReasoningType: (providerId: ProviderType, modelId: string) => ReasoningType
}

const AgentResearchContext = createContext<AgentResearchContextType | undefined>(undefined)

export function AgentResearchContextProvider({ children }: { children: ReactNode }) {
  const [providers, setProviders] = useState<ProviderInfo[]>(initialProviders)
  const [isLoading, setIsLoading] = useState(true)
  const [agentProviderModels, setAgentProviderModels] = useState<AgentProviderModel[]>(() => {
  
    const defaults: AgentProviderModel[] = []
    
    initialProviders.forEach((provider) => {
      //if (provider.isAvailable !== false) {

        const defaultModel = provider.models.find((model) => model.isDefault)
        if (defaultModel) {
          defaults.push({
            agentType: "research",
            providerId: provider.id as ProviderType,
            modelId: defaultModel.id,
            isDefault: provider.id === "gemini", // Make Gemini the default provider for research
          })
        } else if (provider.models.length > 0) {
          defaults.push({
            agentType: "research",
            providerId: provider.id as ProviderType,
            modelId: provider.models[0].id,
            isDefault: provider.id === "gemini",
          })
        }
      //}
    })
    return defaults
  })

  const checkAvailability = async () => {
   
    setIsLoading(true)
    try {
      const response = await fetch("/api/check-availability")
      if (response.ok) {
        const data = await response.json()

        setProviders((currentProviders) =>
          currentProviders.map((provider) => ({
            ...provider,
            isAvailable: data[provider.id] || false,
          })),
        )

        // setAgentProviderModels((current) => {
        //   return current.filter((apm) => providers.find((p) => p.id === apm.providerId)?.isAvailable !== false)
        // })
      }
    } catch (error) {
      console.error("Failed to check API availability:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSelectedAgentModel = (agentType: AgentType, providerId: ProviderType, modelId: string) => {
    setAgentProviderModels((prev) => {
    
      const updated = prev.map((item) => (item.agentType === agentType ? { ...item, isDefault: false } : item))

  
      const existingIndex = updated.findIndex((item) => item.agentType === agentType && item.providerId === providerId)

      if (existingIndex >= 0) {
      
        updated[existingIndex] = {
          ...updated[existingIndex],
          modelId,
          isDefault: true,
        }
      } else {
      
        updated.push({
          agentType,
          providerId,
          modelId,
          isDefault: true,
        })
      }

      return updated
    })

    try {
      const cookieName = `agent_${agentType}_${providerId}_model`
      Cookies.set(cookieName, modelId, { expires: 30 }) // Expires in 30 days
    } catch (error) {
      console.error(`Failed to set cookie for ${agentType} ${providerId} model:`, error)
    }
  }

  const getSelectedProvider = (agentType: AgentType): ProviderType | null => {
    const defaultEntry = agentProviderModels.find((item) => item.agentType === agentType && item.isDefault)
    return defaultEntry?.providerId || null
  }

  const getSelectedAgentModel = (agentType: AgentType, providerId: ProviderType): string | null => {
    const entry = agentProviderModels.find((item) => item.agentType === agentType && item.providerId === providerId)
    return entry?.modelId || null
  }

  const getReasoningType = (providerId: ProviderType, modelId: string): ReasoningType => {
    const provider = providers.find((p) => p.id === providerId)
    if (!provider) return undefined

    const model = provider.models.find((m) => m.id === modelId)
    return model?.reasoningType
  }

  useEffect(() => {
    checkAvailability()
  }, [])

  return (
    <AgentResearchContext.Provider
      value={{
        providers,
        isLoading,
        agentProviderModels,
        checkAvailability,
        updateSelectedAgentModel,
        getSelectedProvider,
        getSelectedAgentModel,
        getReasoningType,
      }}
    >
      {children}
    </AgentResearchContext.Provider>
  )
}

export function useAgentResearchContext() {
  const context = useContext(AgentResearchContext)
  if (context === undefined) {
    throw new Error("useAgentResearchContext must be used within a AgentResearchContextProvider")
  }
  return context
}
