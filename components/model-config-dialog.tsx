"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Settings } from "lucide-react"
import type { ModelConfig } from "@/lib/types"
import { DEFAULT_MODEL_CONFIG } from "@/lib/models"

interface ModelConfigDialogProps {
  config: ModelConfig
  onConfigChange: (config: ModelConfig, showToast?: boolean) => void
  disabled?: boolean
  buttonClassName?: string
}

export function ModelConfigDialog({
  config,
  onConfigChange,
  disabled = false,
  buttonClassName = "",
}: ModelConfigDialogProps) {
  const [open, setOpen] = useState(false)
  const [localConfig, setLocalConfig] = useState<ModelConfig>(config)

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (open) {
      setLocalConfig(config)
    }
  }

  const handleTemperatureChange = (value: number[]) => {
    setLocalConfig((prev) => ({ ...prev, temperature: value[0] }))
  }

  const handleTopPChange = (value: number[]) => {
    setLocalConfig((prev) => ({ ...prev, topP: value[0] }))
  }

  const handleMaxTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setLocalConfig((prev) => ({ ...prev, maxTokens: value }))
    }
  }

  const handleSave = () => {
    onConfigChange(localConfig, true)
    setOpen(false)
  }

  const handleReset = () => {
    const defaultConfig = {
      ...DEFAULT_MODEL_CONFIG,
      temperature: 0.4,
      topP: 0.95,
    }
    setLocalConfig(defaultConfig)
    onConfigChange(defaultConfig, false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${buttonClassName}`}
          disabled={disabled}
          title="Model Configuration"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Model Configuration</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Model Configuration</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature">Temperature: {localConfig.temperature.toFixed(2)}</Label>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.01}
              value={[localConfig.temperature]}
              onValueChange={handleTemperatureChange}
            />
            <div className="text-xs text-muted-foreground">
              Controls randomness: Lower values are more deterministic, higher values are more creative.
            </div>
          </div>
          { localConfig.topP !== undefined && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="topP">Top P: {localConfig.topP.toFixed(2)}</Label>
                </div>
                <Slider id="topP" min={0} max={1} step={0.01} value={[localConfig.topP]} onValueChange={handleTopPChange} />
                <div className="text-xs text-muted-foreground">
                  Controls diversity: Lower values consider only the most likely tokens, higher values consider a wider
                  range.
                </div>
              </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="maxTokens">Max Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              value={localConfig.maxTokens}
              onChange={handleMaxTokensChange}
              min={1}
              max={32000}
            />
            <div className="text-xs text-muted-foreground">
              Maximum number of tokens to generate. Higher values allow for longer responses.
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
