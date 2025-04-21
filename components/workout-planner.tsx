"use client"

import type React from "react"

import { useState } from "react"
import { GripVertical, Save, Trash2, Clock, RotateCcw, Repeat, PlayCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useWorkoutStore } from "@/lib/store"
import { useSavedWorkoutsStore } from "@/lib/saved-workouts-store"
import type { WorkoutExercise } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WorkoutPresentation } from "@/components/workout-presentation"

export function WorkoutPlanner() {
  const { workoutPlan, updateExerciseParams, removeExerciseFromWorkout, clearWorkout, reorderExercises } =
    useWorkoutStore()
  const { addWorkout } = useSavedWorkoutsStore()
  const [workoutName, setWorkoutName] = useState("My Lagree Workout")
  const [savedMessage, setSavedMessage] = useState("")
  const [isPresentationMode, setIsPresentationMode] = useState(false)

  const totalTime = workoutPlan.reduce((total, exercise) => {
    // Special instructions don't add to the time
    if (exercise.name === "Change Sides" || exercise.name === "Repeat on Other Side") {
      return total
    }
    return total + (exercise.timeInSeconds || 0)
  }, 0)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSaveWorkout = () => {
    try {
      // Save the workout to the store
      addWorkout(workoutName, workoutPlan)

      setSavedMessage("Workout saved successfully!")
      setTimeout(() => {
        setSavedMessage("")
      }, 3000)
    } catch (error) {
      console.error("Failed to save workout:", error)
      setSavedMessage("Failed to save workout")
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    const sourceIndex = Number.parseInt(e.dataTransfer.getData("text/plain"))
    if (sourceIndex !== targetIndex) {
      reorderExercises(sourceIndex, targetIndex)
    }
  }

  // Check if an exercise is a special instruction
  const isSpecialInstruction = (exercise: WorkoutExercise) => {
    return exercise.name === "Change Sides" || exercise.name === "Repeat on Other Side"
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Workout Plan</CardTitle>
              <CardDescription>
                {workoutPlan.length} exercises | Total time: {formatTime(totalTime)}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={clearWorkout} title="Clear workout">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleSaveWorkout} title="Save workout">
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-2">
            <Label htmlFor="workout-name">Workout Name</Label>
            <Input
              id="workout-name"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="mt-1"
            />
          </div>
          {savedMessage && (
            <Badge variant="outline" className="bg-green-50 text-green-700 mt-2">
              {savedMessage}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="h-[calc(100vh-350px)] overflow-y-auto">
          {workoutPlan.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <p className="text-muted-foreground mb-2">Your workout plan is empty</p>
              <p className="text-sm text-muted-foreground">Add exercises from the library to create your workout</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workoutPlan.map((exercise, index) => (
                <div
                  key={`${exercise.id}-${index}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`border rounded-md p-4 relative hover:border-primary/50 transition-colors ${
                    isSpecialInstruction(exercise) ? "bg-muted/50 border-dashed" : ""
                  }`}
                >
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move opacity-50 hover:opacity-100">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="ml-6">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{exercise.name}</h3>
                        {isSpecialInstruction(exercise) && (
                          <Badge variant="secondary" className="ml-2">
                            <Repeat className="h-3 w-3 mr-1" />
                            Instruction
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExerciseFromWorkout(index)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {!isSpecialInstruction(exercise) ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                          <div>
                            <Label htmlFor={`time-${index}`} className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Time
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                id={`time-${index}`}
                                type="number"
                                min="0"
                                value={Math.floor((exercise.timeInSeconds || 0) / 60)}
                                onChange={(e) => {
                                  const mins = Number.parseInt(e.target.value) || 0
                                  const secs = exercise.timeInSeconds ? exercise.timeInSeconds % 60 : 0
                                  updateExerciseParams(index, {
                                    ...exercise,
                                    timeInSeconds: mins * 60 + secs,
                                  })
                                }}
                                className="w-16"
                              />
                              <span>min</span>
                              <Input
                                type="number"
                                min="0"
                                max="59"
                                value={(exercise.timeInSeconds || 0) % 60}
                                onChange={(e) => {
                                  const secs = Number.parseInt(e.target.value) || 0
                                  const mins = Math.floor((exercise.timeInSeconds || 0) / 60)
                                  updateExerciseParams(index, {
                                    ...exercise,
                                    timeInSeconds: mins * 60 + secs,
                                  })
                                }}
                                className="w-16"
                              />
                              <span>sec</span>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`reps-${index}`}>Reps</Label>
                            <Input
                              id={`reps-${index}`}
                              type="number"
                              min="0"
                              value={exercise.reps || ""}
                              onChange={(e) =>
                                updateExerciseParams(index, {
                                  ...exercise,
                                  reps: Number.parseInt(e.target.value) || 0,
                                })
                              }
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`intensity-${index}`}>Intensity</Label>
                            <Select
                              value={exercise.intensity || "medium"}
                              onValueChange={(value) =>
                                updateExerciseParams(index, {
                                  ...exercise,
                                  intensity: value,
                                })
                              }
                            >
                              <SelectTrigger id={`intensity-${index}`} className="mt-1">
                                <SelectValue placeholder="Select intensity" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mt-3">
                          <Label htmlFor={`notes-${index}`}>Notes</Label>
                          <Input
                            id={`notes-${index}`}
                            value={exercise.notes || ""}
                            onChange={(e) =>
                              updateExerciseParams(index, {
                                ...exercise,
                                notes: e.target.value,
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">{exercise.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">Drag exercises to reorder</div>
          <div className="flex gap-2">
            <Button
              variant="default"
              className="flex items-center gap-2"
              disabled={workoutPlan.length === 0}
              onClick={() => setIsPresentationMode(true)}
            >
              <PlayCircle className="h-4 w-4" />
              Start Workout
            </Button>
            <Button disabled={workoutPlan.length === 0} onClick={handleSaveWorkout}>
              <Save className="h-4 w-4 mr-2" />
              Save Workout
            </Button>
          </div>
        </CardFooter>
      </Card>

      {isPresentationMode && (
        <div className="fixed inset-0 z-50">
          <WorkoutPresentation onClose={() => setIsPresentationMode(false)} />
        </div>
      )}
    </>
  )
}
