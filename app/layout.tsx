import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import { ThemeProvider } from "@/components/theme-provider"
import { LlmProviderContextProvider } from "@/contexts/llm-provider-context"
import { Toaster } from "sonner"
import { CustomToaster } from "@/components/custom-toaster"
import { AgentResearchContextProvider } from "@/contexts/agent-research-context";



export const metadata: Metadata = {

  title: {
    default: "AI Search Model Comparison",
    template: "%s | CS Studio",
  },
  description: "Compare search results from Google Gemini and OpenAI side by side",
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: { url: "/apple-icon.png", type: "image/png", sizes: "180x180" },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <head>
        <link href="//spoqa.github.io/spoqa-han-sans/css/SpoqaHanSansNeo.css" rel="stylesheet" type="text/css" />
      </head>
      <body className={GeistSans.className}  suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <LlmProviderContextProvider>
          <AgentResearchContextProvider>
            <div className="min-h-screen flex flex-col">
              <header className="border-b">
               
              </header>
              <main className="flex-1">{children}</main>
            </div>
            <CustomToaster />
            </AgentResearchContextProvider>
          </LlmProviderContextProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
