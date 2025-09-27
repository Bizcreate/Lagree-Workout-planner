import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SavedWorkout, WorkoutExercise } from "./types";

type SavedStore = {
  savedWorkouts: SavedWorkout[];
  addWorkout: (name: string, exercises: WorkoutExercise[]) => void;
  deleteWorkout: (id: string) => void;
  setWorkoutPlan: (exercises: WorkoutExercise[]) => void; // convenience pass-through
};

export const useSavedWorkoutsStore = create<SavedStore>()(
  persist(
    (set, get) => ({
      savedWorkouts: [],
      addWorkout: (name, exercises) => {
        const w: SavedWorkout = {
          id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
          name: name || "My Lagree Workout",
          exercises,
          createdAt: Date.now(),
        };
        set({ savedWorkouts: [w, ...get().savedWorkouts] });
      },
      deleteWorkout: (id) =>
        set({ savedWorkouts: get().savedWorkouts.filter((w) => w.id !== id) }),
      setWorkoutPlan: () => {
        /* implemented in useWorkoutStore; kept for API parity */
      },
    }),
    {
      name: "lagree.saved.v1",
      version: 1,
    }
  )
);
