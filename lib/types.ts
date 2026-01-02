import type { Positioning } from "./positions"

export interface Exercise {
  id: string
  name: string
  description: string
  muscleGroups: string[]
}

export interface WorkoutExercise extends Exercise {
  timeInSeconds?: number
  reps?: number
  intensity?: "low" | "medium" | "high"
  notes?: string
  /** New: machine position (L1–L4 presets) */
  position?: Positioning
}

export interface SavedWorkout {
  id: string
  name: string
  createdAt: number
  exercises: WorkoutExercise[]
}
