// lib/templates.ts
import { lagreeExercises } from "./data"
import type { Exercise, WorkoutExercise } from "./types"

// --- helpers
const byName = (name: string): Exercise => {
  const ex = lagreeExercises.find((e) => e.name.toLowerCase() === name.toLowerCase())
  if (!ex) throw new Error(`Template needs exercise not found in data: "${name}"`)
  return ex
}

const toWorkout = (
  e: Exercise,
  opts?: { secs?: number; reps?: number; intensity?: "low" | "medium" | "high" },
): WorkoutExercise => ({
  id: `${e.id}-${Math.random().toString(36).slice(2)}`,
  name: e.name,
  description: e.description,
  muscleGroups: e.muscleGroups,
  timeInSeconds: opts?.secs ?? 60,
  reps: opts?.reps,
  intensity: opts?.intensity ?? "medium",
})

const header = (label: string): WorkoutExercise => ({
  id: `hdr-${label}-${Math.random().toString(36).slice(2)}`,
  name: label,
  muscleGroups: ["full"],
  isBlockHeader: true as any, // tolerated even if not in your type
})

// --- templates
export function templateFullBody45(): WorkoutExercise[] {
  return [
    header("Warm-up / Core"),
    toWorkout(byName("Wheelbarrow"), { secs: 60 }),
    toWorkout(byName("Bear"), { secs: 60 }),
    toWorkout(byName("Plank to Pike"), { secs: 45 }),

    header("Legs / Glutes (L)"),
    toWorkout(byName("Elevator Lunges"), { secs: 60 }),
    toWorkout(byName("Skater Lunges"), { secs: 60 }),

    header("Legs / Glutes (R)"),
    toWorkout(byName("Elevator Lunges"), { secs: 60 }),
    toWorkout(byName("Skater Lunges"), { secs: 60 }),

    header("Arms / Cables"),
    toWorkout(byName("Chest Press"), { reps: 12 }),
    toWorkout(byName("Rowing Series"), { reps: 12 }),

    header("Obliques / Finisher"),
    toWorkout(byName("French Twist"), { secs: 45 }),
    toWorkout(byName("Spoon"), { secs: 45 }),
  ]
}

export function templateFullBody60(): WorkoutExercise[] {
  return [
    header("Warm-up / Core"),
    toWorkout(byName("Wheelbarrow"), { secs: 60 }),
    toWorkout(byName("Bear"), { secs: 60 }),
    toWorkout(byName("Plank to Pike"), { secs: 60 }),
    toWorkout(byName("Scrambled Eggs"), { secs: 45 }),

    header("Legs / Glutes (L)"),
    toWorkout(byName("Escalator Lunge" /* aka Escalator Lunges */) || byName("Elevator Lunges"), { secs: 60 }),
    toWorkout(byName("Curtsy Lunges"), { secs: 45 }),

    header("Legs / Glutes (R)"),
    toWorkout(byName("Escalator Lunge" /* fallback */) || byName("Elevator Lunges"), { secs: 60 }),
    toWorkout(byName("Curtsy Lunges"), { secs: 45 }),

    header("Arms / Cables"),
    toWorkout(byName("Kneeling Lat Pulls"), { reps: 12 }),
    toWorkout(byName("Chest Press"), { reps: 12 }),

    header("Core Finisher"),
    toWorkout(byName("Mega Plank"), { secs: 60 }),
    toWorkout(byName("Mermaid"), { secs: 45 }),
  ]
}

export function templateCoreFocus45(): WorkoutExercise[] {
  return [
    header("Core Block 1"),
    toWorkout(byName("Wheelbarrow"), { secs: 60 }),
    toWorkout(byName("Bear"), { secs: 60 }),
    toWorkout(byName("French Twist"), { secs: 45 }),
    header("Core Block 2"),
    toWorkout(byName("Plank to Pike"), { secs: 45 }),
    toWorkout(byName("Spoon"), { secs: 45 }),
    toWorkout(byName("Scrambled Eggs"), { secs: 45 }),
  ]
}

export function templateLegFocus60(): WorkoutExercise[] {
  return [
    header("Prep / Core"),
    toWorkout(byName("Wheelbarrow"), { secs: 45 }),

    header("Left Leg"),
    toWorkout(byName("Escalator Lunge") || byName("Elevator Lunges"), { secs: 60 }),
    toWorkout(byName("Curtsy Lunges"), { secs: 45 }),
    toWorkout(byName("Skater Lunges"), { secs: 60 }),

    header("Right Leg"),
    toWorkout(byName("Escalator Lunge") || byName("Elevator Lunges"), { secs: 60 }),
    toWorkout(byName("Curtsy Lunges"), { secs: 45 }),
    toWorkout(byName("Skater Lunges"), { secs: 60 }),

    header("Glute Finish"),
    toWorkout(byName("Donkey Kicks"), { secs: 45 }),
    toWorkout(byName("Mermaid"), { secs: 45 }),
  ]
}
