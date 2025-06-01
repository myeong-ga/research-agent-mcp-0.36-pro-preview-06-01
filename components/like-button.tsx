"use client"

import { useState, useEffect } from "react"
import { ThumbsUp } from "lucide-react"
import confetti from "canvas-confetti"
import { cn } from "@/lib/utils"

interface LikeButtonProps {
  initialCount?: number
}

export function LikeButton({ initialCount = 100 }: LikeButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(false)
  const [isDigitAnimating, setIsDigitAnimating] = useState(false)
  const [isThumbsUpAnimating, setIsThumbsUpAnimating] = useState(false)
  const [digits, setDigits] = useState<string[]>([])

  useEffect(() => {
    const paddedCount = count.toString().padStart(3, "0")
    setDigits(paddedCount.split(""))
  }, [count])

  useEffect(() => {
    const interval = setInterval(
      () => {
        // First animate the thumbs up icon
        setIsThumbsUpAnimating(true)

        // After thumbs up animation, start digit animation
        setTimeout(() => {
          setIsThumbsUpAnimating(false)

          const randomIncrement = Math.floor(Math.random() * 5) + 1
          setCount((prev) => {
            const newCount = prev + randomIncrement
            return newCount > 999 ? 100 : newCount
          })

          setIsDigitAnimating(true)
          setTimeout(() => setIsDigitAnimating(false), 500)
        }, 500) // Wait for thumbs up animation to complete
      },
      Math.floor(Math.random() * 5000) + 8000,
    )

    return () => clearInterval(interval)
  }, [])

  const handleLike = () => {
    if (!liked) {
      setLiked(true)
      setCount((prev) => prev + 1)

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      setTimeout(() => {
        setLiked(false)
      }, 1000)
    }
  }

  return (
    <button
      onClick={handleLike}
      className={cn(
        "flex items-center gap-2 bg-muted/50 hover:bg-muted px-4 py-2 rounded-full transition-colors",
        "cursor-pointer",
        liked && "text-blue-500",
      )}
      aria-label="Like"
    >
      <ThumbsUp className={cn("h-5 w-5", liked && "fill-current", isThumbsUpAnimating && "animate-thumbs-up")} />
      <div className="flex overflow-hidden">
        {digits.map((digit, index) => (
          <div key={index} className="relative w-3 h-5 overflow-hidden">
            <div className={cn("transition-transform duration-500", isDigitAnimating && "animate-digit-spin")}>
              {digit}
            </div>
          </div>
        ))}
      </div>
    </button>
  )
}
