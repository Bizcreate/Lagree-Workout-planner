// lib/exercises.ts
import { Exercise, ExerciseIndex } from "./types"
import { lagreeExercises } from "@/lib/data"

/**
 * Build fast lookup maps for the exercise library and planner.
 * You can pass `extra` to layer studio-specific items on top.
 */
export function buildExerciseIndex(extra: Exercise[] = []): ExerciseIndex {
  const all = dedupeById([...lagreeExercises, ...extra])
  const byId = Object.fromEntries(all.map((e) => [e.id, e]))
  const byName: Record<string, string> = {}

  for (const e of all) {
    byName[e.name.trim().toLowerCase()] = e.id
    ;(e.aliases ?? []).forEach((a) => {
      byName[a.trim().toLowerCase()] = e.id
    })
  }

  return { byId, all, byName }
}

function dedupeById(arr: Exercise[]): Exercise[] {
  const seen = new Set<string>()
  const out: Exercise[] = []
  for (const e of arr) {
    if (seen.has(e.id)) continue
    seen.add(e.id)
    out.push(e)
  }
  return out
}
