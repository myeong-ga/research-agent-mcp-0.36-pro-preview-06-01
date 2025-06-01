import { GOOGLE_SYSTEM_PROMPT } from "@/lib/system-prompt"
import { google } from "@ai-sdk/google"
import { streamText } from "ai"
import type { NextRequest } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return new Response(JSON.stringify({ error: "No prompt provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    let metadata: any = null
    let groundingMetadata: any = null

    // Use streamText with onFinish to capture the metadata
    const result = streamText({
      model: google("gemini-2.5-flash-preview-04-17", {
        useSearchGrounding: true,
      }),
      system: `${GOOGLE_SYSTEM_PROMPT}
      As part of your reasoning process, you must carefully review the results from the native web search. Based on the key topics, frequently mentioned concepts, and emerging trends identified in those results, generate a JSON object containing recommended search terms that you believe would be most helpful or relevant for the user to explore next.
              This JSON object should be in the following format:
      
              {
              "searchTerms": ["term1", "term2", "term3"],
              "confidence": 0.8,
              "reasoning": "Brief explanation of why these terms were selected"
              }
      
              Include this JSON object in your response, surrounded by triple backticks and labeled as "SEARCH_TERMS_JSON".
              For example:
      
              \`\`\`SEARCH_TERMS_JSON
              {
              "searchTerms": ["quantum computing", "qubits", "superposition"],
              "confidence": 0.9,
              "reasoning": "These terms cover the core concepts of quantum computing"
              }
              \`\`\`
      When crafting your recommendations:
      
      Only suggest terms directly derived from or strongly related to the web search results you reviewed.
      Prioritize terms that appeared multiple times, showed up in authoritative sources, or represent meaningful directions for further exploration.
      The reasoning field must clearly explain the connection between the search results and the recommended terms.
      After providing this JSON, continue with your normal response to the user's query.`,
      prompt,
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: 3000,
            includeThoughts: true,
          },
        },
      },
     
      temperature: 0.4,
      maxTokens: 4000,
      onChunk: ({ chunk }) => {
        // Stream text chunks in real-time to the client
        if (chunk.type === "reasoning") {
          console.log("reasoning chunk:",chunk.textDelta)
          //dataStream.writeData({ type: "text-delta", text: chunk.textDelta })
        }
      },
      onFinish: ({ providerMetadata }) => {
        metadata = providerMetadata
        // Try to extract the groundingMetadata
        if (providerMetadata && typeof providerMetadata === "object") {
          const googleMetadata = providerMetadata as any
          if (googleMetadata.google && googleMetadata.google.groundingMetadata) {
            groundingMetadata = googleMetadata.google.groundingMetadata
          }
        }
      },
    })

    // Consume the stream to ensure onFinish is called
    let fullText = ""
    for await (const chunk of result.textStream) {
      fullText += chunk
    }

    // Return the metadata and text
    return new Response(
      JSON.stringify({
        text: fullText,
        fullMetadata: metadata,
        groundingMetadata,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error in debug API:", error)
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
