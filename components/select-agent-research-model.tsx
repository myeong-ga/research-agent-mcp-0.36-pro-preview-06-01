"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon, Loader2 } from "lucide-react"
import type { ProviderType } from "@/lib/types"
import { ResearchAgentResearch } from "./research-agent-research"
import { useAgentResearchContext } from "@/contexts/agent-research-context"
import { ThinkingStickerAnimated } from "./thinking-sticker-animated"

export function SelectResearchAgentModel() {
  const { providers, isLoading, getSelectedProvider } = useAgentResearchContext()
  const [selectedProvider, setSelectedProvider] = useState<ProviderType | null>(getSelectedProvider("research"))
  const [hasStarted, setHasStarted] = useState(false)

  const handleProviderSelect = (providerId: ProviderType) => {
    setSelectedProvider(providerId)
  }

  const handleStart = () => {
    if (selectedProvider) {
      setHasStarted(true)
    }
  }

  const getCardStyle = (providerId: string) => {
    switch (providerId) {
      case "openai":
        return {
          backgroundImage: "url('/CoT_Art_1x1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "white",
          position: "relative" as const,
        }
      case "anthropic":
        return {
          backgroundImage: "url('/anthropic.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "white",
          position: "relative" as const,
        }
      default:
        return {}
    }
  }

  const getOverlayClass = (providerId: string) => {
    return providerId === "openai" || providerId === "anthropic"
      ? "before:absolute before:inset-0  before:rounded-lg before:pointer-events-none   dark:before:bg-black/20"
      : ""
  }

  if (hasStarted && selectedProvider) {
    return <ResearchAgentResearch initialProviderId={selectedProvider} />
  }

  if (isLoading) {
    return (
      <div className="container py-8 max-w-3xl mx-auto flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking API availability...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center ">
            <CardTitle className="text-2xl">Select Research Agent Model</CardTitle>
            <ThinkingStickerAnimated className="ml-2" />
          </div>
          <CardDescription>Choose an AI model for your research agent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <Card
                key={provider.id}
                className={`cursor-pointer transition-all flex flex-col ${
                  selectedProvider === provider.id ? "border-primary ring-2 ring-primary ring-opacity-50" : ""
                } ${!provider.isAvailable ? "opacity-50" : ""} ${getOverlayClass(provider.id)}`}
                style={getCardStyle(provider.id)}
                onClick={() => provider.isAvailable && handleProviderSelect(provider.id as ProviderType)}
              >
                <CardHeader className="p-4 pb-2 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        <img
                          src={provider.logoSrc || "/placeholder.svg"}
                          alt={provider.name}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <CardTitle
                        className={`text-lg ${provider.id === "openai" || provider.id === "anthropic" ? "text-white" : ""}`}
                      >
                        {provider.name}
                      </CardTitle>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${provider.id === "openai" || provider.id === "anthropic" ? "text-white hover:bg-white/20" : ""}`}
                            tabIndex={-1}
                          >
                            <InfoIcon className="h-4 w-4" />
                            <span className="sr-only">Info</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p>{provider.description}</p>
                          {!provider.isAvailable && (
                            <p className="text-destructive mt-2">
                              {provider.id === "anthropic"
                                ? "Coming soon in the next iteration"
                                : "API key not configured"}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 relative z-10 flex-1 flex items-end">
                  {selectedProvider === provider.id && (
                    <div
                      className={`text-xs font-medium ${provider.id === "openai" || provider.id === "anthropic" ? "text-white" : "text-primary"}`}
                    >
                      Selected
                    </div>
                  )}
                  {!provider.isAvailable && (
                    <div
                      className={`text-xs ${provider.id === "openai" || provider.id === "anthropic" ? "text-white/70" : "text-muted-foreground"}`}
                    >
                      Not available
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between relative z-10">
                 
                   <p
                    className={`text-sm ${provider.id === "openai" || provider.id === "anthropic" ? "text-white/90" : "text-muted-foreground"}`}
                  >
                    {provider.description.split(".")[0]}.
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleStart} disabled={!selectedProvider} size="lg" className="px-8">
            Start Research
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
