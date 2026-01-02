"use client"

import type React from "react"
import { useState } from "react"
import { GripVertical, Save, Trash2, Clock, RotateCcw, Repeat, PlayCircle, MapPin } from "lucide-react"
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
import { positionBadge } from "@/lib/positions"

export function WorkoutPlanner() {
  const { workoutPlan, updateExerciseParams, removeExerciseFromWorkout, clearWorkout, reorderExercises } =
    useWorkoutStore()
  const { addWorkout } = useSavedWorkoutsStore()
  const [workoutName, setWorkoutName] = useState("My Lagree Workout")
  const [savedMessage, setSavedMessage] = useState("")
  const [isPresentationMode, setIsPresentationMode] = useState(false)

  const totalTime = workoutPlan.reduce((total, ex) => {
    if (isSpecialInstruction(ex)) return total
    return total + (ex.timeInSeconds || 0)
  }, 0)

  function isSpecialInstruction(ex: WorkoutExercise) {
    return ex.name === "Change Sides" || ex.name === "Repeat on Other Side"
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSaveWorkout = () => {
    try {
      addWorkout(workoutName, workoutPlan.map((e) => ({ ...e, position: e.position ?? "standard" })))
      setSavedMessage("Workout saved successfully!")
      setTimeout(() => setSavedMessage(""), 3000)
    } catch {
      setSavedMessage("Failed to save workout")
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString())
  }
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    const sourceIndex = Number.parseInt(e.dataTransfer.getData("text/plain"))
    if (sourceIndex !== targetIndex) reorderExercises(sourceIndex, targetIndex)
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
            <Input id="workout-name" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} className="mt-1" />
          </div>
          {savedMessage && <Badge variant="outline" className="bg-green-50 text-green-700 mt-2">{savedMessage}</Badge>}
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
                        {!isSpecialInstruction(exercise) && (
                          <Badge variant="secondary" className="ml-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {positionBadge(exercise.position ?? "standard")}
                          </Badge>
                        )}
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
                          {/* Time */}
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
                                  updateExerciseParams(index, { ...exercise, timeInSeconds: mins * 60 + secs })
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
                                  updateExerciseParams(index, { ...exercise, timeInSeconds: mins * 60 + secs })
                                }}
                                className="w-16"
                              />
                              <span>sec</span>
                            </div>
                          </div>

                          {/* Reps */}
                          <div>
                            <Label htmlFor={`reps-${index}`}>Reps</Label>
                            <Input
                              id={`reps-${index}`}
                              type="number"
                              min="0"
                              value={exercise.reps ?? ""}
                              onChange={(e) =>
                                updateExerciseParams(index, { ...exercise, reps: Number.parseInt(e.target.value) || 0 })
                              }
                              className="mt-1"
                            />
                          </div>

                          {/* Intensity */}
                          <div>
                            <Label htmlFor={`intensity-${index}`}>Intensity</Label>
                            <Select
                              value={exercise.intensity ?? "medium"}
                              onValueChange={(value) => updateExerciseParams(index, { ...exercise, intensity: value as any })}
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

                          {/* Positioning */}
                          <div>
                            <Label htmlFor={`position-${index}`}>Positioning</Label>
                            <Select
                              value={exercise.position ?? "standard"}
                              onValueChange={(value) =>
                                updateExerciseParams(index, { ...exercise, position: value as any })
                              }
                            >
                              <SelectTrigger id={`position-${index}`} className="mt-1">
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Level 1 • Standard (front ▶ front)</SelectItem>
                                <SelectItem value="reverse">Level 2 • Reverse (front ▶ back)</SelectItem>
                                <SelectItem value="giantReverse">Level 3 • Giant Reverse (back ▶ back)</SelectItem>
                                <SelectItem value="giant">Level 4 • Giant (back ▶ front)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="mt-3">
                          <Label htmlFor={`notes-${index}`}>Notes</Label>
                          <Input
                            id={`notes-${index}`}
                            value={exercise.notes || ""}
                            onChange={(e) => updateExerciseParams(index, { ...exercise, notes: e.target.value })}
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
