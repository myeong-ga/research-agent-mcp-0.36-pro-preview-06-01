import { InfoIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ModelConfig } from "@/lib/types"

interface ModelConfigDisplayProps {
  config: ModelConfig
  showValues?: boolean
  className?: string
}

export function ModelConfigDisplay({ config, showValues = true, className = "" }: ModelConfigDisplayProps) {
  return (
    <div className={`flex items-center gap-1 text-xs text-muted-foreground ${className}`}>
      <span className="font-mono">
        {showValues ? (
          <>
            T:{config.temperature.toFixed(1)} P:{config.topP && config.topP.toFixed(1)}
          </>
        ) : (
          "Config"
        )}
      </span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="h-3 w-3 cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <div className="space-y-1">
              <div>Temperature: {config.temperature.toFixed(2)}</div>
              <div>Top P: {config.topP && config.topP.toFixed(2)}</div>
              <div>Max Tokens: {config.maxTokens.toLocaleString()}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
