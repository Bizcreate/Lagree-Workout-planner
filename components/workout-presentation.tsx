// components/workout-presentation.tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { X, ChevronLeft, ChevronRight, Play, Pause, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { WorkoutExercise } from "@/lib/types"
import { useWorkoutStore } from "@/lib/store"
import { POSITIONS, positionBadge, type PositionKey } from "@/lib/positions"

// -----------------------------
// Helper: format time
// -----------------------------
function formatTime(totalSec: number) {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

// -----------------------------
// Helper: form cues generator
// -----------------------------
// Returns 3–6 short cues tailored to the exercise series, muscle groups, and position.
function getFormCues(ex: WorkoutExercise): string[] {
  const series = (ex.series ?? "").toLowerCase()
  const mg = (ex.muscleGroups ?? []).map((m) => m.toLowerCase())
  const pos: PositionKey = (ex.position as PositionKey) || "standard"

  // Position cue
  const p = POSITIONS[pos]
  const positionCue = `${p.label}: ${p.platform} platform, face ${p.facing}`

  // Series-based cues
  const bank: string[] = []

  if (["plank", "wheelbarrow", "bear", "saw", "catfish", "twisted series"].some((k) => series.includes(k))) {
    bank.push("ribs to hips (no sag)", "shoulders packed, wrists neutral", "slow out • slower in (4/4)")
  }

  if (series.includes("lunge") || ["legs", "glutes", "quads"].some((g) => mg.includes(g))) {
    bank.push("front knee stacks over ankle", "drive through heel, hip square", "tiny range at the bottom = spice")
  }

  if (series.includes("side plank") || mg.includes("obliques")) {
    bank.push("stack shoulder over elbow/wrist", "lift waist, long neck", "hips and ribs in one line")
  }

  if (series.includes("glutes")) {
    bank.push("square hips, no lumbar sway", "squeeze end range, control return")
  }

  if (series.includes("hamstrings")) {
    bank.push("length through hamstrings", "slow eccentric, no hip pop")
  }

  if (series.includes("abs")) {
    bank.push("tight C-curve (posterior tilt)", "move with breath, not momentum")
  }

  if (series.includes("triceps")) {
    bank.push("elbows track back, ribs down", "full lockout optional, control eccentric")
  }

  if (series.includes("biceps")) {
    bank.push("elbows stay pinned", "supinated grip, shoulders down/back")
  }

  if (series.includes("shoulders")) {
    bank.push("pack shoulders (no shrug)", "move from shoulder, not neck")
  }

  if (series.includes("chest")) {
    bank.push("ribs neutral, slight elbow bend", "hug the arc, smooth return")
  }

  if (series.includes("back")) {
    bank.push("long spine, pull elbows to ribs", "control the release")
  }

  if (series.includes("stretching")) {
    bank.push("no pain—just stretch", "slow nasal breathing", "square hips, lengthen on exhales")
  }

  // Always keep first cue about the position for clarity
  const unique = new Set([positionCue, ...bank])
  // return top 5 max
  return Array.from(unique).slice(0, 5)
}

// -----------------------------
// Helper: one-line instructor script
// -----------------------------
function instructorAnnounceExercise(ex: WorkoutExercise) {
  const cues = getFormCues(ex)
  const secs = ex.timeInSeconds ?? 0
  const timeLabel = secs ? `for ${formatTime(secs)}` : ""
  return `${ex.name} ${timeLabel}. ${cues.join(" • ")}.`
}

// -----------------------------
// Component
// -----------------------------
export function WorkoutPresentation({ onClose }: { onClose: () => void }) {
  const { workoutPlan } = useWorkoutStore()
  const [index, setIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const [remaining, setRemaining] = useState(() => workoutPlan[0]?.timeInSeconds ?? 0)
  const tickRef = useRef<number | null>(null)

  const ex: WorkoutExercise | undefined = workoutPlan[index]
  const nextEx = workoutPlan[index + 1]
  const hasPlan = workoutPlan.length > 0

  // Reset timer when exercise changes
  useEffect(() => {
    if (!ex) return
    setRemaining(ex.timeInSeconds ?? 0)
  }, [ex?.id])

  // Simple countdown
  useEffect(() => {
    if (!isRunning) return
    if (!ex || !remaining) return

    tickRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          // auto advance
          window.clearInterval(tickRef.current!)
          tickRef.current = null
          goNext()
          return 0
        }
        return r - 1
      })
    }, 1000) as unknown as number

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current)
      tickRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, ex?.id])

  const goPrev = () => setIndex((i) => Math.max(0, i - 1))
  const goNext = () => setIndex((i) => Math.min(workoutPlan.length - 1, i + 1))

  // Build on-screen coaching script whenever exercise changes
  const script = useMemo(() => {
    if (!ex) return ""
    return instructorAnnounceExercise(ex)
  }, [ex?.id, ex?.timeInSeconds, ex?.position])

  if (!hasPlan) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Presentation</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </CardHeader>
          <CardContent>No exercises in the plan.</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm p-4 md:p-8">
      <div className="mx-auto max-w-4xl h-full flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-muted-foreground">
            {index + 1} / {workoutPlan.length}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{ex?.name}</CardTitle>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {!isSpecialInstruction(ex) && (
                    <Badge variant="secondary">
                      <MapPin className="h-3 w-3 mr-1" />
                      {positionBadge((ex?.position as PositionKey) ?? "standard")}
                    </Badge>
                  )}
                  {(ex?.muscleGroups ?? []).map((g) => (
                    <Badge key={g} variant="outline" className="capitalize">{g}</Badge>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <div className="text-4xl font-semibold tabular-nums">{formatTime(remaining)}</div>
                <div className="mt-2 flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsRunning((s) => !s)}>
                    {isRunning ? <><Pause className="h-4 w-4 mr-1" />Pause</> : <><Play className="h-4 w-4 mr-1" />Play</>}
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7">
              <div className="text-sm text-muted-foreground">{ex?.description}</div>

              {/* Coaching bullets */}
              <ul className="mt-4 space-y-2">
                {getFormCues(ex).map((c) => (
                  <li key={c} className="text-sm">• {c}</li>
                ))}
                {ex?.notes && <li className="text-sm italic opacity-80">• Note: {ex.notes}</li>}
              </ul>

              {/* Script preview */}
              <div className="mt-4 p-3 rounded-md bg-muted/40 text-sm">
                <div className="font-medium mb-1">Callout Script</div>
                <p className="text-muted-foreground">{script}</p>
              </div>
            </div>

            {/* Next up */}
            <div className="md:col-span-5">
              <div className="rounded-md border p-3">
                <div className="text-xs uppercase text-muted-foreground">Next Up</div>
                {nextEx ? (
                  <div className="mt-2">
                    <div className="font-medium">{nextEx.name}</div>
                    {!isSpecialInstruction(nextEx) && (
                      <Badge variant="secondary" className="mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {positionBadge((nextEx.position as PositionKey) ?? "standard")}
                      </Badge>
                    )}
                    <div className="text-xs text-muted-foreground mt-2 line-clamp-3">
                      {nextEx.description}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-muted-foreground">That’s the last block.</div>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between">
            <Button variant="outline" onClick={goPrev} disabled={index === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <div className="text-sm text-muted-foreground">
              {isSpecialInstruction(ex) ? "Instruction" : "Exercise"} • {formatTime(ex?.timeInSeconds ?? 0)}
            </div>
            <Button onClick={goNext} disabled={index >= workoutPlan.length - 1}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

// Utility so presentation treats “Change sides / Repeat” as non-exercise rows
function isSpecialInstruction(ex?: WorkoutExercise) {
  if (!ex) return false
  const n = (ex.name || "").toLowerCase()
  return n === "change sides" || n === "repeat on other side" || n === "repeat other side"
}
