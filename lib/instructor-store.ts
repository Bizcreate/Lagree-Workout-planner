import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { LineKey } from "./instructor-data"
import { defaultLinesInfo } from "./instructor-data"

type State = {
  completed: Record<string, boolean>
  notes: Record<string, string>
  favoriteCues: string[]
  quizHistory: { date: number; score: number; total: number }[]
  linesInfo: Record<LineKey, { title: string; description: string }>
}
type Actions = {
  toggleComplete: (id: string) => void
  setNote: (id: string, text: string) => void
  clearChecklist: () => void
  addFavoriteCue: (cue: string) => void
  removeFavoriteCue: (cue: string) => void
  addQuizResult: (score: number, total: number) => void
  updateLine: (key: LineKey, patch: Partial<{ title: string; description: string }>) => void
  resetLines: () => void
}

export const useInstructorStore = create<State & Actions>()(
  persist(
    (set) => ({
      completed: {},
      notes: {},
      favoriteCues: [],
      quizHistory: [],
      linesInfo: defaultLinesInfo,
      toggleComplete: (id) => set((s) => ({ completed: { ...s.completed, [id]: !s.completed[id] } })),
      setNote: (id, text) => set((s) => ({ notes: { ...s.notes, [id]: text } })),
      clearChecklist: () => set({ completed: {}, notes: {} }),
      addFavoriteCue: (cue) => set((s) => ({ favoriteCues: s.favoriteCues.includes(cue) ? s.favoriteCues : [...s.favoriteCues, cue] })),
      removeFavoriteCue: (cue) => set((s) => ({ favoriteCues: s.favoriteCues.filter((c) => c !== cue) })),
      addQuizResult: (score, total) => set((s) => ({ quizHistory: [...s.quizHistory, { date: Date.now(), score, total }] })),
      updateLine: (key, patch) => set((s) => ({ linesInfo: { ...s.linesInfo, [key]: { ...s.linesInfo[key], ...patch } } })),
      resetLines: () => set({ linesInfo: defaultLinesInfo }),
    }),
    { name: "lagree-instructor-v1" }
  )
)
