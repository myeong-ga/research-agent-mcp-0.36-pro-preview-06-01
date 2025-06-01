"use client"

import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface ThinkingStickerProps {
  className?: string
}

export function ThinkingStickerAnimated({ className }: ThinkingStickerProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [rotation, setRotation] = useState(3)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev === 3 ? -2 : 3))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full select-none transition-transform duration-1000 ease-in-out",
        isDark
          ? "bg-amber-200 text-red-600"
          : "bg-purple-100 text-purple-800 shadow-[2px_2px_0px_0px_rgba(168,85,247,0.3)]",
        "border-2",
        isDark ? "border-red-600" : "border-purple-300",
        className,
      )}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <span className="relative">
        
        Now Thinking
        <span className="absolute -bottom-[2px] -right-[2px] w-2 h-2 rounded-full animate-pulse"></span>
      </span>
    </div>
  )
}
