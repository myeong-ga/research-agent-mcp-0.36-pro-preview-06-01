"use client"

import { Toaster as SonnerToaster } from "sonner"

interface CustomToasterProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"
  duration?: number
  className?: string
}

export function CustomToaster({ position = "top-right", duration = 3000, className = "" }: CustomToasterProps) {
  return (
    <SonnerToaster
      position={position}
      toastOptions={{
        duration: duration,
        className: className,
        style: {
          background: "var(--toast-bg-gradient)",
          color: "white",
          border: "none",
        },
      }}
    />
  )
}
