// components/instructor-resources.tsx
"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import {
  level1Checklist,
  resources,
  cueLibrary,
  quizQuestions,
  springGuide,
  type ChecklistItem,
  colorLinePalette,
  defaultLinesInfo,
  type LineKey,
} from "@/lib/instructor-data"
import { useInstructorStore } from "@/lib/instructor-store"
import { POSITIONS } from "@/lib/positions"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  ExternalLink,
  Filter,
  RefreshCcw,
  Copy,
  Shuffle,
  CheckCircle2,
  BookOpen,
  Zap,
  RotateCcw,
  MapPin,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/* =========================================================================
   Root
   ========================================================================= */

export function InstructorResources() {
  const [tab, setTab] = useState<"positions" | "lines" | "checklist" | "resources" | "cues" | "quiz" | "tools">(
    "positions"
  )
  const total = level1Checklist.length
  const completedCount = useInstructorProgress()
  const pct = Math.round((completedCount / total) * 100)

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Instructor • Level 1 Toolkit</CardTitle>
              <CardDescription>Checklist, resources, cue lab, quiz, tools, positions, color lines</CardDescription>
            </div>
            <div className="min-w-[220px]">
              <div className="text-xs mb-1 text-right">
                {completedCount}/{total} complete • {pct}%
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          </div>

          {/* Top tabs */}
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mt-4">
            <TabsList className="grid grid-cols-7">
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="lines">Color Lines</TabsTrigger>
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="cues">Cue Lab</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsContent value="positions">
              <PositionsTab />
            </TabsContent>

            <TabsContent value="lines">
              <ColorLinesTab />
            </TabsContent>

            <TabsContent value="checklist">
              <ChecklistTab />
            </TabsContent>

            <TabsContent value="resources">
              <ResourcesTab />
            </TabsContent>

            <TabsContent value="cues">
              <CueLabTab />
            </TabsContent>

            <TabsContent value="quiz">
              <QuizTab />
            </TabsContent>

            <TabsContent value="tools">
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

/* =========================================================================
   Positions (with schematic)
   ========================================================================= */

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

/* --- Inline SVG Schematic --- */
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
      <FacingArrow x={actorX} y={railY - 30} dir={faceDir} />

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

/* =========================================================================
   Color Lines (diagram + editable text + reference images)
   ========================================================================= */

   function ColorLinesTab() {
    const palette = colorLinePalette
    const { linesInfo, updateLine, resetLines } = useInstructorStore()
    const order: LineKey[] = ["blue", "blue2", "green", "goldenAngle", "silverAngle"]
  
    // Public assets (ensure files exist in /public/images/lagree-lines)
    const assets: Record<LineKey, { src: string; label: string }> = {
      blue: {
        src: "/images/lagree-lines/blue-line.jpg",
        label: "Blue Line — shoulder → hip",
      },
      blue2: {
        src: "/images/lagree-lines/other-blue-line.jpg",
        label: "Other Blue Line — plank diagonal",
      },
      green: {
        src: "/images/lagree-lines/green-line.jpg",
        label: "Green Line — knee over ankle",
      },
      goldenAngle: {
        src: "/images/lagree-lines/golden-angle.jpg",
        label: "Golden Angle — 90° knee bend",
      },
      silverAngle: {
        src: "/images/lagree-lines/silver-angle.jpg",
        label: "Silver Angle — shoulders over hips",
      },
    }; // <-- IMPORTANT: end the statement
  
    const referenceOrder: LineKey[] = ["blue", "blue2", "green", "goldenAngle", "silverAngle"]
    
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Diagram / legend */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle>Diagram</CardTitle>
          <CardDescription>Conceptual—markings differ by model/studio.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-3">
            <ColorLinesDiagram palette={palette} />
            <div className="grid grid-cols-1 gap-2 mt-3">
              <LegendDot color={palette.blue} label="Blue Line (shoulder → hip)" />
              <LegendDot color={palette.blue2} label="Blue (alt) dashed" dashed />
              <LegendDot color={palette.green} label="Green Line (knee over ankle)" />
              <LegendDot color={palette.silverAngle} label="Silver Angle (shoulders over hips)" />
              <LegendDot color={palette.goldenAngle} label="Golden Angle (90° at knee)" />
            </div>
            <div className="text-xs text-muted-foreground mt-3">
              Use these landmarks consistently when cueing stance width, knee tracking, and torso angles. Always verify
              your studio’s color scheme.
            </div>
          </div>

          <Button variant="outline" size="sm" className="mt-3" onClick={resetLines}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to defaults
          </Button>
        </CardContent>
      </Card>

      {/* Explanations (editable) */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle>Explanations (editable)</CardTitle>
          <CardDescription>Saved locally for instructors; customize per studio.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.map((key) => (
              <div key={key} className="border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: colorLinePalette[key] }}
                  />
                  <Input
                    value={linesInfo[key]?.title ?? defaultLinesInfo[key].title}
                    onChange={(e) => useInstructorStore.getState().updateLine(key, { title: e.target.value })}
                    className="max-w-sm"
                  />
                </div>
                <Textarea
                  rows={3}
                  value={linesInfo[key]?.description ?? defaultLinesInfo[key].description}
                  onChange={(e) => updateLine(key, { description: e.target.value })}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reference images (full-width) */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle>Reference Images</CardTitle>
          <CardDescription>Visual examples of each line/angle.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {referenceOrder.map((k) => {
            const a = assets[k]
            const dot = colorLinePalette[k]
            return (
              <div key={k} className="border rounded-lg overflow-hidden">
                <div className="relative w-full aspect-[16/9] bg-muted">
                  {/* Use object-contain so the whole photo is visible (no crop) */}
                  <Image
                    src={a.src}
                    alt={a.label}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-contain"
                    priority={k === "blue"}
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: dot }} />
                  <span className="text-sm">{a.label}</span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

/* --- Color lines SVG (semantics aligned to the images) --- */
function ColorLinesDiagram({ palette }: { palette: Record<string, string> }) {
  return (
    <svg viewBox="0 0 360 240" className="w-full h-auto">
      {/* Platform */}
      <rect x="20" y="190" width="320" height="28" rx="8" fill="#f8fafc" stroke="#e5e7eb" />

      {/* Hip / knee / ankle markers */}
      <circle cx="180" cy="130" r="4" fill="#475569" opacity="0.35" />
      <circle cx="220" cy="130" r="4" fill="#475569" opacity="0.35" />
      <circle cx="220" cy="190" r="4" fill="#475569" opacity="0.35" />

      {/* Neutral thigh/shin */}
      <line x1="180" y1="130" x2="220" y2="130" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
      <line x1="220" y1="130" x2="220" y2="190" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
      {/* Foot on platform */}
      <rect x="205" y="190" width="30" height="10" rx="2" fill="#94a3b8" opacity="0.25" />

      {/* Shoulder reference */}
      <circle cx="160" cy="90" r="4" fill="#475569" opacity="0.35" />
      <line x1="160" y1="90" x2="180" y2="130" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" opacity="0.25" />

      {/* Blue: shoulder → hip */}
      <line x1="160" y1="90" x2="180" y2="130" stroke={palette.blue} strokeWidth="3" />

      {/* Blue (alt): dashed parallel variant */}
      <line
        x1="168"
        y1="84"
        x2="188"
        y2="124"
        stroke={palette.blue2}
        strokeWidth="3"
        strokeDasharray="6 4"
        opacity="0.9"
      />

      {/* Green: knee stacked over ankle */}
      <line x1="220" y1="130" x2="220" y2="190" stroke={palette.green} strokeWidth="3" />

      {/* Silver Angle: shoulders over hips (upright torso) */}
      <line x1="180" y1="80" x2="180" y2="130" stroke={palette.silverAngle} strokeWidth="3" />
      <circle cx="180" cy="90" r="3" fill={palette.silverAngle} />

      {/* Golden Angle: 90° knee bend */}
      <path d="M 238 130 A 18 18 0 0 1 220 148" fill="none" stroke={palette.goldenAngle} strokeWidth="3" />
      <text x="232" y="145" fontSize="10" fill={palette.goldenAngle} style={{ userSelect: "none" }}>
        90°
      </text>
    </svg>
  )
}

function LegendDot({ color, label, dashed = false }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="flex-1">{label}</span>
      <svg viewBox="0 0 80 6" className="w-24 h-2">
        <line x1="2" y1="3" x2="78" y2="3" stroke={color} strokeWidth="3" strokeDasharray={dashed ? "6 4" : undefined} />
      </svg>
    </div>
  )
}

/* =========================================================================
   Checklist
   ========================================================================= */

function ChecklistTab() {
  const { completed, notes, toggleComplete, setNote, clearChecklist } = useInstructorStore()
  const [q, setQ] = useState("")
  const [cat, setCat] = useState<ChecklistItem["category"] | "All">("All")
  const cats: (ChecklistItem["category"] | "All")[] = [
    "All",
    "Foundations",
    "Machine",
    "Safety",
    "Coaching",
    "Class Design",
    "Policies",
  ]
  const list = level1Checklist.filter(
    (i) => (cat === "All" || i.category === cat) && i.text.toLowerCase().includes(q.toLowerCase())
  )
  const toggleAllShown = () => list.forEach((i) => toggleComplete(i.id))

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <Input placeholder="Search checklist..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          <Filter className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
        </div>
        <Select value={cat} onValueChange={(v) => setCat(v as any)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {cats.map((c) => (
              <SelectItem key={c} value={c as string}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={toggleAllShown}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Toggle All Shown
        </Button>
        <Button variant="outline" onClick={clearChecklist}>Reset</Button>
      </div>

      <div className="space-y-2">
        {list.map((item) => (
          <div key={item.id} className="border rounded-md p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={!!completed[item.id]}
                  onCheckedChange={() => toggleComplete(item.id)}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {item.text}
                    <Badge variant="secondary">{item.category}</Badge>
                    {completed[item.id] && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  </div>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary inline-flex items-center gap-1"
                    >
                      Open reference <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <Textarea
                rows={2}
                value={notes[item.id] ?? ""}
                onChange={(e) => setNote(item.id, e.target.value)}
                placeholder="Personal notes, regressions, or cues…"
              />
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No items match your filters.</p>
        )}
      </div>
    </div>
  )
}

/* =========================================================================
   Resources
   ========================================================================= */

function ResourcesTab() {
  const [q, setQ] = useState("")
  const [type, setType] = useState<"all" | "video" | "article" | "doc" | "site">("all")
  const filtered = resources.filter(
    (r) => (type === "all" || r.type === type) && (r.title + r.description).toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <Input placeholder="Search resources..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          <BookOpen className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
        </div>
        <Select value={type} onValueChange={(v) => setType(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="article">Articles</SelectItem>
            <SelectItem value="doc">Docs</SelectItem>
            <SelectItem value="site">Sites</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="border rounded-md p-3 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{r.title}</div>
              <Badge variant="outline" className="capitalize">
                {r.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
          </a>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No matches.</p>}
    </div>
  )
}

/* =========================================================================
   Cue Lab
   ========================================================================= */

function CueLabTab() {
  const { favoriteCues, addFavoriteCue, removeFavoriteCue } = useInstructorStore()
  const groups = Object.keys(cueLibrary)
  const [group, setGroup] = useState<string>(groups[0])
  const [cues, setCues] = useState<string[]>(sampleCues(group))

  function sampleCues(g: string) {
    const src = cueLibrary[g] ?? []
    return shuffle(src).slice(0, Math.min(4, src.length))
  }
  const shuffleCues = () => setCues(sampleCues(group))
  const copyAll = async () => {
    const text = cues.join(" • ")
    try {
      await navigator.clipboard.writeText(text)
    } catch {}
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle>Cue Generator</CardTitle>
          <CardDescription>Pick a focus and shuffle concise cues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <Select
              value={group}
              onValueChange={(v) => {
                setGroup(v)
                setCues(sampleCues(v))
              }}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g} value={g}>
                    {capitalize(g)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={shuffleCues}>
              <Shuffle className="h-4 w-4 mr-2" />
              Shuffle
            </Button>
            <Button variant="outline" onClick={copyAll}>
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cues.map((c) => (
              <div key={c} className="border rounded-md p-3 flex items-start justify-between">
                <span className="text-sm">{c}</span>
                {favoriteCues.includes(c) ? (
                  <Button size="sm" variant="ghost" onClick={() => removeFavoriteCue(c)}>
                    Remove
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => addFavoriteCue(c)}>
                    Save
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Saved Cues</CardTitle>
          <CardDescription>Your favorites for class scripts</CardDescription>
        </CardHeader>
        <CardContent>
          {favoriteCues.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved cues yet.</p>
          ) : (
            <ul className="space-y-2">
              {favoriteCues.map((c) => (
                <li key={c} className="border rounded-md p-2 text-sm">
                  {c}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* =========================================================================
   Quiz
   ========================================================================= */

function QuizTab() {
  const { addQuizResult } = useInstructorStore()
  const [idx, setIdx] = useState(0)
  const [choice, setChoice] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const q = quizQuestions[idx]
  const done = idx >= quizQuestions.length

  const submit = () => {
    if (choice === null) return
    if (choice === q.answerIndex) setScore((s) => s + 1)
    setChoice(null)
    if (idx + 1 < quizQuestions.length) setIdx((i) => i + 1)
    else {
      addQuizResult(score + (choice === q.answerIndex ? 1 : 0), quizQuestions.length)
      setIdx((i) => i + 1)
    }
  }
  const restart = () => {
    setIdx(0)
    setChoice(null)
    setScore(0)
  }

  if (done) {
    const finalScore = score
    const total = quizQuestions.length
    const pct = Math.round((finalScore / total) * 100)
    return (
      <div className="text-center py-10">
        <div className="text-2xl font-semibold mb-2">
          Score: {finalScore}/{total} • {pct}%
        </div>
        <p className="text-muted-foreground mb-4">Practice regularly—aim for ≥ 80% before L1 checkout.</p>
        <Button onClick={restart}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="text-sm text-muted-foreground">
        Question {idx + 1} of {quizQuestions.length}
      </div>
      <div className="text-lg font-medium">{q.question}</div>
      <div className="space-y-2">
        {q.options.map((op, i) => (
          <label
            key={i}
            className={`flex items-center gap-2 border rounded-md p-2 cursor-pointer ${choice === i ? "border-primary" : ""}`}
          >
            <input type="radio" className="accent-current" checked={choice === i} onChange={() => setChoice(i)} />
            <span className="text-sm">{op}</span>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={submit}>Submit</Button>
        <Badge variant="outline">
          <Zap className="h-3 w-3 mr-1" />
          Tip: justify your answer out loud.
        </Badge>
      </div>
    </div>
  )
}

/* =========================================================================
   Tools
   ========================================================================= */

function ToolsTab() {
  const [family, setFamily] = useState("Core")
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner")
  const guide = springGuide.find((g) => g.family === family)
  const text =
    level === "beginner" ? guide?.beginner : level === "intermediate" ? guide?.intermediate : guide?.advanced
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${family}: ${text}`)
    } catch {}
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Springs Suggester</CardTitle>
          <CardDescription>Baseline guidance—always coach to the client.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Select value={family} onValueChange={setFamily}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {springGuide.map((g) => (
                  <SelectItem key={g.family} value={g.family}>
                    {g.family}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={level} onValueChange={(v) => setLevel(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-md p-3">
            <div className="text-sm">Recommendation</div>
            <div className="text-lg font-semibold">{text}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Adjust for machine model, bodyweight, fatigue, and control.
            </p>
            <Button variant="outline" size="sm" onClick={copy} className="mt-2">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Class Script Builder (quick)</CardTitle>
          <CardDescription>Draft an opening + safety brief template.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            rows={8}
            defaultValue={`Welcome! Today we're focusing on control and time-under-tension.
• Safety: wrists neutral; knees track; stop with pain.
• Tempo: 4 out / 4 in—move like honey.
• I’ll cue form and preview transitions at 10s.
Breathe and own your range.`}
          />
        </CardContent>
      </Card>
    </div>
  )
}

/* =========================================================================
   utils
   ========================================================================= */

function shuffle<T>(arr: T[]) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}