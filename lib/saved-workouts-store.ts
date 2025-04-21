"use client"

import { create } from "zustand"
import type { SavedWorkout, WorkoutExercise } from "./types"

// Sample saved workouts for demonstration
const sampleWorkouts: SavedWorkout[] = [
  {
    id: "1",
    name: "Full Body Lagree",
    exercises: [
      {
        id: "1",
        name: "Plank to Pike",
        description:
          "Start in a plank position with feet on the carriage, then pike hips up while pulling the carriage in.",
        muscleGroups: ["core", "arms"],
        timeInSeconds: 60,
        reps: 10,
        intensity: "medium",
      },
      {
        id: "2",
        name: "Reverse Lunge",
        description: "Standing on the platform, place one foot on the carriage and slide back into a lunge position.",
        muscleGroups: ["legs", "glutes"],
        timeInSeconds: 60,
        reps: 12,
        intensity: "high",
      },
      {
        id: "change-sides-1",
        name: "Change Sides",
        description: "Switch to the other side and repeat the previous exercise.",
        muscleGroups: [],
      },
      {
        id: "2",
        name: "Reverse Lunge",
        description: "Standing on the platform, place one foot on the carriage and slide back into a lunge position.",
        muscleGroups: ["legs", "glutes"],
        timeInSeconds: 60,
        reps: 12,
        intensity: "high",
      },
      {
        id: "3",
        name: "French Twist",
        description: "Seated on the carriage, hold handles and rotate torso from side to side.",
        muscleGroups: ["core", "obliques"],
        timeInSeconds: 45,
        reps: 15,
        intensity: "medium",
      },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  },
  {
    id: "2",
    name: "Core Intensive",
    exercises: [
      {
        id: "1",
        name: "Plank to Pike",
        description:
          "Start in a plank position with feet on the carriage, then pike hips up while pulling the carriage in.",
        muscleGroups: ["core", "arms"],
        timeInSeconds: 60,
        reps: 10,
        intensity: "high",
      },
      {
        id: "3",
        name: "French Twist",
        description: "Seated on the carriage, hold handles and rotate torso from side to side.",
        muscleGroups: ["core", "obliques"],
        timeInSeconds: 60,
        reps: 15,
        intensity: "medium",
      },
      {
        id: "6",
        name: "Scrambled Eggs",
        description:
          "In a plank position with hands on the platform and feet on the carriage, bring knees toward chest.",
        muscleGroups: ["core", "arms"],
        timeInSeconds: 45,
        reps: 12,
        intensity: "high",
      },
      {
        id: "12",
        name: "Teaser",
        description: "Lie on your back on the carriage, then lift legs and upper body simultaneously into a V-shape.",
        muscleGroups: ["core", "abs"],
        timeInSeconds: 45,
        reps: 8,
        intensity: "high",
      },
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: "3",
    name: "Lower Body Focus",
    exercises: [
      {
        id: "2",
        name: "Reverse Lunge",
        description: "Standing on the platform, place one foot on the carriage and slide back into a lunge position.",
        muscleGroups: ["legs", "glutes"],
        timeInSeconds: 60,
        reps: 12,
        intensity: "high",
      },
      {
        id: "change-sides-1",
        name: "Change Sides",
        description: "Switch to the other side and repeat the previous exercise.",
        muscleGroups: [],
      },
      {
        id: "2",
        name: "Reverse Lunge",
        description: "Standing on the platform, place one foot on the carriage and slide back into a lunge position.",
        muscleGroups: ["legs", "glutes"],
        timeInSeconds: 60,
        reps: 12,
        intensity: "high",
      },
      {
        id: "10",
        name: "Elevator Lunges",
        description: "In a lunge position with back foot on the carriage, pulse up and down.",
        muscleGroups: ["legs", "glutes"],
        timeInSeconds: 45,
        reps: 15,
        intensity: "medium",
      },
      {
        id: "change-sides-2",
        name: "Change Sides",
        description: "Switch to the other side and repeat the previous exercise.",
        muscleGroups: [],
      },
      {
        id: "10",
        name: "Elevator Lunges",
        description: "In a lunge position with back foot on the carriage, pulse up and down.",
        muscleGroups: ["legs", "glutes"],
        timeInSeconds: 45,
        reps: 15,
        intensity: "medium",
      },
      {
        id: "14",
        name: "Curtsy Lunges",
        description: "Standing on the platform, place one foot on the carriage and slide into a curtsy lunge.",
        muscleGroups: ["legs", "glutes"],
        timeInSeconds: 45,
        reps: 12,
        intensity: "high",
      },
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
]

interface SavedWorkoutsStore {
  savedWorkouts: SavedWorkout[]
  addWorkout: (name: string, exercises: WorkoutExercise[]) => void
  deleteWorkout: (id: string) => void
  updateWorkout: (id: string, name: string, exercises: WorkoutExercise[]) => void
}

export const useSavedWorkoutsStore = create<SavedWorkoutsStore>((set) => ({
  savedWorkouts: sampleWorkouts,

  addWorkout: (name, exercises) =>
    set((state) => ({
      savedWorkouts: [
        {
          id: Date.now().toString(),
          name,
          exercises,
          createdAt: new Date().toISOString(),
        },
        ...state.savedWorkouts,
      ],
    })),

  deleteWorkout: (id) =>
    set((state) => ({
      savedWorkouts: state.savedWorkouts.filter((workout) => workout.id !== id),
    })),

  updateWorkout: (id, name, exercises) =>
    set((state) => ({
      savedWorkouts: state.savedWorkouts.map((workout) =>
        workout.id === id
          ? {
              ...workout,
              name,
              exercises,
            }
          : workout,
      ),
    })),
}))
