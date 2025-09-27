// components/ExerciseLibraryHeader.tsx
"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  /** current category key, e.g. "all" | "core" | ... */
  category: string
  onCategoryChange: (v: string) => void

  /** select values + change handlers for filters */
  seriesValue: string
  onSeriesChange: (v: string) => void
  equipmentValue: string
  onEquipmentChange: (v: string) => void

  /** unilateral toggle + change handler */
  addBothSides: boolean
  onToggleBothSides: (v: boolean) => void

  onCustomExercise: () => void
  /** Optional extra className for outer wrapper */
  className?: string
}

const CATEGORY_ITEMS = [
  { value: "all", label: "All" },
  { value: "core", label: "Core" },
  { value: "arms", label: "Arms" },
  { value: "legs", label: "Legs" },
  { value: "back", label: "Back" },
  { value: "glutes", label: "Glutes" },
  { value: "obliques", label: "Obliques" },
  { value: "full", label: "Full" },
] as const

export function ExerciseLibraryHeader({
  category,
  onCategoryChange,
  seriesValue,
  onSeriesChange,
  equipmentValue,
  onEquipmentChange,
  addBothSides,
  onToggleBothSides,
  onCustomExercise,
  className,
}: Props) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Horizontally scrollable category tabs */}
      <Tabs value={category} onValueChange={onCategoryChange} className="w-full">
        <div className="-mx-3 sm:mx-0">
          <TabsList
            className={cn(
              // key mobile bits:
              "w-full flex overflow-x-auto no-scrollbar p-1 gap-2",
              // keep the shadcn look
              "rounded-md bg-muted text-muted-foreground"
            )}
            aria-label="Exercise categories"
          >
            {CATEGORY_ITEMS.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className={cn(
                  "flex-shrink-0 whitespace-nowrap px-3 py-1 text-xs sm:text-sm",
                  "data-[state=active]:bg-background data-[state=active]:text-foreground"
                )}
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {/* Filters: stack on mobile, two columns on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Series */}
        <Select value={seriesValue} onValueChange={onSeriesChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All series" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All series</SelectItem>
            <SelectItem value="plank">Plank</SelectItem>
            <SelectItem value="wheelbarrow">Wheelbarrow</SelectItem>
            <SelectItem value="saw">Saw</SelectItem>
            <SelectItem value="bear">Bear</SelectItem>
            <SelectItem value="catfish">Catfish</SelectItem>
            <SelectItem value="lunge">Lunge</SelectItem>
            <SelectItem value="abs">Abs</SelectItem>
            <SelectItem value="glutes">Glutes</SelectItem>
            <SelectItem value="hamstrings">Hamstrings</SelectItem>
            <SelectItem value="quads">Quads</SelectItem>
            {/* …add any others you support */}
          </SelectContent>
        </Select>

        {/* Equipment */}
        <Select value={equipmentValue} onValueChange={onEquipmentChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All equipment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All equipment</SelectItem>
            <SelectItem value="micro">Micro</SelectItem>
            <SelectItem value="micro-pro">Micro Pro</SelectItem>
            <SelectItem value="mini">Mini</SelectItem>
            <SelectItem value="mini-pro">Mini Pro</SelectItem>
            <SelectItem value="mega">Mega</SelectItem>
            <SelectItem value="mega-pro">Mega Pro</SelectItem>
            <SelectItem value="megaformer">Megaformer</SelectItem>
            <SelectItem value="floor">Floor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Unilateral toggle + Custom Exercise; stacks on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
        <label className="inline-flex items-center gap-3 text-sm">
          <Checkbox checked={addBothSides} onCheckedChange={(v) => onToggleBothSides(Boolean(v))} />
          <span>Add both sides for unilateral</span>
        </label>

        <Button onClick={onCustomExercise} className="w-full sm:w-auto" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Custom Exercise
        </Button>
      </div>
    </div>
  )
}
