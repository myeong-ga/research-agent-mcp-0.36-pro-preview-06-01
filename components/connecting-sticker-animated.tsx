"use client"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface ConnectingStickerProps {
  className?: string
}

export function ConnectingStickerAnimated({ className }: ConnectingStickerProps) {
  // const { theme } = useTheme(); // Not strictly needed if colors are hardcoded for both modes
  const [rotation, setRotation] = useState(2) // Slightly different initial rotation

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev === 2 ? -1.5 : 2)) // Slightly different rotation range
    }, 400) // Slightly different interval

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center px-3 py-1 text-xs font-bold rounded-full select-none transition-all duration-250 ease-in-out animate-pulse",
        "bg-[#FEF3C7] text-[#D90429]", // Yellow background, Red text
        "border-2 border-[#D90429]", // Red border
        "shadow-[2px_2px_0px_0px_rgba(217,4,41,0.4)]", // Red shadow
        "hover:scale-105", // 호버 시 스케일 효과 추가
        className,
      )}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-label="Now Connecting"
    >
      <span className="relative">
        {/* Optional: subtle text shadow or glow if needed, but keeping it simple for now */}
        {/* <span className="absolute -top-0.5 -left-0.5 w-full h-full blur-[0.25px] opacity-60 text-red-300">Now Connecting</span> */}
        Now Connecting
        <span className="absolute -bottom-[2px] -right-[2px] w-2 h-2 rounded-full bg-white/60 animate-ping"></span>
      </span>
    </div>
  )
}
