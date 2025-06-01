"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ApiKeyWarningProps {
  missingProviders: {
    google?: boolean
    openai?: boolean
    anthropic?: boolean
  }
}

export function ApiKeyWarning({ missingProviders }: ApiKeyWarningProps) {
  const [dismissed, setDismissed] = useState(false)

  const isGoogleMissing = missingProviders.google
  const isOpenAIMissing = missingProviders.openai
  const isAnthropicMissing = missingProviders.anthropic

  if (dismissed) return null

  // Count how many providers are missing
  const missingCount = [isGoogleMissing, isOpenAIMissing, isAnthropicMissing].filter(Boolean).length

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Missing API Keys</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          {missingCount === 3
            ? "All API keys (Google, OpenAI, and Anthropic) are missing."
            : missingCount === 2
              ? `${isGoogleMissing ? "Google" : ""}${isGoogleMissing && isOpenAIMissing ? " and " : ""}${
                  isOpenAIMissing ? "OpenAI" : ""
                }${isGoogleMissing && isAnthropicMissing ? " and " : ""}${
                  isOpenAIMissing && isAnthropicMissing ? " and " : ""
                }${isAnthropicMissing ? "Anthropic" : ""} API keys are missing.`
              : `${isGoogleMissing ? "Google" : ""}${isOpenAIMissing ? "OpenAI" : ""}${
                  isAnthropicMissing ? "Anthropic" : ""
                } API key is missing.`}{" "}
          The comparison chatbot requires API keys to function correctly.
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button size="sm" variant="outline" onClick={() => setDismissed(true)}>
            Dismiss
          </Button>
          {isGoogleMissing && (
            <Button size="sm" onClick={() => window.open("https://ai.google.dev/", "_blank")}>
              Get Google API Key
            </Button>
          )}
          {isOpenAIMissing && (
            <Button size="sm" onClick={() => window.open("https://platform.openai.com/", "_blank")}>
              Get OpenAI API Key
            </Button>
          )}
          {isAnthropicMissing && (
            <Button size="sm" onClick={() => window.open("https://console.anthropic.com/", "_blank")}>
              Get Anthropic API Key
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
