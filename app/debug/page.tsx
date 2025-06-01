"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SearchTermsOutput {
  searchTerms: string[]
  confidence: number
  reasoning: string
}

export default function DebugPage() {
  const [prompt, setPrompt] = useState("")
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerms, setSearchTerms] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return

    await fetchDebugResponse(prompt)
  }

  const fetchDebugResponse = async (queryPrompt: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: queryPrompt }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch response")
      }

      const data = await response.json()
      setResult(data)

      // Extract search terms from the response
      extractSearchTerms(data.text)
    } catch (error) {
      console.error("Error:", error)
      setResult({ error: "Failed to process request" })
      setSearchTerms([])
    } finally {
      setIsLoading(false)
    }
  }

  // Function to extract search terms from the response text
  const extractSearchTerms = (text: string) => {
    try {
      // Look for the JSON pattern in the text
      const jsonMatch = text.match(/```SEARCH_TERMS_JSON\s*([\s\S]*?)\s*```/)

      if (jsonMatch && jsonMatch[1]) {
        try {
          const searchTermsJson = JSON.parse(jsonMatch[1].trim()) as SearchTermsOutput
          setSearchTerms(searchTermsJson.searchTerms || [])
          console.log("Extracted search terms:", searchTermsJson.searchTerms)
          return
        } catch (parseError) {
          console.error("Failed to parse search terms JSON:", parseError)
        }
      }

      // If no JSON found, try to find any JSON-like structure
      const anyJsonMatch = text.match(/\{[\s\S]*"searchTerms"[\s\S]*\}/)
      if (anyJsonMatch) {
        try {
          const searchTermsJson = JSON.parse(anyJsonMatch[0]) as SearchTermsOutput
          setSearchTerms(searchTermsJson.searchTerms || [])
          console.log("Extracted search terms from general JSON:", searchTermsJson.searchTerms)
          return
        } catch (parseError) {
          console.error("Failed to parse general JSON:", parseError)
        }
      }

      // If still no search terms, set empty array
      setSearchTerms([])
    } catch (error) {
      console.error("Error extracting search terms:", error)
      setSearchTerms([])
    }
  }

  // Handle clicking on a search term button
  const handleSearchTermClick = (term: string) => {
    setPrompt(term)
    fetchDebugResponse(term)
  }

  return (
    <div className="container py-8 w-[80%] mx-auto" >
      <h1 className="text-2xl font-bold mb-4">Debug Grounding Metadata</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-1">
            Prompt
          </label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt that would trigger search grounding..."
            className="min-h-24"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : "Submit"}
        </Button>
      </form>

      {searchTerms.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Recommended Search Terms</h2>
          <div className="flex flex-wrap gap-2">
            {searchTerms.map((term, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSearchTermClick(term)}
                className="flex items-center gap-1"
              >
                <span>{term}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Text</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">{result.text}</pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grounding Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm overflow-auto max-h-96">
                {JSON.stringify(result.groundingMetadata, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Full Provider Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm overflow-auto max-h-96">
                {JSON.stringify(result.fullMetadata, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
