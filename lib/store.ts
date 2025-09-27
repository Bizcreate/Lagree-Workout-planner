// lib/store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { WorkoutExercise } from "./types"

type State = {
  workoutPlan: WorkoutExercise[]
}

type Actions = {
  /** Replace the whole plan (used when starting a saved workout) */
  setWorkoutPlan: (plan: WorkoutExercise[]) => void
  addExerciseToWorkout: (ex: WorkoutExercise) => void
  removeExerciseFromWorkout: (index: number) => void
  clearWorkout: () => void
  reorderExercises: (from: number, to: number) => void
  updateExerciseParams: (index: number, updates: Partial<WorkoutExercise>) => void
}

export const useWorkoutStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      workoutPlan: [],

      setWorkoutPlan: (plan) => set({ workoutPlan: plan }),

      addExerciseToWorkout: (ex) =>
        set((s) => ({ workoutPlan: [...s.workoutPlan, ex] })),

      removeExerciseFromWorkout: (index) =>
        set((s) => ({
          workoutPlan: s.workoutPlan.filter((_, i) => i !== index),
        })),

      clearWorkout: () => set({ workoutPlan: [] }),

      reorderExercises: (from, to) =>
        set((s) => {
          const copy = s.workoutPlan.slice()
          const [moved] = copy.splice(from, 1)
          copy.splice(to, 0, moved)
          return { workoutPlan: copy }
        }),

      updateExerciseParams: (index, updates) =>
        set((s) => {
          const copy = s.workoutPlan.slice()
          copy[index] = { ...copy[index], ...updates }
          return { workoutPlan: copy }
        }),
    }),
    { name: "workout-store" }
  )
)
