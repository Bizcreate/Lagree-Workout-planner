// components/my-workouts.tsx
"use client"

import { useState } from "react"
import { Clock, PlayCircle, Search, Trash2, Info } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WorkoutPresentation } from "@/components/workout-presentation"

import { useSavedWorkoutsStore } from "@/lib/saved-workouts-store"
import { useWorkoutStore } from "@/lib/store"
import type { SavedWorkout, WorkoutExercise } from "@/lib/types"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/** Ensure older saved items have the fields our planner/presentation expect */
function normalizeExercises(list: WorkoutExercise[]): WorkoutExercise[] {
  return list.map((e, i) => ({
    ...e,
    id: e.id ?? `${e.name}-${i}`,
    position: e.position ?? "standard",
    timeInSeconds: e.timeInSeconds ?? 0,
  }))
}

export function MyWorkouts() {
  const { savedWorkouts, deleteWorkout } = useSavedWorkoutsStore()
  // type as any to avoid runtime “is not a function” if your store APIs vary between branches
  const workout = useWorkoutStore() as any

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWorkout, setSelectedWorkout] = useState<SavedWorkout | null>(null)
  const [isViewWorkoutOpen, setIsViewWorkoutOpen] = useState(false)
  const [isPresentationMode, setIsPresentationMode] = useState(false)

  const filteredWorkouts = savedWorkouts.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleStartWorkout = (workoutToStart: SavedWorkout) => {
    workout?.setWorkoutPlan?.(normalizeExercises(workoutToStart.exercises))
    setIsPresentationMode(true)
  }

  const handleViewWorkout = (w: SavedWorkout) => {
    setSelectedWorkout(w)
    setIsViewWorkoutOpen(true)
  }

  const handleLoadWorkout = (w: SavedWorkout) => {
    workout?.setWorkoutPlan?.(normalizeExercises(w.exercises))
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

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">My Saved Workouts</CardTitle>
              <CardDescription>
                {savedWorkouts.length} {savedWorkouts.length === 1 ? "workout" : "workouts"} saved
              </CardDescription>
            </div>
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
            {filteredWorkouts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkouts.map((w) => {
                  const totalTime = calculateTotalTime(w.exercises)
                  const regularCount = w.exercises.filter(
                    (ex) => ex.name !== "Change Sides" && ex.name !== "Repeat on Other Side",
                  ).length

                  return (
                    <Card key={w.id} className="hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{w.name}</CardTitle>
                        <CardDescription>Created on {new Date(w.createdAt).toLocaleDateString()}</CardDescription>
                      </CardHeader>

                      <CardContent className="pb-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{formatTime(totalTime)}</span>
                          <Badge variant="outline" className="ml-auto">
                            {regularCount} exercises
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {w.exercises
                            .filter((ex) => ex.name !== "Change Sides" && ex.name !== "Repeat on Other Side")
                            .slice(0, 3)
                            .map((ex) => ex.name)
                            .join(", ")}
                          {regularCount > 3 ? ` and ${regularCount - 3} more...` : ""}
                        </p>
                      </CardContent>

                      <CardFooter className="pt-2">
                        <div className="flex gap-2 w-full">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewWorkout(w)}>
                            <Info className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                          <Button variant="default" size="sm" className="flex-1" onClick={() => handleStartWorkout(w)}>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Start
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">No saved workouts found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "Try a different search term" : "Create and save workouts in the Planner tab"}
                </p>
              </div>
            )}
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
                  const isInstruction =
                    exercise.name === "Change Sides" || exercise.name === "Repeat on Other Side"

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
                              <Badge variant="secondary">
                                {Math.floor((exercise.timeInSeconds || 0) / 60)}:
                                {((exercise.timeInSeconds || 0) % 60).toString().padStart(2, "0")}
                              </Badge>
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
