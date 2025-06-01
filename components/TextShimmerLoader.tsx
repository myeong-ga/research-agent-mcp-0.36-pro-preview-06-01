'use client';

import { cn } from "@/lib/utils";

export function TextShimmerLoader({
    text = "Waiting for the first token to arrive...",
    className,
    size = "sm",
  }: {
    text?: string
    className?: string
    size?: "sm" | "md" | "lg"
  }) {

    const textSizes = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    }
  

    return (
      <div
      className={cn(
        "relative bg-[length:200%_auto] bg-clip-text font-medium text-transparent animate-shimmer",
        "bg-[linear-gradient(to_right,transparent_5%,var(--foreground)_45%,var(--primary)_55%,transparent_95%)]",
       
        textSizes[size],
        className,
      )}
    >
      {text}
    </div>
    )
    
  }