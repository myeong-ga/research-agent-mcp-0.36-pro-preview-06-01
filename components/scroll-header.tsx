"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface ScrollHeaderProps {
  children: React.ReactNode
}

export default function ScrollHeader({ children }: ScrollHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled ? "shadow-md" : ""}`}>
      {children}
    </div>
  )
}
