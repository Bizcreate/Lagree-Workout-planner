// components/scrollable-tabs.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight } from "lucide-react"

/**
 * A horizontally scrollable TabsList wrapper with fade edges + nudge arrows on mobile.
 */
export function ScrollableTabs({
  value,
  onValueChange,
  items,
  className,
  triggerClassName,
}: {
  value: string
  onValueChange: (v: string) => void
  items: { value: string; label: string }[]
  className?: string
  triggerClassName?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  const scrollBy = (dx: number) => {
    if (!ref.current) return
    ref.current.scrollBy({ left: dx, behavior: "smooth" })
  }

  return (
    <Tabs value={value} onValueChange={onValueChange} className={cn("w-full", className)}>
      <div className="relative">
        {/* fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-background to-transparent" />

        {/* optional arrows (shown only on small screens) */}
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollBy(-140)}
          className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full border bg-background/90 p-1 shadow-sm"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollBy(140)}
          className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full border bg-background/90 p-1 shadow-sm"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* scroll track */}
        <div ref={ref} className="overflow-x-auto no-scrollbar hscroll -mx-1 px-1">
          {/* make inner list wider than container so overflow exists */}
          <TabsList className="min-w-max inline-flex gap-2 bg-muted p-1 rounded-md">
            {items.map((it) => (
              <TabsTrigger
                key={it.value}
                value={it.value}
                className={cn(
                  "flex-shrink-0 whitespace-nowrap px-3 py-1 text-xs sm:text-sm",
                  triggerClassName,
                )}
              >
                {it.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>
    </Tabs>
  )
}
