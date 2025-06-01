import { ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Source } from "@/lib/types"

interface SourcesListProps {
  sources: Source[]
}

export function SourcesList({ sources }: SourcesListProps) {
  if (!sources.length) return null

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Sources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sources.map((source, index) => (
          <div key={index} className="text-sm">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 hover:underline text-blue-600 dark:text-blue-400 font-mono"
            >
              <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">{source.title || new URL(source.url).hostname}</div>
              </div>
            </a>
            {source.cited_text && (
              <div className="mt-2 pl-6 text-xs border-l-2 border-muted-foreground/30 text-muted-foreground whitespace-pre-line">
                {source.cited_text}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
