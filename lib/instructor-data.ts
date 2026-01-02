export type ChecklistItem = {
    id: string
    category: "Foundations" | "Machine" | "Safety" | "Coaching" | "Class Design" | "Policies"
    text: string
    link?: string
  }
  
  export const level1Checklist: ChecklistItem[] = [
    { id: "f-01", category: "Foundations", text: "Principles: Time-under-tension, slow tempo (≈4–4), Form > reps" },
    { id: "f-02", category: "Foundations", text: "Anatomy basics: planes of motion, neutral spine, hip/knee tracking" },
    { id: "m-01", category: "Machine", text: "Megaformer parts & setup: carriage, platforms, springs, handles" },
    { id: "m-02", category: "Machine", text: "Spring loads by family + safety checks pre-class" },
    { id: "s-01", category: "Safety", text: "Common regressions/contraindications (wrists, knees, pregnancy)" },
    { id: "s-02", category: "Safety", text: "Spotting, carriage control, and safe transitions" },
    { id: "c-01", category: "Coaching", text: "What + How + Why cue stack" },
    { id: "c-02", category: "Coaching", text: "Layering: base cue → tactile/visual → breath/tempo" },
    { id: "c-03", category: "Coaching", text: "Time calls: 30s / 15s / 10s + next-move preview" },
    { id: "d-01", category: "Class Design", text: "Block: Core → Legs L/R → Arms → Obliques/Finish" },
    { id: "d-02", category: "Class Design", text: "Balance: push/pull, anterior/posterior, left/right" },
    { id: "p-01", category: "Policies", text: "Pre-class talk: disclaimers, injuries, emergency plan" },
  ]
  
  export type ResourceLink = {
    title: string
    description: string
    url: string
    type: "video" | "article" | "doc" | "site"
  }
  
  export const resources: ResourceLink[] = [
    { title: "Lagree Fitness (official)", description: "Method overview, certification info.", url: "https://www.lagreefitness.com/", type: "site" },
    { title: "Coaching Cues Framework", description: "What + How + Why cueing model.", url: "https://www.precisionnutrition.com/cueing", type: "article" },
    { title: "Megaformer Basics", description: "YT search: parts, springs, setup.", url: "https://www.youtube.com/results?search_query=megaformer+basics", type: "video" },
    { title: "ACE: Planes of Motion", description: "Sagittal / Frontal / Transverse cheat sheet.", url: "https://www.acefitness.org/education-and-resources/lifestyle/blog/6654/anatomy-planes", type: "article" },
  ]
  
  export const cueLibrary: Record<string, string[]> = {
    core: [
      "Ribs over pelvis; brace gently.",
      "Move slow; control the return.",
      "Press floor away; protract shoulders.",
      "Neutral neck; gaze forward.",
    ],
    obliques: [
      "Rotate from ribs, not shoulders.",
      "Hips square; wring out waist.",
      "Exhale on twist.",
    ],
    legs: [
      "Front knee stacks over ankle.",
      "Drive through heel; load hamstrings.",
      "Tall torso; chest up.",
    ],
    glutes: [
      "Squeeze at end range; 2s pause.",
      "Hips level; no swayback.",
      "Push platform away, not up.",
    ],
    arms: [
      "Elbows track close; 4s eccentric.",
      "Pack shoulders; lats on.",
      "Wrists neutral.",
    ],
    back: [
      "Lead with elbows; pinch blades.",
      "Long spine; crown forward.",
    ],
  }
  
  export type QuizQ = { id: string; question: string; options: string[]; answerIndex: number }
  export const quizQuestions: QuizQ[] = [
    { id: "q1", question: "Primary goal of Lagree tempo?", options: ["Power output", "Time under tension", "Max HR", "Range of motion"], answerIndex: 1 },
    { id: "q2", question: "Safe knee position in lunges?", options: ["Past toes", "Locked out", "Over ankle", "Collapsed inward"], answerIndex: 2 },
    { id: "q3", question: "Cue priority order?", options: ["Why→How→What", "What→How→Why", "How→Why→What", "Any order"], answerIndex: 1 },
    { id: "q4", question: "When to preview next move?", options: ["Start", "Halfway", "Last 10s", "Never"], answerIndex: 2 },
    { id: "q5", question: "Fix wrist pain in Wheelbarrow?", options: ["More load", "Handles/modify range", "Faster", "Ignore"], answerIndex: 1 },
    { id: "q6", question: "Balanced class needs:", options: ["Only legs", "Only core", "Push/pull + A/P", "Random"], answerIndex: 2 },
  ]
  
  /* ---- Springs quick guide used by Tools tab ---- */
  export const springGuide = [
    { family: "Core", beginner: "Light–medium springs; emphasize control.", intermediate: "Medium; increase range.", advanced: "Medium–heavy; long negatives." },
    { family: "Legs", beginner: "Medium; knee over ankle.", intermediate: "Medium–heavy; deeper range.", advanced: "Heavy; tempo 4–4; pauses." },
    { family: "Glutes", beginner: "Light–medium; focus on hip level.", intermediate: "Medium; pulses/end range.", advanced: "Medium–heavy; isometrics." },
    { family: "Arms", beginner: "Light; high control.", intermediate: "Light–medium; full ROM.", advanced: "Medium; 4s eccentric." },
    { family: "Back", beginner: "Light–medium; scapular control.", intermediate: "Medium; rowing series.", advanced: "Medium–heavy; holds." },
  ]
  
  /* ---- Color Lines palette + copy (aligned to your definitions) ---- */
  export type LineKey = "blue" | "blue2" | "green" | "goldenAngle" | "silverAngle"
  
  export const colorLinePalette: Record<LineKey, string> = {
    blue: "#2563eb",        // Blue line
    blue2: "#1d4ed8",       // Optional second blue
    green: "#10b981",       // Green line
    goldenAngle: "#f59e0b", // Golden angle
    silverAngle: "#9ca3af", // Silver angle
  }
  
  export const defaultLinesInfo: Record<LineKey, { title: string; description: string }> = {
    blue: {
      title: "Blue Line",
      description:
        "Diagonal from shoulders to hips for core stability. Keep ribs stacked over pelvis with a long spine; cue controlled bracing and anti-arching.",
    },
    blue2: {
      title: "Other Blue Line (optional)",
      description:
        "Studio-specific secondary diagonal reference. Use if your studio marks two diagonals to standardize alternate shoulder–hip paths or stance widths.",
    },
    green: {
      title: "Green Line",
      description:
        "Knee stacked over ankle to protect the knees. Think 'knee over 2nd/3rd toe' while maintaining heel contact and controlled carriage.",
    },
    goldenAngle: {
      title: "Golden Angle",
      description:
        "90° knee bend to maximize activation of glutes, hamstrings, and quads. Use as a depth target in lunges/squats without torso collapse.",
    },
    silverAngle: {
      title: "Silver Angle",
      description:
        "Shoulders stacked over hips for an upright torso and engaged core. Keep ribs over pelvis; avoid flaring or hinging.",
    },
  }
