import { supabase } from "./supabase"
import type { Exercise } from "./types"

// Fetch all exercises from Supabase
export async function fetchExercises(): Promise<Exercise[]> {
  try {
    const { data, error } = await supabase.from("exercises").select("*").order("name")

    if (error) {
      console.error("[v0] Error fetching exercises:", error)
      return []
    }

    return data.map(dbExerciseToExercise)
  } catch (err) {
    console.error("[v0] Error in fetchExercises:", err)
    return []
  }
}

// Fetch preset workouts from Supabase
export async function fetchPresetWorkouts() {
  try {
    const { data: workouts, error: workoutsError } = await supabase
      .from("workouts")
      .select(`
        *,
        workout_exercises (
          *,
          exercises (*)
        )
      `)
      .eq("is_preset", true)
      .order("created_at", { ascending: false })

    if (workoutsError) {
      console.error("[v0] Error fetching preset workouts:", workoutsError)
      return []
    }

    return workouts.map((workout: any) => ({
      id: workout.id,
      name: workout.name,
      description: workout.description,
      isPreset: workout.is_preset,
      exercises: workout.workout_exercises
        .sort((a: any, b: any) => a.position - b.position)
        .map((we: any) => ({
          ...dbExerciseToExercise(we.exercises),
          timeSec: we.time_sec,
          reps: we.reps,
          holdSec: we.hold_sec,
          pulses: we.pulses,
          notes: we.notes,
          side: we.side,
        })),
      createdAt: workout.created_at,
    }))
  } catch (err) {
    console.error("[v0] Error in fetchPresetWorkouts:", err)
    return []
  }
}

// Save a workout to Supabase
export async function saveWorkout(workout: {
  name: string
  description?: string
  exercises: any[]
  isPreset?: boolean
}) {
  try {
    // Create workout
    const { data: workoutData, error: workoutError } = await supabase
      .from("workouts")
      .insert({
        name: workout.name,
        description: workout.description,
        is_preset: workout.isPreset || false,
      })
      .select()
      .single()

    if (workoutError) {
      console.error("[v0] Error saving workout:", workoutError)
      return null
    }

    // Add exercises to workout
    const workoutExercises = workout.exercises.map((ex, index) => ({
      workout_id: workoutData.id,
      exercise_id: ex.id,
      position: index + 1,
      time_sec: ex.timeSec,
      reps: ex.reps,
      hold_sec: ex.holdSec,
      pulses: ex.pulses,
      notes: ex.notes,
      side: ex.side,
    }))

    const { error: exercisesError } = await supabase.from("workout_exercises").insert(workoutExercises)

    if (exercisesError) {
      console.error("[v0] Error saving workout exercises:", exercisesError)
      return null
    }

    return workoutData
  } catch (err) {
    console.error("[v0] Error in saveWorkout:", err)
    return null
  }
}

// Delete a workout
export async function deleteWorkout(workoutId: string) {
  try {
    const { error } = await supabase.from("workouts").delete().eq("id", workoutId)

    if (error) {
      console.error("[v0] Error deleting workout:", error)
      return false
    }

    return true
  } catch (err) {
    console.error("[v0] Error in deleteWorkout:", err)
    return false
  }
}

// Helper function to convert database exercise to app Exercise type
function dbExerciseToExercise(dbEx: any): Exercise {
  return {
    id: dbEx.id,
    name: dbEx.name,
    description: dbEx.description || "",
    muscleGroups: dbEx.muscle_groups || [],
    series: dbEx.series,
    unilateral: dbEx.unilateral || false,
    defaultMetric: dbEx.default_metric || "time",
    defaultTimeSec: dbEx.default_time_sec,
    defaultReps: dbEx.default_reps,
    equipment: dbEx.equipment || [],
    level: dbEx.level || "beginner",
    aliases: dbEx.aliases || [],
    tags: dbEx.tags || [],
  }
}
