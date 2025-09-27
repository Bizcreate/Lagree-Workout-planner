// app/page.tsx
"use client"

import { useState } from "react"
import {
  CalendarIcon,
  ClipboardList,
  Dumbbell,
  CloudLightningIcon as Lightning,
  BookmarkIcon,
  GraduationCap,
} from "lucide-react"

import { ExerciseLibrary } from "@/components/exercise-library"
import { WorkoutPlanner } from "@/components/workout-planner"
import { WorkoutCalendar } from "@/components/workout-calendar"
import { NotesSection } from "@/components/notes-section"
import { QuickWorkoutPicker } from "@/components/quick-workout-picker"
import { MyWorkouts } from "@/components/my-workouts"
import { InstructorResources } from "@/components/instructor-resources"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function Home() {
  const [plannerMode, setPlannerMode] = useState<"detailed" | "quick">("detailed")

  return (
    <main className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Lagree Workout Planner</h1>

      <Tabs defaultValue="planner" className="mb-6">
        <TabsList className="grid w-full grid-cols-5 max-w-5xl mx-auto">
          <TabsTrigger value="planner" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Workout Planner</span>
            <span className="sm:hidden">Planner</span>
          </TabsTrigger>

          <TabsTrigger value="my-workouts" className="flex items-center gap-2">
            <BookmarkIcon className="h-4 w-4" />
            <span className="hidden sm:inline">My Workouts</span>
            <span className="sm:hidden">Saved</span>
          </TabsTrigger>

          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>Calendar</span>
          </TabsTrigger>

          <TabsTrigger value="notes" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span>Notes</span>
          </TabsTrigger>

          <TabsTrigger value="instructors" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Instructors</span>
            <span className="sm:hidden">Teach</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planner" className="mt-6">
          <div className="flex justify-center mb-6">
            <ToggleGroup
              type="single"
              value={plannerMode}
              onValueChange={(value) => value && setPlannerMode(value as "detailed" | "quick")}
            >
              <ToggleGroupItem value="detailed" aria-label="Detailed Planner">
                <Dumbbell className="h-4 w-4 mr-2" />
                Detailed Planner
              </ToggleGroupItem>
              <ToggleGroupItem value="quick" aria-label="Quick Picker">
                <Lightning className="h-4 w-4 mr-2" />
                Quick Picker
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {plannerMode === "detailed" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExerciseLibrary />
              <WorkoutPlanner />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickWorkoutPicker />
              <WorkoutPlanner />
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-workouts" className="mt-6">
          <MyWorkouts />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <WorkoutCalendar />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <NotesSection />
        </TabsContent>

        <TabsContent value="instructors" className="mt-6">
          <InstructorResources />
        </TabsContent>
      </Tabs>
    </main>
  )
}
