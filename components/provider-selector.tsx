"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useLlmProvider } from "@/contexts/llm-provider-context"
import type { ProviderType } from "@/lib/types"
import { toast } from "sonner"

interface ProviderSelectorProps {
  selectedProvider: ProviderType
  onProviderChange: (providerId: ProviderType) => void
  className?: string
  disabled?: boolean
}

export function ProviderSelector({
  selectedProvider,
  onProviderChange,
  className,
  disabled = false,
}: ProviderSelectorProps) {
  const { providers } = useLlmProvider()
  const [open, setOpen] = useState(false)

  const availableProviders = providers.filter((p) => p.isAvailable)

  const selectedProviderInfo = providers.find((p) => p.id === selectedProvider)
  const displayName = selectedProviderInfo?.name || "Select provider..."

  const handleSelectProvider = (value: string) => {
    const provider = providers.find((p) => p.id === value)
    if (!provider || !provider.isAvailable) return

    onProviderChange(value as ProviderType)
    setOpen(false)

    toast.success(`Provider changed`, {
      description: `Now using ${provider.name}`,
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
          disabled={disabled}
        >
          <span className="truncate">{displayName}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" sideOffset={4}>
        <Command>
          <CommandInput placeholder="Search providers..." />
          <CommandList>
            <CommandEmpty>No provider found.</CommandEmpty>
            <CommandGroup>
              {availableProviders.map((provider) => (
                <div key={provider.id} className="cursor-pointer" onClick={() => handleSelectProvider(provider.id)}>
                  <CommandItem
                    value={provider.id}
                    onSelect={handleSelectProvider}
                    className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", selectedProvider === provider.id ? "opacity-100" : "opacity-0")}
                    />
                    <div className="flex items-center">
                      <div className="w-6 h-6 mr-2 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        <img
                          src={provider.logoSrc || "/placeholder.svg"}
                          alt={provider.name}
                          className="w-4 h-4 object-contain"
                        />
                      </div>
                      {provider.name}
                    </div>
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
