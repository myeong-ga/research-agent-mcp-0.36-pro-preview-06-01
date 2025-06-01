import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    gemini: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY, 
  })
}
