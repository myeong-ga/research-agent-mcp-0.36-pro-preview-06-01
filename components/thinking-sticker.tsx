"use client"

import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface ThinkingStickerProps {
  className?: string
}

export function ThinkingSticker({ className }: ThinkingStickerProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full transform rotate-3 select-none",
        isDark
          ? "bg-purple-900 text-purple-100 shadow-[2px_2px_0px_0px_rgba(168,85,247,0.4)]"
          : "bg-purple-100 text-purple-800 shadow-[2px_2px_0px_0px_rgba(168,85,247,0.3)]",
        "border-2",
        isDark ? "border-purple-700" : "border-purple-300",
        className,
      )}
    >
      <span className="relative">
        <span className="absolute -top-1 -left-1 w-full h-full blur-[0.5px] opacity-70 text-purple-400">Now Think</span>
        Now Thinking
        <span className="absolute -bottom-[2px] -right-[2px] w-2 h-2 rounded-full bg-white/50"></span>
      </span>
    </div>
  )
}
