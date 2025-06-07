import type { ProviderInfo } from "./types"


export const providers: ProviderInfo[] = [
    {
    id: "openai",
    name: "OpenAI",
    description: "Creator of ChatGPT and GPT-4, offering powerful language models for various tasks.",
    logoSrc: "/o3o4mini_16x9.png",
    isAvailable: false, // Will be determined by the context
    models: [
      { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", reasoningType: "Intelligence" },
      { id: "gpt-4.1", name: "GPT-4.1", reasoningType: "Intelligence" },
      { id: "o3", name: "o3", reasoningType: "Thinking" ,},
      { id: "o4-mini", name: "o4-mini", reasoningType: "Thinking" , isDefault: true,},
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Google's multimodal AI that can understand and generate text, images, and code.",
    logoSrc: "/google-g-logo.png",
    isAvailable: false, // Will be determined by the context
    models: [
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", reasoningType: "Intelligence" },
      { id: "gemini-2.5-flash-preview-05-20", name: "gemini-2.5-flash-preview-05-20", reasoningType: "Thinking" , isDefault: true,},
      {
        id: "gemini-2.5-pro-preview-06-05",
        name: "gemini-2.5-pro-preview-06-05",
        reasoningType: "Thinking",
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Creator of Claude, focused on AI safety and helpful, harmless, and honest AI assistants.",
    logoSrc: "/anthropic.jpeg",
    isAvailable: false, // Will be determined by the context
    models: [
      { id: "claude-3-5-sonnet-latest", name: "Claude Sonnet 3.5 v2",  reasoningType: "Intelligence" },
      { id: "claude-3-5-sonnet-20240620", name: "Claude Sonnet 3.5",  reasoningType: "Intelligence" },
      { id: "claude-3-7-sonnet-latest", name: "Claude Sonnet 3.7", reasoningType: "Thinking", },
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4",  reasoningType: "Thinking", isDefault: true, },
      { id: "claude-opus-4-20250514", name: "Claude Opus 4",  reasoningType: "Thinking" },
    ],
  },
]
