// components/ExerciseLibrary.tsx
"use client"

import { useMemo, useState } from "react"
import { Search, Plus } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

import { ScrollableTabs } from "@/components/scrollable-tabs"

import { lagreeExercises } from "@/lib/data"
import type { Exercise } from "@/lib/types"
import { useWorkoutStore } from "@/lib/store"

/* ------------------------------ Categories ------------------------------- */

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
type Category = (typeof CATEGORY_ITEMS)[number]["value"]

/* ------------------------------ Component -------------------------------- */

export function ExerciseLibrary() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<Category>("all")
  const [series, setSeries] = useState<string>("__all__")
  const [equipment, setEquipment] = useState<string>("__all__")
  const [bothSides, setBothSides] = useState(true)

  // NOTE: store method names vary across codebases; we call the first one that exists.
  const store = useWorkoutStore() as any
  const addToPlan = (ex: Exercise) => {
    const add =
      store?.addExercise ??
      store?.addExerciseToPlan ??
      store?.addToPlan ??
      store?.append ??
      (() => {})
    add(ex)
  }

  /* ------------------------------ Facets --------------------------------- */

  const seriesOptions = useMemo(() => {
    const s = new Set<string>()
    lagreeExercises.forEach((e) => e.series && s.add(e.series))
    return ["__all__", ...Array.from(s).sort()]
  }, [])

  const equipmentOptions = useMemo(() => {
    const s = new Set<string>()
    lagreeExercises.forEach((e) => e.equipment?.forEach((eq) => s.add(eq)))
    return ["__all__", ...Array.from(s).sort()]
  }, [])

  /* ------------------------------ Filtered list -------------------------- */

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    return lagreeExercises.filter((e) => {
      // category
      if (category !== "all" && !e.muscleGroups?.includes(category as any)) return false

      // series
      if (series !== "__all__" && e.series !== series) return false

      // equipment
      if (equipment !== "__all__" && !(e.equipment || []).includes(equipment)) return false

      // text query
      if (q) {
        const hay = [
          e.name,
          e.description,
          ...(e.aliases || []),
          ...(e.tags || []),
          e.series || "",
        ]
          .join(" ")
          .toLowerCase()
        if (!hay.includes(q)) return false
      }

      return true
    })
  }, [query, category, series, equipment])

  /* --------------------------------- JSX --------------------------------- */

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl">Exercise Library</CardTitle>
        <CardDescription>Browse and add Lagree exercises</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, alias, tag, description..."
            className="pl-9"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Category (h-scroll tabs) */}
        <ScrollableTabs
          value={category}
          onValueChange={(v) => setCategory(v as Category)}
          items={CATEGORY_ITEMS as any}
        />

        {/* Filters: series + equipment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select value={series} onValueChange={setSeries}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All series" />
            </SelectTrigger>
            <SelectContent>
              {seriesOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "__all__" ? "All series" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={equipment} onValueChange={setEquipment}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All equipment" />
            </SelectTrigger>
            <SelectContent>
              {equipmentOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "__all__" ? "All equipment" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Both sides + Custom Exercise button */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={bothSides} onCheckedChange={(v) => setBothSides(Boolean(v))} />
            Add both sides for unilateral
          </label>

          <Button variant="outline" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Custom Exercise
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No exercises match your filters.
            </div>
          )}

          <ScrollArea className="h-auto">
            <div className="space-y-4">
              {filtered.map((e) => (
                <Card key={e.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{e.name}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      {e.muscleGroups?.map((g) => (
                        <Badge key={g} variant="secondary" className="capitalize">
                          {g}
                        </Badge>
                      ))}
                      {e.series && (
                        <Badge variant="outline" className="capitalize">
                          {e.series}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {e.description && (
                      <p className="text-sm text-muted-foreground">{e.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => {
                          // if user wants both sides and the exercise supports it,
                          // you may insert two entries; most planners handle this elsewhere.
                          addToPlan(e)
                          if (bothSides && e.unilateral) addToPlan(e)
                        }}
                      >
                        Add to Workout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}

export default ExerciseLibrary
