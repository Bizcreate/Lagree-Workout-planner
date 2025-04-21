"use client"

import { create } from "zustand"
import type { Exercise, WorkoutExercise } from "./types"

interface WorkoutStore {
  workoutPlan: WorkoutExercise[]
  addExerciseToWorkout: (exercise: Exercise) => void
  updateExerciseParams: (index: number, updatedExercise: WorkoutExercise) => void
  removeExerciseFromWorkout: (index: number) => void
  clearWorkout: () => void
  reorderExercises: (sourceIndex: number, targetIndex: number) => void
  setWorkoutPlan: (exercises: WorkoutExercise[]) => void
}

// Create store without persistence to avoid storage issues
export const useWorkoutStore = create<WorkoutStore>((set) => ({
  workoutPlan: [],

  addExerciseToWorkout: (exercise) =>
    set((state) => ({
      workoutPlan: [
        ...state.workoutPlan,
        {
          ...exercise,
          timeInSeconds: 60,
          reps: 10,
          intensity: "medium",
          notes: "",
        },
      ],
    })),

  updateExerciseParams: (index, updatedExercise) =>
    set((state) => ({
      workoutPlan: state.workoutPlan.map((exercise, i) => (i === index ? updatedExercise : exercise)),
    })),

  removeExerciseFromWorkout: (index) =>
    set((state) => ({
      workoutPlan: state.workoutPlan.filter((_, i) => i !== index),
    })),

  clearWorkout: () => set({ workoutPlan: [] }),

  reorderExercises: (sourceIndex, targetIndex) =>
    set((state) => {
      const newWorkoutPlan = [...state.workoutPlan]
      const [movedItem] = newWorkoutPlan.splice(sourceIndex, 1)
      newWorkoutPlan.splice(targetIndex, 0, movedItem)
      return { workoutPlan: newWorkoutPlan }
    }),

  setWorkoutPlan: (exercises) => set({ workoutPlan: exercises }),
}))
