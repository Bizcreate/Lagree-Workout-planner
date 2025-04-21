export interface Exercise {
  id: string
  name: string
  description: string
  muscleGroups: string[]
}

export interface WorkoutExercise extends Exercise {
  timeInSeconds?: number
  reps?: number
  intensity?: string
  notes?: string
}

export interface WorkoutPlan {
  name: string
  exercises: WorkoutExercise[]
  createdAt: string
}

export interface ScheduledWorkout {
  id: string
  date: Date
  workoutName: string
  notes?: string
  duration: number
  workoutPlan?: WorkoutExercise[]
}

export interface Note {
  id: string
  title: string
  content: string
  category: string
  createdAt: Date
}

export interface SavedWorkout {
  id: string
  name: string
  exercises: WorkoutExercise[]
  createdAt: string
}
