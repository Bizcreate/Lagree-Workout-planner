// components/instructor-resources.tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
  level1Checklist,
  resources,
  cueLibrary,
  quizQuestions,
  springGuide,
  colorLinePalette,
  defaultLinesInfo,
  type LineKey,
  type ChecklistItem,
} from "@/lib/instructor-data"
import { useInstructorStore } from "@/lib/instructor-store"
import { POSITIONS } from "@/lib/positions"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  CheckCircle2,
  ExternalLink,
  Copy,
  Shuffle,
} from "lucide-react"

/* ────────────────────────────────────────────────────────────────────────── */
/* Root                                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

export function InstructorResources() {
  const [tab, setTab] = useState<"positions" | "lines" | "checklist" | "resources" | "cues" | "quiz" | "tools">(
    "positions",
  )

  const total = level1Checklist.length
  const completedCount = useInstructorProgress()
  const pct = Math.round((completedCount / total) * 100)

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Instructor • Level 1 Toolkit</CardTitle>
              <CardDescription>Checklist, resources, cue lab, quiz, tools, positions, color lines</CardDescription>
            </div>
            <div className="min-w-[210px]">
              <div className="text-xs mb-1 text-right">
                {completedCount}/{total} complete • {pct}%
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          </div>

          {/* Mobile-friendly, horizontally scrollable tab bar */}
          <div className="mt-4">
            <ScrollableTabsBar
              items={[
                { value: "positions", label: "Positions" },
                { value: "lines", label: "Color Lines" },
                { value: "checklist", label: "Checklist" },
                { value: "resources", label: "Resources" },
                { value: "cues", label: "Cue Lab" },
                { value: "quiz", label: "Quiz" },
                { value: "tools", label: "Tools" },
              ]}
              value={tab}
              onChange={(v) => setTab(v as any)}
            />
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsContent value="positions" className="mt-0">
              <PositionsTab />
            </TabsContent>

            <TabsContent value="lines" className="mt-0">
              <ColorLinesTab />
            </TabsContent>

            <TabsContent value="checklist" className="mt-0">
              <ChecklistTab />
            </TabsContent>

            <TabsContent value="resources" className="mt-0">
              <ResourcesTab />
            </TabsContent>

            <TabsContent value="cues" className="mt-0">
              <CueLabTab />
            </TabsContent>

            <TabsContent value="quiz" className="mt-0">
              <QuizTab />
            </TabsContent>

            <TabsContent value="tools" className="mt-0">
              <ToolsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function useInstructorProgress() {
  const completed = useInstructorStore((s) => s.completed)
  return useMemo(() => level1Checklist.filter((i) => completed[i.id]).length, [completed])
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Scrollable Tabs Bar (with left/right nudge hints)                         */
/* ────────────────────────────────────────────────────────────────────────── */

function ScrollableTabsBar({
  items,
  value,
  onChange,
}: {
  items: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [showL, setShowL] = useState(false)
  const [showR, setShowR] = useState(false)

  const compute = () => {
    const el = ref.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setShowL(scrollLeft > 2)
    setShowR(scrollLeft + clientWidth < scrollWidth - 2)
  }

  useEffect(() => {
    compute()
    const el = ref.current
    if (!el) return
    const onScroll = () => compute()
    el.addEventListener("scroll", onScroll, { passive: true })
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", onScroll)
      ro.disconnect()
    }
  }, [])

  const nudge = (delta: number) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: delta, behavior: "smooth" })
  }

  return (
    <div className="relative">
      {showL && (
        <button
          aria-label="Scroll left"
          onClick={() => nudge(-140)}
          className="absolute left-0 top-0 bottom-0 z-10 px-1 grid place-items-center scroll-fade-left"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
      {showR && (
        <button
          aria-label="Scroll right"
          onClick={() => nudge(140)}
          className="absolute right-0 top-0 bottom-0 z-10 px-1 grid place-items-center scroll-fade-right"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      )}

      <Tabs value={value} onValueChange={onChange}>
        <TabsList
          ref={ref as any}
          className="
            w-full flex gap-2 overflow-x-auto no-scrollbar hscroll scroll-edge-fade
            p-1 pr-6
          "
        >
          {items.map((it) => (
            <TabsTrigger
              key={it.value}
              value={it.value}
              className="flex-shrink-0 whitespace-nowrap px-3 py-1 text-xs sm:text-sm"
            >
              {it.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Positions Tab                                                             */
/* ────────────────────────────────────────────────────────────────────────── */

function PositionsTab() {
  const items = [
    {
      key: "standard",
      meta: POSITIONS.standard,
      blurb:
        "Used for mapping every exercise into 4 directions. Teach foot/hand placement and body orientation clearly.",
    },
    {
      key: "reverse",
      meta: POSITIONS.reverse,
      blurb: "Cue transitions first, then facing. Watch wrist/knee tracking when reversing.",
    },
    {
      key: "giantReverse",
      meta: POSITIONS.giantReverse,
      blurb: "Long lever patterns—keep torso stacked and control the carriage.",
    },
    {
      key: "giant",
      meta: POSITIONS.giant,
      blurb: "Back platform start; clear instruction on foot bars/handles before moving.",
    },
  ] as const

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map(({ key, meta, blurb }) => (
        <Card key={key}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">
                <MapPin className="h-3 w-3 mr-1" />
                {meta.label}
              </Badge>
            </CardTitle>
            <CardDescription className="capitalize">
              {meta.platform} platform, facing {meta.facing}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border rounded-md p-3">
              <MachinePositionDiagram platform={meta.platform as "front" | "back"} facing={meta.facing as "front" | "back"} />
              <p className="mt-2 text-xs text-muted-foreground">
                Top-down schematic (not to scale). Left = front end, right = back end.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{blurb}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function MachinePositionDiagram({
  platform,
  facing,
}: {
  platform: "front" | "back"
  facing: "front" | "back"
}) {
  const W = 420,
    H = 140
  const pad = 16
  const railY = 70
  const frontEndX = pad
  const backEndX = W - pad
  const deckX = frontEndX + 10
  const deckW = W - (pad + pad) - 20
  const deckH = 36
  const deckY = railY - deckH / 2
  const platformW = 110
  const carriageW = 120
  const carriageX = (W - carriageW) / 2

  const actorX = platform === "front" ? frontEndX + 40 : backEndX - 40
  const faceDir = facing === "front" ? -1 : 1

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* labels */}
      <text x={frontEndX} y={22} fontSize="10" fill="#64748b">
        FRONT
      </text>
      <text x={backEndX - 30} y={22} fontSize="10" fill="#64748b">
        BACK
      </text>

      {/* rails */}
      <line x1={frontEndX} y1={railY - 18} x2={backEndX} y2={railY - 18} stroke="#e5e7eb" strokeWidth="2" />
      <line x1={frontEndX} y1={railY + 18} x2={backEndX} y2={railY + 18} stroke="#e5e7eb" strokeWidth="2" />

      {/* platforms */}
      <rect x={deckX} y={deckY} width={platformW} height={deckH} rx="6" fill="#f1f5f9" stroke="#e5e7eb" />
      <rect
        x={deckX + deckW - platformW}
        y={deckY}
        width={platformW}
        height={deckH}
        rx="6"
        fill="#f1f5f9"
        stroke="#e5e7eb"
      />

      {/* carriage */}
      <rect x={carriageX} y={deckY + 4} width={carriageW} height={deckH - 8} rx="6" fill="#ffffff" stroke="#cbd5e1" />

      {/* footbar / handle hints */}
      <rect x={deckX + 6} y={deckY - 6} width="20" height="6" rx="2" fill="#cbd5e1" />
      <rect x={deckX + deckW - 26} y={deckY - 6} width="20" height="6" rx="2" fill="#cbd5e1" />

      {/* user marker */}
      <circle cx={actorX} cy={railY - 22} r="6" fill="#0ea5e9" />
      <rect x={actorX - 4} y={railY - 16} width="8" height="16" rx="3" fill="#0ea5e9" />

      {/* feet on chosen platform */}
      {platform === "front" ? (
        <>
          <rect x={deckX + 24} y={deckY + deckH + 2} width="18" height="6" rx="2" fill="#94a3b8" />
          <rect x={deckX + 46} y={deckY + deckH + 2} width="18" height="6" rx="2" fill="#94a3b8" />
        </>
      ) : (
        <>
          <rect x={deckX + deckW - platformW + 24} y={deckY + deckH + 2} width="18" height="6" rx="2" fill="#94a3b8" />
          <rect x={deckX + deckW - platformW + 46} y={deckY + deckH + 2} width="18" height="6" rx="2" fill="#94a3b8" />
        </>
      )}

      {/* facing arrow */}
      <FacingArrow x={actorX} y={railY - 30} dir={faceDir as -1 | 1} />

      {/* captions */}
      <text x={deckX + 4} y={deckY + deckH + 18} fontSize="10" fill="#64748b">
        front platform
      </text>
      <text x={deckX + deckW - platformW + 4} y={deckY + deckH + 18} fontSize="10" fill="#64748b">
        back platform
      </text>
    </svg>
  )
}

function FacingArrow({ x, y, dir }: { x: number; y: number; dir: -1 | 1 }) {
  const len = 38
  const endX = x + dir * len
  return (
    <g>
      <line x1={x} y1={y} x2={endX} y2={y} stroke="#0ea5e9" strokeWidth="3" />
      <polygon points={`${endX},${y} ${endX - 8 * dir},${y - 5} ${endX - 8 * dir},${y + 5}`} fill="#0ea5e9" />
      <text x={x - 8} y={y - 8} textAnchor="end" fontSize="10" fill="#0ea5e9">
        facing
      </text>
    </g>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Color Lines                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function ColorLinesTab() {
  const { linesInfo, updateLine, resetLines } = useInstructorStore()
  const order: LineKey[] = ["blue", "blue2", "green", "goldenAngle", "silverAngle"]

  const assets: Record<LineKey, { src: string; label: string }> = {
    blue: { src: "/images/lagree-lines/blue-line.jpg", label: "Blue Line — shoulder → hip" },
    blue2: { src: "/images/lagree-lines/other-blue-line.jpg", label: "Other Blue Line — plank diagonal" },
    green: { src: "/images/lagree-lines/green-line.jpg", label: "Green Line — knee over ankle" },
    goldenAngle: { src: "/images/lagree-lines/golden-angle.jpg", label: "Golden Angle — 90° knee bend" },
    silverAngle: { src: "/images/lagree-lines/silver-angle.jpg", label: "Silver Angle — shoulders over hips" },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Diagram + editable copy */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle>Color Lines</CardTitle>
          <CardDescription>Quick reference + your own editable blurbs/cues.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Editable blurbs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {order.map((k) => {
              const info = linesInfo[k] ?? defaultLinesInfo[k]
              const dotColor = colorLinePalette[k]
              return (
                <div key={k} className="border rounded-md p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className="font-medium capitalize">{info.title}</span>
                  </div>
                  <Textarea
                    value={info.notes}
                    onChange={(e) => updateLine(k, { notes: e.target.value })}
                    placeholder="Add your coaching notes for this line…"
                    className="min-h-[84px]"
                  />
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => resetLines()}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reference images */}
      <Card>
        <CardHeader>
          <CardTitle>Reference Images</CardTitle>
          <CardDescription>Visual examples of each line/angle.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {order.map((k) => {
              const asset = assets[k]
              const labelColor = colorLinePalette[k]
              return (
                <div key={k} className="rounded-md border">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-md bg-muted">
                    <Image
                      src={asset.src}
                      alt={asset.label}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      priority={k === "blue"}
                    />
                  </div>
                  <div className="p-3 border-t flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: labelColor }}
                    />
                    <span className="text-sm">{asset.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Checklist                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

function ChecklistTab() {
  const completed = useInstructorStore((s) => s.completed)
  const toggle = useInstructorStore((s) => s.toggleChecklist)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {level1Checklist.map((item) => {
        const done = !!completed[item.id]
        return (
          <Card key={item.id} className={done ? "border-green-200" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Checkbox checked={done} onCheckedChange={() => toggle(item.id)} />
                {item.title}
              </CardTitle>
              {item.description && <CardDescription>{item.description}</CardDescription>}
            </CardHeader>
            {item.notes !== undefined && (
              <CardContent>
                <Textarea
                  placeholder="Your notes…"
                  value={item.notes}
                  onChange={(e) => item.onNotes?.(e.target.value)}
                />
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Resources                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

function ResourcesTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {resources.map((r) => (
        <Card key={r.url}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{r.title}</CardTitle>
            {r.subtitle && <CardDescription>{r.subtitle}</CardDescription>}
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{r.description}</div>
            <Button asChild variant="secondary">
              <a href={r.url} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Cue Lab                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

function CueLabTab() {
  const [q, setQ] = useState("")

  const cues = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return cueLibrary
    return cueLibrary.filter(
      (c) =>
        c.text.toLowerCase().includes(query) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(query)),
    )
  }, [q])

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // noop
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search cues or tags (e.g. shoulders, ribs, tempo)…"
        />
        <Button variant="outline" onClick={() => setQ("")}>
          Clear
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {cues.map((c) => (
          <Card key={c.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{c.text}</CardTitle>
              {c.tags && c.tags.length > 0 && (
                <CardDescription className="flex flex-wrap gap-1">
                  {c.tags.map((t) => (
                    <Badge key={t} variant="outline" className="capitalize">
                      {t}
                    </Badge>
                  ))}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => copy(c.text)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              {c.variation && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copy(c.variation!)}
                  className="ml-auto"
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Variation
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Quiz                                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

function QuizTab() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [show, setShow] = useState(false)

  return (
    <div className="space-y-4">
      {quizQuestions.map((q) => (
        <Card key={q.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{q.question}</CardTitle>
            <CardDescription>Choose one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt
                return (
                  <Button
                    key={opt}
                    variant={selected ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setAnswers((s) => ({ ...s, [q.id]: opt }))}
                  >
                    {opt}
                  </Button>
                )
              })}
            </div>
            {show && (
              <div className="text-sm">
                {answers[q.id] === q.answer ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Correct
                  </span>
                ) : (
                  <span className="text-red-600">Not quite</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2">
        <Button onClick={() => setShow(true)}>Check Answers</Button>
        <Button variant="outline" onClick={() => (setAnswers({}), setShow(false))}>
          Reset
        </Button>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Tools                                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

function ToolsTab() {
  const [springs, setSprings] = useState(springGuide?.default || "light")

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Spring Guide</CardTitle>
          <CardDescription>Choose a baseline and adjust per client.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 items-center">
          <Select value={springs} onValueChange={setSprings}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {springGuide?.options?.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            {springGuide?.notes?.[springs] || "—"}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
