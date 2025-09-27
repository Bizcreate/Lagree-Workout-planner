"use client"

import { MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { POSITIONS } from "@/lib/positions"

/** Why: visual, minimal, studio-agnostic positioning explainer. */
export default function PositionExplainer() {
  const rows = [POSITIONS.standard, POSITIONS.reverse, POSITIONS.giantReverse, POSITIONS.giant]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rows.map((p) => (
        <Card key={p.key} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="whitespace-nowrap">
                <MapPin className="h-3 w-3 mr-1" />
                {p.short}
              </Badge>
              <span className="text-sm font-normal text-muted-foreground">{p.label}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <MiniMachineDiagram platform={p.platform} facing={p.facing} />
            <ul className="text-sm list-disc pl-5">
              <li>Platform: <strong className="capitalize">{p.platform}</strong></li>
              <li>Facing: <strong className="capitalize">{p.facing}</strong></li>
              <li>Usage: teach consistent setup & transitions; cue safety first.</li>
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/** Tiny SVG schematic of platform & facing. */
function MiniMachineDiagram({ platform, facing }: { platform: "front" | "back"; facing: "front" | "back" }) {
  const FRONT_X = 30
  const BACK_X = 270
  const platformX = platform === "front" ? FRONT_X : BACK_X
  const faceDir = facing === "front" ? 1 : -1

  return (
    <svg viewBox="0 0 320 120" className="w-full h-28">
      {/* Deck */}
      <rect x="10" y="20" width="300" height="80" rx="8" className="fill-white dark:fill-black" stroke="#e5e7eb" />
      {/* Front platform pad */}
      <rect x={FRONT_X - 20} y="26" width="80" height="68" rx="6" fill="#e0f2fe" stroke="#bae6fd" />
      {/* Back platform pad */}
      <rect x={BACK_X - 60} y="26" width="80" height="68" rx="6" fill="#ede9fe" stroke="#ddd6fe" />
      {/* Carriage */}
      <rect x="120" y="36" width="80" height="48" rx="6" fill="#f1f5f9" stroke="#e2e8f0" />
      {/* Person pin on platform */}
      <g transform={`translate(${platformX},60)`}>
        <circle r="8" fill="#334155" />
        {/* Facing arrow */}
        <line x1="0" y1="0" x2={30 * faceDir} y2="0" stroke="#334155" strokeWidth="3" />
        <polygon
          points={`${30 * faceDir},0 ${22 * faceDir},-5 ${22 * faceDir},5`}
          fill="#334155"
        />
      </g>
      {/* Labels */}
      <text x={FRONT_X + 20} y="110" fontSize="10" textAnchor="middle" fill="#334155">front</text>
      <text x={BACK_X + 20} y="110" fontSize="10" textAnchor="middle" fill="#334155">back</text>
    </svg>
  )
}

