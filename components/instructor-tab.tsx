// components/instructor-tab.tsx
"use client"

import PositionExplainer from "@/components/position-explainer"
import { InstructorResources } from "@/components/instructor-resources"

export default function InstructorTab() {
  return (
    <div className="space-y-6">
      {/* 1) Machine positions explainer */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Machine Positioning (L1–L4)</h2>
        <PositionExplainer />
      </div>

      {/* 2) Full Level 1 Toolkit (your previous content) */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Instructor • Level 1 Toolkit</h2>
        <InstructorResources />
      </div>
    </div>
  )
}
