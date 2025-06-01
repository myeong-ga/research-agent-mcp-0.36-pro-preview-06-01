import { type NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import type { ApiRouteRequestBody } from "@/lib/mcp"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface OpenAIErrorShape {
  status?: number
  error?: {
    message?: string
    type?: string
    param?: string | null
    code?: string | null
  }
}

function isOpenAIError(error: unknown): error is OpenAIErrorShape {
  if (typeof error !== "object" || error === null) return false
  if ("error" in error) {
    const errObj = (error as any).error
    return typeof errObj === "object" && errObj !== null && "message" in errObj
  }
  return false
}

export async function POST(request: NextRequest) {
  try {
    const body: ApiRouteRequestBody = await request.json()
    const { model, tools, temperature, max_output_tokens, stream = true, previous_response_id, input } = body

    const requestPayload: OpenAI.Responses.ResponseCreateParams = {
      model: model || "gpt-4.1-mini",
      stream,
      input: [],
    }

    if (previous_response_id) {
      requestPayload.previous_response_id = previous_response_id
    }

    if (input && Array.isArray(input) && input.length > 0) {
      requestPayload.input = input 
    } else if (!previous_response_id) {
      return NextResponse.json(
        { error: "Invalid request: 'input' array is required for new responses." },
        { status: 400 },
      )
    } else {
      return NextResponse.json(
        { error: "Invalid request: 'input' array with new items is required for continuation." },
        { status: 400 },
      )
    }

    if (tools) {
      requestPayload.tools = tools
    }

    if (temperature !== undefined) requestPayload.temperature = temperature
    if (max_output_tokens !== undefined) requestPayload.max_output_tokens = max_output_tokens

    Object.keys(requestPayload).forEach((key) => {
      const K = key as keyof OpenAI.Responses.ResponseCreateParams
      if (requestPayload[K] === undefined) {
        delete requestPayload[K]
      }
    })

    if (stream) {
      const openAIStream = await openai.responses.create(
        requestPayload as OpenAI.Responses.ResponseCreateParamsStreaming,
      )

      const encoder = new TextEncoder()
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of openAIStream) {
              const data = `data: ${JSON.stringify(event)}\n\n`
              controller.enqueue(encoder.encode(data))
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          } catch (error) {
            console.error("SSE Stream error:", error)
            controller.error(error)
          } finally {
            controller.close()
          }
        },
      })

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } else {
      const response = await openai.responses.create(
        requestPayload as OpenAI.Responses.ResponseCreateParamsNonStreaming,
      )
      return NextResponse.json(response)
    }
  } catch (error) {
    console.error("OpenAI API error in route:", error)
    if (isOpenAIError(error)) {
      return NextResponse.json(
        { error: error.error?.message || "An OpenAI API error occurred" },
        { status: error.status || 500 },
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
