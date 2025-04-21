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

export function MyWorkouts() {
  const { savedWorkouts, deleteWorkout } = useSavedWorkoutsStore()
  const { setWorkoutPlan } = useWorkoutStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWorkout, setSelectedWorkout] = useState<SavedWorkout | null>(null)
  const [isViewWorkoutOpen, setIsViewWorkoutOpen] = useState(false)
  const [isPresentationMode, setIsPresentationMode] = useState(false)

  const filteredWorkouts = savedWorkouts.filter((workout) =>
    workout.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleStartWorkout = (workout: SavedWorkout) => {
    setWorkoutPlan(workout.exercises)
    setIsPresentationMode(true)
  }

  const handleViewWorkout = (workout: SavedWorkout) => {
    setSelectedWorkout(workout)
    setIsViewWorkoutOpen(true)
  }

  const handleLoadWorkout = (workout: SavedWorkout) => {
    setWorkoutPlan(workout.exercises)
    setIsViewWorkoutOpen(false)
  }

  // Calculate total time for a workout
  const calculateTotalTime = (exercises: WorkoutExercise[]) => {
    return exercises.reduce((total, exercise) => {
      // Special instructions don't add to the time
      if (exercise.name === "Change Sides" || exercise.name === "Repeat on Other Side") {
        return total
      }
      return total + (exercise.timeInSeconds || 0)
    }, 0)
  }

  // Format time as MM:SS
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
              <CardTitle>My Saved Workouts</CardTitle>
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
                {filteredWorkouts.map((workout) => {
                  const totalTime = calculateTotalTime(workout.exercises)
                  const exerciseCount = workout.exercises.length
                  const regularExerciseCount = workout.exercises.filter(
                    (ex) => ex.name !== "Change Sides" && ex.name !== "Repeat on Other Side",
                  ).length

                  return (
                    <Card key={workout.id} className="hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{workout.name}</CardTitle>
                        <CardDescription>Created on {new Date(workout.createdAt).toLocaleDateString()}</CardDescription>
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
                            className="flex-1"
                            onClick={() => handleViewWorkout(workout)}
                          >
                            <Info className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleStartWorkout(workout)}
                          >
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
                  {searchTerm ? "Try a different search term" : "Create and save workouts in the Workout Planner tab"}
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
                  const isSpecialInstruction =
                    exercise.name === "Change Sides" || exercise.name === "Repeat on Other Side"

                  return (
                    <div
                      key={`${exercise.id}-${index}`}
                      className={`border rounded-md p-4 ${isSpecialInstruction ? "bg-muted/50 border-dashed" : ""}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-mono">{index + 1}</span>
                          <h4 className="font-medium">{exercise.name}</h4>
                        </div>
                        {!isSpecialInstruction && (
                          <div className="flex items-center gap-2">
                            {exercise.timeInSeconds && (
                              <Badge variant="secondary">{formatTime(exercise.timeInSeconds)}</Badge>
                            )}
                            {exercise.reps && <Badge variant="outline">{exercise.reps} reps</Badge>}
                          </div>
                        )}
                      </div>

                      {!isSpecialInstruction ? (
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
