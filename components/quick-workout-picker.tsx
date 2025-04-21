"use client"

import { useState } from "react"
import { Check, Clock, Plus, Repeat, RotateCcw, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useWorkoutStore } from "@/lib/store"
import { lagreeExercises } from "@/lib/data"
import type { Exercise } from "@/lib/types"

export function QuickWorkoutPicker() {
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [workoutName, setWorkoutName] = useState("Quick Lagree Workout")
  const [savedMessage, setSavedMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const { clearWorkout, addExerciseToWorkout, workoutPlan } = useWorkoutStore()

  const filteredExercises = lagreeExercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleToggleExercise = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId) ? prev.filter((id) => id !== exerciseId) : [...prev, exerciseId],
    )
  }

  const handleCreateWorkout = () => {
    // Clear existing workout
    clearWorkout()

    // Get selected exercises
    const exercisesToAdd = selectedExercises.map((id) => lagreeExercises.find((ex) => ex.id === id)!)

    // Add each exercise to the workout
    exercisesToAdd.forEach((exercise) => {
      if (exercise) {
        addExerciseToWorkout(exercise)
      }
    })

    // Show success message
    setSavedMessage(`Created a ${exercisesToAdd.length}-minute workout!`)
    setTimeout(() => setSavedMessage(""), 3000)
  }

  const handleAddChangeSides = () => {
    const changeSidesExercise: Exercise = {
      id: `change-sides-${Date.now()}`,
      name: "Change Sides",
      description: "Switch to the other side and repeat the previous exercise.",
      muscleGroups: [],
    }
    addExerciseToWorkout(changeSidesExercise)
    setSavedMessage("Added 'Change Sides' instruction")
    setTimeout(() => setSavedMessage(""), 3000)
  }

  const handleAddRepeatOtherSide = () => {
    const repeatExercise: Exercise = {
      id: `repeat-${Date.now()}`,
      name: "Repeat on Other Side",
      description: "Repeat the previous exercise on the opposite side.",
      muscleGroups: [],
    }
    addExerciseToWorkout(repeatExercise)
    setSavedMessage("Added 'Repeat on Other Side' instruction")
    setTimeout(() => setSavedMessage(""), 3000)
  }

  const totalTime = selectedExercises.length

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Quick Workout Picker</CardTitle>
            <CardDescription>Select exercises to create a {totalTime}-minute workout</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setSelectedExercises([])} title="Clear selections">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-2">
          <Label htmlFor="quick-workout-name">Workout Name</Label>
          <Input
            id="quick-workout-name"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="relative mt-2">
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        {savedMessage && (
          <Badge variant="outline" className="bg-green-50 text-green-700 mt-2">
            {savedMessage}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Each exercise: 1 minute</span>
          </div>
          <Badge variant="outline">{totalTime} min total</Badge>
        </div>

        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="space-y-2">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className={`flex items-start space-x-3 p-2 rounded-md transition-colors ${
                  selectedExercises.includes(exercise.id) ? "bg-primary/5 border border-primary/20" : ""
                }`}
              >
                <Checkbox
                  id={`exercise-${exercise.id}`}
                  checked={selectedExercises.includes(exercise.id)}
                  onCheckedChange={() => handleToggleExercise(exercise.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor={`exercise-${exercise.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {exercise.name}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{exercise.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {exercise.muscleGroups.map((group) => (
                      <Badge key={group} variant="secondary" className="capitalize text-xs">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 ${selectedExercises.includes(exercise.id) ? "opacity-100" : "opacity-0"}`}
                  onClick={() => handleToggleExercise(exercise.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex gap-2 w-full">
          <Button onClick={handleCreateWorkout} className="flex-1" disabled={selectedExercises.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            Create Workout
          </Button>
        </div>
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            onClick={handleAddChangeSides}
            className="flex-1"
            disabled={workoutPlan.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add "Change Sides"
          </Button>
          <Button
            variant="outline"
            onClick={handleAddRepeatOtherSide}
            className="flex-1"
            disabled={workoutPlan.length === 0}
          >
            <Repeat className="h-4 w-4 mr-2" />
            Add "Repeat on Other Side"
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

import { Search } from "lucide-react"
