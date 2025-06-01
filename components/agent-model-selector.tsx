"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAgentResearchContext } from "@/contexts/agent-research-context"
import type { ProviderType, AgentType } from "@/lib/types"
import { toast } from "sonner"


// 기존 ModelSelector 는 Provider 별 단일 모델을 지원. LLM chat application 용도.
// AgentModelSelector 는 여러 모델을 지원하는 Agent 용도.

interface AgentModelSelectorProps {
  agentType: AgentType
  providerId: ProviderType
  className?: string
  disabled?: boolean
  onModelChange?: (modelId: string) => void
}

export function AgentModelSelector({
  agentType,
  providerId,
  className,
  disabled = false,
  onModelChange,
}: AgentModelSelectorProps) {
  const { providers, getSelectedAgentModel, updateSelectedAgentModel } = useAgentResearchContext()
  const [open, setOpen] = useState(false)
  const [selectedModelId, setSelectedModelId] = useState<string>("")

  const provider = providers.find((p) => p.id === providerId)
  const models = provider?.models.filter((m)=>m.reasoningType==="Thinking") || []

  useEffect(() => {
    const currentModelId = getSelectedAgentModel(agentType, providerId)
    setSelectedModelId(currentModelId || "")
  }, [agentType, providerId, getSelectedAgentModel])

  if (!provider) {
    return null
  }

  const selectedModel = models.find((model) => model.id === selectedModelId)
  const displayName = selectedModel?.name || "Select model..."

  const handleSelectModel = (value: string) => {
    const model = models.find((m) => m.id === value)
    if (!model) return

    setSelectedModelId(value)
    updateSelectedAgentModel(agentType, providerId, value)

    if (onModelChange) {
      onModelChange(value)
    }

    setOpen(false)

    toast.success(`${provider.name} model changed`, {
      description: `Now using ${model.name}`,
      duration: 3000,
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled || !provider.isAvailable}
        >
          <span className="truncate">{displayName}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" sideOffset={4}>
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {models.map((model) => (
                <div key={model.id} className="cursor-pointer" onClick={() => handleSelectModel(model.id)}>
                  <CommandItem
                    value={model.id}
                    onSelect={handleSelectModel}
                    className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  >
                    <Check className={cn("mr-2 h-4 w-4", selectedModelId === model.id ? "opacity-100" : "opacity-0")} />
                    {model.name}
                  </CommandItem>
                </div>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

