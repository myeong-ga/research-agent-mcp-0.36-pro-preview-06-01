"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SearchSuggestion } from "@/lib/types"

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[]
  reasoning?: string
  confidence?: number | null
  onSuggestionClick: (suggestion: string) => void
}

export function SearchSuggestions({ suggestions, reasoning, confidence, onSuggestionClick }: SearchSuggestionsProps) {
  if (!suggestions.length) return null

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Related searches</CardTitle>
          {confidence && confidence !== null && (
            <Badge variant="outline" className="text-xs">
              Confidence: {(confidence * 100).toFixed(0)}%
            </Badge>
          )}
        </div>
        {reasoning && <CardDescription className="text-xs mt-1">{reasoning}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onSuggestionClick(suggestion.term)}
            >
              {suggestion.term}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
