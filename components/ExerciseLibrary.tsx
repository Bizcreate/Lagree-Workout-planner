"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { lagreeExercises } from "@/lib/data"
import { useWorkoutStore } from "@/lib/store"

const CATEGORY_ORDER = ["all", "core", "arms", "legs", "back", "glutes", "obliques", "full"] as const
type CategoryKey = (typeof CATEGORY_ORDER)[number]

/* -------------------------------------------------------------------------- */
/*                               Scrollable Bar                               */
/* -------------------------------------------------------------------------- */
function CategoryBar({
  value,
  onChange,
}: { value: "all"|"core"|"arms"|"legs"|"back"|"glutes"|"obliques"|"full"; onChange:(k:any)=>void }) {
  const scroller = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(true)
  const keys = ["all","core","arms","legs","back","glutes","obliques","full"] as const

  const update = () => {
    const el = scroller.current
    if (!el) return
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)
  }
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    update()
    el.addEventListener("scroll", update, { passive: true })
    const ro = new ResizeObserver(update); ro.observe(el)
    return () => { el.removeEventListener("scroll", update); ro.disconnect() }
  }, [])

  const nudge = (dir:"left"|"right") => {
    const el = scroller.current
    if (!el) return
    const amt = Math.max(140, el.clientWidth*0.6)
    el.scrollBy({ left: dir==="left" ? -amt : amt, behavior: "smooth" })
  }

  return (
    <div className="relative">
      <div ref={scroller} className="hscroll no-scrollbar overflow-x-auto" role="tablist">
        <div className="inline-flex min-w-max gap-2 p-1 rounded-md bg-muted">
          {keys.map(k => {
            const active = value === k
            return (
              <button
                key={k}
                onClick={() => onChange(k)}
                className={[
                  "flex-none whitespace-nowrap rounded-md px-3 py-1 text-xs sm:text-sm transition-colors",
                  active ? "bg-background text-foreground shadow"
                         : "text-muted-foreground hover:bg-background/60",
                ].join(" ")}
              >
                {k === "all" ? "All" : k[0].toUpperCase() + k.slice(1)}
              </button>
            )
          })}
        </div>
      </div>

      <div className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent ${atStart?"opacity-0":"opacity-100"}`} />
      <div className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent ${atEnd?"opacity-0":"opacity-100"}`} />

      <button
        aria-label="Scroll left"
        onClick={() => nudge("left")}
        className={`absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-background/80 shadow ${atStart?"opacity-0 pointer-events-none":"opacity-100"}`}
      >‹</button>
      <button
        aria-label="Scroll right"
        onClick={() => nudge("right")}
        className={`absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-background/80 shadow ${atEnd?"opacity-0 pointer-events-none":"opacity-100"}`}
      >›</button>
    </div>
  )
}
/* -------------------------------------------------------------------------- */
/*                                Main Component                              */
/* -------------------------------------------------------------------------- */

export function ExerciseLibrary() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<CategoryKey>("all")
  const [series, setSeries] = useState<string>("all")
  const [equipment, setEquipment] = useState<string>("all")
  const [bothSides, setBothSides] = useState(true)

  // Use as any to avoid breaking if store API names differ slightly
  const workout = useWorkoutStore() as any

  const allSeries = useMemo(() => {
    const s = new Set<string>()
    lagreeExercises.forEach((e) => e.series && s.add(e.series))
    return ["all", ...Array.from(s)]
  }, [])

  const allEquipment = useMemo(() => {
    const s = new Set<string>()
    lagreeExercises.forEach((e) => e.equipment?.forEach((q) => s.add(q)))
    return ["all", ...Array.from(s)]
  }, [])

  const filtered = useMemo(() => {
    return lagreeExercises.filter((ex) => {
      if (search) {
        const q = search.toLowerCase()
        const hit =
          ex.name.toLowerCase().includes(q) ||
          ex.description?.toLowerCase().includes(q) ||
          ex.aliases?.some((a) => a.toLowerCase().includes(q)) ||
          ex.series?.toLowerCase().includes(q)
        if (!hit) return false
      }
      if (category !== "all" && !ex.muscleGroups?.includes(category as any)) return false
      if (series !== "all" && ex.series !== series) return false
      if (equipment !== "all" && !ex.equipment?.includes(equipment)) return false
      return true
    })
  }, [search, category, series, equipment])

  const handleAdd = (ex: any) => {
    const payload = {
      id: ex.id,
      name: ex.name,
      timeInSeconds: ex.defaultTimeSec ?? 40,
      reps: ex.defaultReps,
      position: "standard",
      muscleGroups: ex.muscleGroups,
      notes: ex.description,
    }

    if (bothSides && ex.unilateral) {
      workout?.addExercise?.(payload)
      workout?.addExercise?.({
        id: `${ex.id}-switch`,
        name: "Change Sides",
        description: "Switch sides",
        timeInSeconds: 0,
        position: "standard",
      })
      workout?.addExercise?.(payload)
    } else {
      workout?.addExercise?.(payload)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Library</CardTitle>
        <CardDescription>Browse and add Lagree exercises</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Search */}
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, alias, tag, description..."
        />

        {/* Category (scrollable on mobile, always) */}
        <CategoryBar value={category} onChange={setCategory} />

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select value={series} onValueChange={setSeries}>
            <SelectTrigger>
              <SelectValue placeholder="All series" />
            </SelectTrigger>
            <SelectContent>
              {allSeries.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All series" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        <Select value={equipment} onValueChange={setEquipment}>
            <SelectTrigger>
              <SelectValue placeholder="All equipment" />
            </SelectTrigger>
            <SelectContent>
              {allEquipment.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All equipment" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={bothSides} onCheckedChange={(v) => setBothSides(Boolean(v))} />
            Add both sides for unilateral
          </label>

          <Button variant="outline" className="w-full sm:w-auto" onClick={() => workout?.openCustomExercise?.()}>
            <Plus className="h-4 w-4 mr-2" />
            Custom Exercise
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-4 pt-1">
          {filtered.map((ex) => (
            <Card key={ex.id} className="border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{ex.name}</CardTitle>
                {ex.description && <CardDescription className="pt-1">{ex.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ex.muscleGroups?.map((g: string) => (
                    <Badge key={g} variant="secondary" className="capitalize">
                      {g}
                    </Badge>
                  ))}
                  {ex.series && <Badge variant="outline">{ex.series}</Badge>}
                </div>
                <Button className="w-full sm:w-auto" onClick={() => handleAdd(ex)}>
                  Add to Workout
                </Button>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground pt-4">No exercises match your filters.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
