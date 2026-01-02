"use client"

import { useState, useEffect } from "react"
import { Clock, PlayCircle, Search, Trash2, Info, Database } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WorkoutPresentation } from "@/components/workout-presentation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useSavedWorkoutsStore } from "@/lib/saved-workouts-store"
import { useWorkoutStore } from "@/lib/store"
import type { SavedWorkout, WorkoutExercise } from "@/lib/types"
import { supabase } from "@/lib/supabase"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SupabaseWorkout {
  id: string
  name: string
  description: string | null
  is_preset: boolean
  created_at: string
  workout_exercises: Array<{
    id: string
    exercise_name: string
    description: string
    muscle_groups: string[]
    time_seconds: number | null
    holds: number | null
    pulses: number | null
    notes: string | null
    sequence_order: number
  }>
}

/** Ensure older saved items have the fields our planner/presentation expect */
function normalizeExercises(list: WorkoutExercise[]): WorkoutExercise[] {
  return list.map((e, i) => ({
    ...e,
    id: e.id ?? `${e.name}-${i}`,
    position: e.position ?? "standard",
    timeInSeconds: e.timeInSeconds ?? 0,
  }))
}

function convertSupabaseWorkout(sw: SupabaseWorkout): SavedWorkout {
  return {
    id: sw.id,
    name: sw.name,
    createdAt: new Date(sw.created_at).getTime(),
    exercises: sw.workout_exercises
      .sort((a, b) => a.sequence_order - b.sequence_order)
      .map((we) => ({
        id: we.id,
        name: we.exercise_name,
        description: we.description,
        muscleGroups: we.muscle_groups,
        timeInSeconds: we.time_seconds || 0,
        reps: we.holds || we.pulses || undefined,
        notes: we.notes || undefined,
      })),
  }
}

export function MyWorkouts() {
  const { savedWorkouts, deleteWorkout } = useSavedWorkoutsStore()
  const { addExerciseToWorkout, clearWorkout } = useWorkoutStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWorkout, setSelectedWorkout] = useState<SavedWorkout | null>(null)
  const [isViewWorkoutOpen, setIsViewWorkoutOpen] = useState(false)
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [presetWorkouts, setPresetWorkouts] = useState<SavedWorkout[]>([])
  const [isLoadingPresets, setIsLoadingPresets] = useState(true)

  useEffect(() => {
    async function fetchPresetWorkouts() {
      console.log("[v0] Fetching preset workouts from Supabase...")
      try {
        const { data, error } = await supabase
          .from("workouts")
          .select(`
            id,
            name,
            description,
            is_preset,
            created_at,
            workout_exercises (
              id,
              exercise_name,
              description,
              muscle_groups,
              time_seconds,
              holds,
              pulses,
              notes,
              sequence_order
            )
          `)
          .eq("is_preset", true)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("[v0] Error fetching preset workouts:", error)
          return
        }

        console.log("[v0] Fetched preset workouts:", data)
        if (data) {
          const converted = data.map(convertSupabaseWorkout)
          setPresetWorkouts(converted)
          console.log("[v0] Converted to SavedWorkout format:", converted)
        }
      } catch (err) {
        console.error("[v0] Exception fetching presets:", err)
      } finally {
        setIsLoadingPresets(false)
      }
    }

    fetchPresetWorkouts()
  }, [])

  const filteredLocalWorkouts = savedWorkouts.filter((w) => w.name.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredPresetWorkouts = presetWorkouts.filter((w) => w.name.toLowerCase().includes(searchTerm.toLowerCase()))

  /** Replace current planner contents with these exercises */
  const replacePlan = (exs: WorkoutExercise[]) => {
    const normalized = normalizeExercises(exs)
    clearWorkout()
    normalized.forEach((ex) => {
      addExerciseToWorkout({
        ...ex,
        position: ex.position ?? "standard",
      })
    })
  }

  const handleStartWorkout = (workout: SavedWorkout) => {
    replacePlan(workout.exercises)
    setIsPresentationMode(true)
  }

  const handleViewWorkout = (workout: SavedWorkout) => {
    setSelectedWorkout(workout)
    setIsViewWorkoutOpen(true)
  }

  const handleLoadWorkout = (workout: SavedWorkout) => {
    replacePlan(workout.exercises)
    setIsViewWorkoutOpen(false)
  }

  const calculateTotalTime = (exs: WorkoutExercise[]) =>
    exs.reduce((total, ex) => {
      if (ex.name === "Change Sides" || ex.name === "Repeat on Other Side") return total
      return total + (ex.timeInSeconds || 0)
    }, 0)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const renderWorkoutCard = (workout: SavedWorkout, isPreset = false) => {
    const totalTime = calculateTotalTime(workout.exercises)
    const regularExerciseCount = workout.exercises.filter(
      (ex) => ex.name !== "Change Sides" && ex.name !== "Repeat on Other Side",
    ).length

    return (
      <Card key={workout.id} className="hover:border-primary/50 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{workout.name}</CardTitle>
            {isPreset && (
              <Badge variant="secondary" className="ml-2">
                Preset
              </Badge>
            )}
          </div>
          <CardDescription>
            {isPreset ? "Official Lagree Workout" : `Created on ${new Date(workout.createdAt).toLocaleDateString()}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{formatTime(totalTime)}</span>
            <Badge variant="outline" className="ml-auto">
              {regularExerciseCount} exercises
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {workout.exercises
              .filter((ex) => ex.name !== "Change Sides" && ex.name !== "Repeat on Other Side")
              .slice(0, 3)
              .map((ex) => ex.name)
              .join(", ")}
            {regularExerciseCount > 3 ? ` and ${regularExerciseCount - 3} more...` : ""}
          </p>
        </CardContent>

        <CardFooter className="pt-2">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent"
              onClick={() => handleViewWorkout(workout)}
            >
              <Info className="h-4 w-4 mr-2" />
              Details
            </Button>
            <Button variant="default" size="sm" className="flex-1" onClick={() => handleStartWorkout(workout)}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Start
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <div className="relative mt-2">
              <Input
                placeholder="Search workouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="presets" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="presets" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Preset Workouts ({presetWorkouts.length})
                </TabsTrigger>
                <TabsTrigger value="my-workouts">My Workouts ({savedWorkouts.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="presets">
                {isLoadingPresets ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading preset workouts...</p>
                  </div>
                ) : filteredPresetWorkouts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPresetWorkouts.map((workout) => renderWorkoutCard(workout, true))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-2">No preset workouts found</p>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? "Try a different search term" : "Check your database connection"}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="my-workouts">
                {filteredLocalWorkouts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLocalWorkouts.map((workout) => renderWorkoutCard(workout, false))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-2">No saved workouts found</p>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm
                        ? "Try a different search term"
                        : "Create and save workouts in the Workout Planner tab"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Workout Details Dialog */}
      <Dialog open={isViewWorkoutOpen} onOpenChange={setIsViewWorkoutOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedWorkout?.name}</DialogTitle>
            <DialogDescription>
              Created on {selectedWorkout && new Date(selectedWorkout.createdAt).toLocaleDateString()} • Total time:{" "}
              {selectedWorkout && formatTime(calculateTotalTime(selectedWorkout.exercises))}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Exercises</h3>
              <Badge variant="outline">
                {
                  selectedWorkout?.exercises.filter(
                    (ex) => ex.name !== "Change Sides" && ex.name !== "Repeat on Other Side",
                  ).length
                }{" "}
                exercises
              </Badge>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {selectedWorkout?.exercises.map((exercise, index) => {
                  const isInstruction = exercise.name === "Change Sides" || exercise.name === "Repeat on Other Side"

                  return (
                    <div
                      key={`${exercise.id ?? exercise.name}-${index}`}
                      className={`border rounded-md p-4 ${isInstruction ? "bg-muted/50 border-dashed" : ""}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-mono">{index + 1}</span>
                          <h4 className="font-medium">{exercise.name}</h4>
                        </div>

                        {!isInstruction && (
                          <div className="flex items-center gap-2">
                            {exercise.timeInSeconds != null && (
                              <Badge variant="secondary">{formatTime(exercise.timeInSeconds)}</Badge>
                            )}
                            {exercise.reps != null && <Badge variant="outline">{exercise.reps} reps</Badge>}
                          </div>
                        )}
                      </div>

                      {!isInstruction ? (
                        <>
                          {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {exercise.muscleGroups.map((group) => (
                                <Badge key={group} variant="outline" className="capitalize text-xs">
                                  {group}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {exercise.notes && <p className="text-sm text-muted-foreground mt-2">{exercise.notes}</p>}
                          {exercise.intensity && (
                            <p className="text-xs text-muted-foreground mt-2 capitalize">
                              Intensity: {exercise.intensity}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">{exercise.description}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="flex justify-between items-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (selectedWorkout) {
                  deleteWorkout(selectedWorkout.id)
                  setIsViewWorkoutOpen(false)
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsViewWorkoutOpen(false)}>
                Close
              </Button>
              <Button variant="secondary" onClick={() => selectedWorkout && handleLoadWorkout(selectedWorkout)}>
                Load in Planner
              </Button>
              <Button onClick={() => selectedWorkout && handleStartWorkout(selectedWorkout)}>
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Workout
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isPresentationMode && (
        <div className="fixed inset-0 z-50">
          <WorkoutPresentation onClose={() => setIsPresentationMode(false)} />
        </div>
      )}
    </>
  )
}
