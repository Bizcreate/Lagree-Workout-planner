"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWorkoutStore } from "@/lib/store"
import type { Exercise } from "@/lib/types"
import { lagreeExercises } from "@/lib/data"

export function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const { addExerciseToWorkout } = useWorkoutStore()

  const muscleGroups = ["all", "core", "arms", "legs", "back", "glutes"]

  const filteredExercises = lagreeExercises.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "all" || exercise.muscleGroups.includes(activeTab)
    return matchesSearch && matchesTab
  })

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Exercise Library</CardTitle>
        <CardDescription>Browse and add exercises to your workout plan</CardDescription>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
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
              <ExerciseCard key={exercise.id} exercise={exercise} onAdd={() => addExerciseToWorkout(exercise)} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No exercises found. Try a different search term.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ExerciseCard({ exercise, onAdd }: { exercise: Exercise; onAdd: () => void }) {
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
      </CardContent>
      <CardFooter>
        <Button onClick={onAdd} size="sm" className="w-full">
          Add to Workout
        </Button>
      </CardFooter>
    </Card>
  )
}
