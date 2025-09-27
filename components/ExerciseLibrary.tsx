// components/ExerciseLibrary.tsx
"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWorkoutStore } from "@/lib/store"
import type { Exercise, WorkoutExercise } from "@/lib/types"
import { lagreeExercises } from "@/lib/data"                 // ← from your data.ts
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { POSITION_ORDER, POSITIONS, type PositionKey } from "@/lib/positions"

export function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const { addExerciseToWorkout } = useWorkoutStore()

  const muscleGroups = ["all", "core", "arms", "legs", "back", "glutes", "obliques", "full"]

  const filteredExercises = lagreeExercises.filter((exercise) => {
    const q = searchTerm.toLowerCase()
    const matchesSearch =
      exercise.name.toLowerCase().includes(q) ||
      (exercise.description ?? "").toLowerCase().includes(q) ||
      (exercise.aliases ?? []).some((a) => a.toLowerCase().includes(q))
    const matchesTab = activeTab === "all" || exercise.muscleGroups.includes(activeTab)
    return matchesSearch && matchesTab
  })

  const handleAdd = (exercise: Exercise, position: PositionKey) => {
    const supported = exercise.supportedPositions ?? POSITION_ORDER
    const pos = supported.includes(position) ? position : (supported[0] ?? "standard")

    // Seed initial metrics based on your defaults from data.ts
    const seeded: WorkoutExercise = {
      ...exercise,
      position: pos,
      timeInSeconds: exercise.defaultMetric === "time" ? (exercise.defaultTimeSec ?? 60) : undefined,
      reps: exercise.defaultMetric === "reps" ? (exercise.defaultReps ?? 12) : undefined,
      intensity: exercise.intensity ?? "medium",
    }

    addExerciseToWorkout(seeded)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Exercise Library</CardTitle>
        <CardDescription>Browse and add (choose position)</CardDescription>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6">
            {muscleGroups.map((group) => (
              <TabsTrigger key={group} value={group} className="capitalize">
                {group}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="h-[calc(100vh-350px)] overflow-y-auto">
        <div className="grid grid-cols-1 gap-4">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} onAdd={handleAdd} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No exercises found. Try a different search term.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ExerciseCard({
  exercise,
  onAdd,
}: {
  exercise: Exercise
  onAdd: (ex: Exercise, pos: PositionKey) => void
}) {
  const [pos, setPos] = useState<PositionKey>("standard")
  const allowed = exercise.supportedPositions ?? POSITION_ORDER

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{exercise.name}</CardTitle>
        <div className="flex flex-wrap gap-1 mt-1">
          {exercise.muscleGroups.map((group) => (
            <Badge key={group} variant="secondary" className="capitalize">
              {group}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">{exercise.description}</p>

        <div className="mt-3">
          <label className="text-xs text-muted-foreground">Position</label>
          <Select value={pos} onValueChange={(v) => setPos(v as PositionKey)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Position" /></SelectTrigger>
            <SelectContent>
              {allowed.map((k) => (
                <SelectItem key={k} value={k}>
                  {POSITIONS[k].label} ({POSITIONS[k].short})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={() => onAdd(exercise, pos)} size="sm" className="w-full">
          Add to Workout
        </Button>
      </CardFooter>
    </Card>
  )
}
