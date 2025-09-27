// lib/lagree-exercises.ts
import type { WorkoutExercise } from "@/lib/types"

// If you already export PositionKey elsewhere, import it instead.
export type PositionKey = "standard" | "reverse" | "giant" | "giantReverse"
export const ALL_POSITIONS: PositionKey[] = ["standard", "reverse", "giant", "giantReverse"]

/* -------------------------------------------------------------------------- */
/* Utils                                                                      */
/* -------------------------------------------------------------------------- */
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

function defaultSecondsFor(family?: string, name?: string) {
  const f = (family || "").toLowerCase()
  const n = (name || "").toLowerCase()

  if (f.includes("plank") || n.includes("plank")) return 60
  if (f.includes("wheelbarrow") || n.includes("wheelbarrow")) return 60
  if (f.includes("saw") || n.includes("saw")) return 45
  if (f.includes("bear") || n.includes("bear")) return 45
  if (f.includes("catfish") || n.includes("catfish")) return 45

  if (f.includes("lunge") || n.includes("lunge")) {
    if (n.includes("carriage kicks") || n.includes("mini")) return 40
    return 60
  }

  if (f.includes("glutes") || f.includes("abduct") || f.includes("adduct")) return 50
  if (f.includes("hamstring")) return 50
  if (f.includes("quads")) return 50

  if (f.includes("abdominals") || f.includes("abs")) return 45
  if (f.includes("triceps") || f.includes("biceps") || f.includes("shoulders") || f.includes("chest") || f.includes("back")) return 45

  if (f.includes("stretch")) return 60
  return 45
}

function withPositions(
  baseName: string,
  base: Partial<WorkoutExercise> & { family: string; muscleGroups: string[] },
  positions: PositionKey[] = ALL_POSITIONS
): WorkoutExercise[] {
  return positions.map((pos) => ({
    id: `${slug(baseName)}-${pos}`,
    name: baseName,
    position: pos,
    timeInSeconds: base.timeInSeconds ?? defaultSecondsFor(base.family, baseName),
    muscleGroups: base.muscleGroups,
    description: describe(base.family, baseName),
    intensity: base.intensity,
    reps: base.reps,
    notes: base.notes,
    tags: Array.from(new Set([base.family, ...(base.tags ?? []), pos])).filter(Boolean),
    // @ts-ignore keep reference to family if your type allows it
    family: base.family,
  }))
}

function directional(
  family: string,
  names: string[],
  muscleGroups: string[],
  opts: Partial<WorkoutExercise> = {}
) {
  return names.flatMap((n) =>
    withPositions(n, { ...opts, family, muscleGroups })
  )
}

/* -------------------------------------------------------------------------- */
/* Description map + smart fallbacks                                          */
/* -------------------------------------------------------------------------- */

const DESC: Record<string, string> = {
  // Plank family
  "Elevated Plank": "Hands under shoulders, long spine, ribs knit; maintain Blue Line (shoulder→hip). Control carriage both ways.",
  "Kneeling Plank (Wheelbarrow position)": "Knees down, hips slightly forward; press the platform away while bracing the core.",
  "Plank on Elbows (Feet)": "Forearms on carriage, feet on platform; shoulders stacked over elbows, neck long.",
  "Plank on Elbows (Knees)": "Forearms on carriage, knees down; focus on core brace and neutral pelvis.",
  "Plank to Pike": "From strong plank, lift hips up using abs (not momentum); slow return to plank with control.",
  // Wheelbarrow
  "Wheelbarrow": "Hands on platform/handles, knees on carriage; draw carriage in by closing ribs, lats engaged.",
  "Saw vs Wheelbarrow (combo)": "Alternate small shoulder saw with controlled wheelbarrow pull. Keep shoulders stable.",
  // Saw
  "Saw (elbows & knees)": "Forearms on carriage, knees down; glide shoulders over elbows in a small range, core tight.",
  "Saw (elbows & feet)": "Forearms on carriage, toes on platform; longer lever—keep Silver Angle (shoulders over hips) in the torso.",
  // Bear
  "Bear": "Hands on platform/handles, knees hover under hips; move carriage a few inches with abs, back flat.",
  "Bear vs Catfish (combo)": "Alternate bear slides with catfish pike pulls; prioritize slow tempo and range control.",
  // Catfish
  "Catfish": "Feet on platform, hands on carriage straps/handles; lift hips and pull carriage under with lower abs.",
  "Mega Catfish": "Stronger spring/longer lever version of Catfish; slow tempo, no swinging.",
  "Ice Breaker": "Hips high; press carriage away and pull back under using abs and lats together.",
  // Lunges (general)
  "Elevator Lunge": "Front foot stable, back foot moves carriage. Drop hips straight down, knee tracks (Green Line).",
  "Elevator Lunge: Carriage Kicks": "From bottom of elevator lunge, kick carriage out/in in short pulses; torso tall (Silver Angle).",
  "Escalator Lunge": "Long, slow reach back; descend under control, push through front heel.",
  "Escalator Lunge: Carriage Kicks": "Add short out/in carriage kicks while holding lunge depth; keep hips square.",
  "Xpress Lunge": "Shorter range, quicker tempo; maintain alignment, no bounce.",
  "Xpress Lunge: Carriage Kicks": "Add small carriage kicks at the bottom; brace core.",
  "5th Lunge": "Front foot on 5th; long stance; vertical shin (Green Line) and upright torso (Silver Angle).",
  "5th Lunge: Carriage Kicks": "Hold 5th lunge, small carriage kicks—keep knee stacked.",
  "Floor Lunge": "Front foot on floor, back foot on carriage; control depth and balance.",
  "Super Lunge": "Deep range, long stance; slow eccentrics, chest proud.",
  "Runner's Lunge": "Hinge forward slightly, drive through front heel; keep spine long.",
  "Spider Lunge": "Wide stance, external rotation; track knees over toes.",
  "Mini Elevator": "Short-range elevator on the mini platform; strict control.",
  "Mini Escalator": "Small, slow escalator pattern on mini; tension constant.",
  "Mini Express": "Quicker mini lunge; compact control.",
  "Filthy (Mini 5th)": "Mini 5th lunge variant; deep burn with small pulses.",
  // Twists & obliques
  "Twist": "Segmental rotation from ribs; hips steady, exhale on the twist.",
  "Kneeling Torso Twist": "Kneeling on carriage; pull strap across body—rotate from mid-back.",
  "Twister": "Handles/straps; pivot through thoracic spine; control return.",
  "French Twist": "Oblique twist with broomstick/strap; ribs down, no lumbar sway.",
  "Side Plank": "Elbow under shoulder, legs long; lift through bottom waist.",
  "Side Plank (elbow & knee)": "Bottom knee down; stack shoulders/hips; press floor away.",
  "Side Plank (elbow & feet)": "Feet stacked; long line from ear to ankle.",
  "Side Plank (hand & knee)": "Hand under shoulder, bottom knee down; active shoulder.",
  "Side Plank (hand & feet)": "Hand support with feet stacked; no sinking at shoulder.",
  "Scrambled Eggs": "Quadruped hip abduction/extension pattern; keep pelvis level.",
  "Froggy Kicks": "Prone/quadraped; heels together, knees wide; squeeze glutes.",
  "Side Torso Twists": "Side kneel; rotate torso against tension; long spine.",
  "Side Torso Crunch": "Side bend from ribs; avoid tipping forward.",
  "Twisted Plank": "Plank with rotation; hips stay level; move from ribs.",
  "Twisted Wheelbarrow": "Wheelbarrow with oblique pull; maintain scapular control.",
  "Twisted Saw (elbows & knees)": "Saw with rotational emphasis; keep elbows under shoulders.",
  "Bear with Oblique Twist": "Hover knees, twist ribs over trunk; tiny range.",
  "Twisted Catfish (Same Side)": "Catfish pike with same-side rotation; slow tempo.",
  "Twisted Catfish (Alternating)": "Alternate sides; prioritize control over height.",
  // Glutes / abductors / adductors
  "Bungee Kicks": "On all fours/standing with strap; drive heel back—glute max.",
  "Bungee Kicks — Straight Leg": "Long lever hip extension; no lumbar arch.",
  "Spider Kicks": "Lateral kick with external rotation; glute med/min.",
  "Mega Donkey Kicks": "Donkey kick against higher tension; brace core.",
  "Side Leg Press — Handle": "Lateral press using handle for support; track knee.",
  "Side Leg Press — Footstrap": "Footstrap loaded lateral press; keep hips square.",
  "Standing Outer Thighs": "Abduction against strap; tall torso.",
  "Skating": "Feet parallel, push carriage laterally; knees track.",
  "Skating (Flat vs Panels)": "Surface changes load; same knee tracking.",
  "Skating Pulse": "Short pulses at burn zone; no knee collapse.",
  "Side Kicks": "Abduction kicks; toes forward/slightly down.",
  "Heavy Squats": "More springs; sit back, chest up.",
  "Single Leg Squats": "Pistol-style; shallow range with control.",
  "Side Spider Kick": "Side kick with external rotation; control return.",
  "Standing Inner Thighs": "Adduction pull; pelvis neutral.",
  "Inner Thighs (Flat vs Panels)": "Footing changes emphasis; keep knee soft.",
  "Kneeling Inner Thighs": "Kneel on carriage; adduction pull with strap.",
  "Giant Standing Inner Thighs": "Back platform stance; long lever adduction.",
  "Giant Kneeling Inner Thighs": "Back platform kneeling adduction; slow tempo.",
  "Light Squats": "Lower spring; longer time-under-tension.",
  // Hamstrings / Quads
  "Hamstring Leg Curls": "Heel in strap; curl under with hamstrings, hips level.",
  "Giant Hamstring Leg Curls": "Back platform variant; longer lever.",
  "Reverse Giant Hamstring Leg Curls": "Facing reverse; emphasize eccentric control.",
  "Bungee Hamstring Curls": "Strap-loaded curls; keep knee in line.",
  "Leg Curls on Panels": "Feet on panels; slide in/out—hamstrings.",
  "Squats": "Feet hip-width; sit back, drive through heels.",
  "Giant Squats with Biceps Curls": "Back platform squat paired with curl; keep ribs down.",
  // Abs
  "S-Crunch": "Segmental curl; scoop ribs to hips.",
  "Mega Crunch": "Strap/handle assisted curl; slow tempo.",
  "Mega Leg Lift": "Posterior tilt; lift legs without lumbar arch.",
  "Straight-Arm Crunch": "Arms straight to increase lever; ribs knit.",
  "Knee Strap Crunch": "Strap behind knees; exhale to curl.",
  "Leg Extensions": "From tabletop; extend with core braced.",
  "Giant Super Crunch": "Back platform crunch; longer lever.",
  "Reverse Giant Super Crunch": "Facing reverse; exhale on curl.",
  "Giant Soul Train": "Long-lever dynamic crunch series; steady tempo.",
  "Reverse Giant Soul Train": "Reverse facing version; same pacing.",
  "Reverse Giant Kneeling Crunch": "Kneeling with straps; hinge from ribs.",
  "Giant Kneeling Crunch": "Back platform; tall spine, pull ribs to hips.",
  // Arms / Shoulders / Chest / Back
  "Triceps Dips": "Hands on platform/handles; elbows track back, chest lifted.",
  "Triceps Press on the Handlebars": "Press down through bars; elbows in, lats engaged.",
  "Sexy Back": "Triceps kickback focus; hinge slightly, ribs up.",
  "Kneeling Triceps Extension": "Strap overhead; keep elbows narrow.",
  "Tailbone Biceps Curl": "Seated tailbone on carriage; curl with tall posture.",
  "Lying Biceps Curls": "Supine curl; elbows stay planted.",
  "Lying Biceps Curls — Lower Abs": "Add pelvic tilt to engage lower abs.",
  "Mega Biceps Curl": "Heavier load; no shoulder swing.",
  "Kneeling Biceps Pulldown": "High anchor pulldown; elbows forward.",
  "Chest Opener": "Horizontal abduction; squeeze shoulder blades.",
  "Newspaper": "External rotation; elbows at sides, wrists neutral.",
  "Arm Circles": "Small circles from shoulders; scapula stable.",
  "Giant Shoulder Press": "Back platform press; ribs down, no lean.",
  "Kneeling Shoulder Press": "Tall kneel; press overhead without arch.",
  "Rear Delt Fly": "Hinge slightly; pull wide with rear delts.",
  "Upper Lift": "Incline-style chest press; elbows 45°.",
  "Mega Chest Fly": "Open wide with slight elbow bend; hug to center.",
  "Chest Press on the Handlebars": "Hands on bars, press away; shoulder blades wrap.",
  "Kneeling Lat Pulldown": "Tall kneel; pull elbows down and back.",
  "Seated Row": "Neutral spine; pull to ribs, control return.",
}

/** Fallback generator so nothing is blank */
function describe(family: string, name: string): string {
  if (DESC[name]) return DESC[name]

  const f = family.toLowerCase()
  const n = name.toLowerCase()

  // family-based defaults
  if (f.includes("plank")) return "Maintain Blue Line from shoulders to hips; brace core and control carriage both directions."
  if (f.includes("wheelbarrow")) return "Hands on platform/handles; draw carriage with lats and abs; neck long."
  if (f.includes("saw")) return "Forearms on carriage; glide shoulders over elbows in a small, controlled range."
  if (f.includes("bear")) return "Knees hover under hips; tiny slides driven from the core."
  if (f.includes("catfish")) return "Lift hips and pull carriage under using abs; slow tempo."

  if (f.includes("lunge")) {
    if (n.includes("carriage kicks")) return "Hold lunge depth and perform small out/in carriage kicks; knee stacked over ankle."
    if (n.includes("mini")) return "Compact lunge on mini platform; emphasize control and knee tracking."
    return "Front knee stacked (Green Line), torso tall (Silver Angle); slow descent and controlled return."
  }

  if (f.includes("glutes")) return "Glute-focused movement; keep pelvis level and avoid lumbar arch."
  if (f.includes("abduct")) return "Outer thigh/abductors; knee tracks over toes—no hip hike."
  if (f.includes("adduct")) return "Inner thigh/adductors; squeeze to midline with pelvis neutral."
  if (f.includes("hamstring")) return "Curl or hinge from hips while keeping hips level; control the eccentric."
  if (f.includes("quads")) return "Drive through heels, knees track; ribs up."

  if (f.includes("abdominals") || f.includes("abs")) return "Exhale on effort, ribs knit, pelvis slightly posteriorly tilted."
  if (f.includes("triceps")) return "Elbows stay close; avoid shoulder shrug, control return."
  if (f.includes("biceps")) return "Elbows fixed; no shoulder swing; squeeze at end range."
  if (f.includes("shoulders")) return "Scapula stable; ribs down; move from the shoulder joint."
  if (f.includes("chest")) return "Open through chest with soft elbows; avoid shoulder protraction."
  if (f.includes("back")) return "Long spine; pull from back muscles, not biceps."

  if (f.includes("stretch")) return "Gentle, controlled stretch; breathe and avoid pain."

  // generic
  return "Slow, controlled reps with consistent tension. Focus on alignment and breathing."
}

/* -------------------------------------------------------------------------- */
/* Muscle group presets                                                       */
/* -------------------------------------------------------------------------- */
const MG = {
  core: ["core", "arms"],
  obliques: ["core", "obliques"],
  lunge: ["legs", "glutes"],
  glutes: ["glutes", "legs"],
  abductors: ["glutes", "legs"],
  adductors: ["legs"],
  hamstrings: ["hamstrings", "glutes"],
  quads: ["quads", "legs"],
  arms: ["arms"],
  shoulders: ["shoulders", "arms"],
  chest: ["chest", "arms"],
  back: ["back", "arms"],
  stretch: ["mobility"],
  education: ["education"],
}

/* -------------------------------------------------------------------------- */
/* Build out the library                                                      */
/* -------------------------------------------------------------------------- */

// 1) Plank series
const PLANK = directional(
  "Plank",
  [
    "Elevated Plank",
    "Kneeling Plank (Wheelbarrow position)",
    "Plank on Elbows (Feet)",
    "Plank on Elbows (Knees)",
    "Plank to Pike",
  ],
  MG.core
)

const WHEELBARROW = directional("Wheelbarrow", ["Wheelbarrow", "Saw vs Wheelbarrow (combo)"], MG.core)
const SAW = directional("Saw", ["Saw (elbows & knees)", "Saw (elbows & feet)"], MG.core)
const BEAR = directional("Bear", ["Bear", "Bear vs Catfish (combo)"], MG.core)
const CATFISH = directional("Catfish", ["Catfish", "Mega Catfish", "Ice Breaker"], MG.core)

// 2) Lunges
const LUNGES = directional(
  "Lunges",
  [
    "Elevator Lunge",
    "Elevator Lunge: Carriage Kicks",
    "Escalator Lunge",
    "Escalator Lunge: Carriage Kicks",
    "Xpress Lunge",
    "Xpress Lunge: Carriage Kicks",
    "5th Lunge",
    "5th Lunge: Carriage Kicks",
    "Floor Lunge",
    "Super Lunge",
    "Runner's Lunge",
    "Spider Lunge",
    "Mini Elevator",
    "Mini Escalator",
    "Mini Express",
    "Filthy (Mini 5th)",
  ],
  MG.lunge
)

// 3) Twists / Side work
const TWISTS = directional(
  "Twists & Obliques",
  [
    "Twist",
    "Kneeling Torso Twist",
    "Twister",
    "French Twist",
    "Side Plank",
    "Side Plank (elbow & knee)",
    "Side Plank (elbow & feet)",
    "Side Plank (hand & knee)",
    "Side Plank (hand & feet)",
    "Scrambled Eggs",
    "Froggy Kicks",
    "Side Torso Twists",
    "Side Torso Crunch",
    "Twisted Plank",
    "Twisted Wheelbarrow",
    "Twisted Saw (elbows & knees)",
    "Bear with Oblique Twist",
    "Twisted Catfish (Same Side)",
    "Twisted Catfish (Alternating)",
  ],
  MG.obliques
)

// 4) Glutes & legs
const GLUTES = directional(
  "Glutes",
  [
    "Bungee Kicks",
    "Bungee Kicks — Straight Leg",
    "Spider Kicks",
    "Mega Donkey Kicks",
    "Froggy Kicks",
    "Side Leg Press — Handle",
    "Side Leg Press — Footstrap",
  ],
  MG.glutes
)

const ABDUCTORS = directional(
  "Abductors",
  [
    "Standing Outer Thighs",
    "Skating",
    "Skating (Flat vs Panels)",
    "Skating Pulse",
    "Side Kicks",
    "Heavy Squats",
    "Single Leg Squats",
    "Side Spider Kick",
  ],
  MG.abductors
)

const ADDUCTORS = directional(
  "Adductors",
  [
    "Standing Inner Thighs",
    "Inner Thighs (Flat vs Panels)",
    "Kneeling Inner Thighs",
    "Giant Standing Inner Thighs",
    "Giant Kneeling Inner Thighs",
    "Light Squats",
  ],
  MG.adductors
)

const HAMSTRINGS = directional(
  "Hamstrings",
  [
    "Hamstring Leg Curls",
    "Giant Hamstring Leg Curls",
    "Reverse Giant Hamstring Leg Curls",
    "Bungee Hamstring Curls",
    "Leg Curls on Panels",
  ],
  MG.hamstrings
)

const QUADS = directional("Quads", ["Squats", "Giant Squats with Biceps Curls"], MG.quads)

// 5) Abs
const ABS = directional(
  "Abdominals & Obliques",
  [
    "S-Crunch",
    "Mega Crunch",
    "Mega Leg Lift",
    "Straight-Arm Crunch",
    "Knee Strap Crunch",
    "Leg Extensions",
    "Giant Super Crunch",
    "Reverse Giant Super Crunch",
    "Giant Soul Train",
    "Reverse Giant Soul Train",
    "Reverse Giant Kneeling Crunch",
    "Giant Kneeling Crunch",
  ],
  ["core"]
)

// 6) Arms / Chest / Shoulders / Back
const TRICEPS = directional("Triceps", ["Triceps Dips", "Triceps Press on the Handlebars", "Sexy Back", "Kneeling Triceps Extension"], MG.arms)
const BICEPS = directional("Biceps", ["Tailbone Biceps Curl", "Lying Biceps Curls", "Lying Biceps Curls — Lower Abs", "Mega Biceps Curl", "Kneeling Biceps Pulldown"], MG.arms)
const SHOULDERS = directional("Shoulders", ["Chest Opener", "Newspaper", "Arm Circles", "Giant Shoulder Press", "Kneeling Shoulder Press", "Rear Delt Fly"], MG.shoulders)
const CHEST = directional("Chest", ["Upper Lift", "Mega Chest Fly", "Chest Press on the Handlebars"], MG.chest)
const BACK = directional("Back", ["Kneeling Lat Pulldown", "Seated Row"], MG.back)

// 7) Stretches (non-directional references)
const STRETCHES: WorkoutExercise[] = [
  { id: "note-about-stretching", name: "Note About Stretching", timeInSeconds: 0, muscleGroups: MG.stretch, description: "Guidelines for safe stretching on the Megaformer.", tags: ["Stretching","education"] },
  { id: "psoas-stretch", name: "Psoas Stretch", timeInSeconds: 60, muscleGroups: MG.stretch, description: "Half-kneel; tuck pelvis; shift forward to feel front-hip stretch.", tags: ["Stretching"] },
  { id: "kneeling-hamstring-stretch", name: "Kneeling Hamstring Stretch", timeInSeconds: 60, muscleGroups: MG.stretch, description: "Front leg long, hinge at hips; spine neutral.", tags: ["Stretching"] },
  { id: "scissor-stretch", name: "Scissor Stretch", timeInSeconds: 60, muscleGroups: MG.stretch, description: "Split stance; gentle pull to midline; no lumbar sway.", tags: ["Stretching"] },
  { id: "sit-and-stretch", name: "Sit and Stretch", timeInSeconds: 60, muscleGroups: MG.stretch, description: "Seated forward fold; long spine, soft knees.", tags: ["Stretching"] },
  { id: "pigeon-stretch", name: "Pigeon Stretch", timeInSeconds: 60, muscleGroups: MG.stretch, description: "External hip rotation stretch; square hips.", tags: ["Stretching"] },
  { id: "downward-dog", name: "Downward Dog Stretch", timeInSeconds: 60, muscleGroups: MG.stretch, description: "Lengthen hamstrings and calves; press through hands.", tags: ["Stretching"] },
  { id: "childs-pose", name: "Child's Pose", timeInSeconds: 60, muscleGroups: MG.stretch, description: "Hips to heels; breathe into back body.", tags: ["Stretching"] },
  { id: "v-split-stretch", name: "V Split Stretch", timeInSeconds: 60, muscleGroups: MG.stretch, description: "Gentle straddle; hinge forward with long spine.", tags: ["Stretching"] },
  { id: "single-strap-hip-ham-stretch", name: "Single Strap Hip Ham Stretch", timeInSeconds: 60, muscleGroups: MG.stretch, description: "Supine strap-assisted hamstring stretch; keep pelvis heavy.", tags: ["Stretching"] },
]

// 8) Educational (non-directional)
const EDUCATION: WorkoutExercise[] = [
  { id: "anatomy-gluteal", name: "Anatomy of the Gluteal", timeInSeconds: 0, muscleGroups: MG.education, description: "Overview of gluteal anatomy and function.", tags: ["education"] },
  { id: "anatomy-abductors", name: "Anatomy of the Abductors", timeInSeconds: 0, muscleGroups: MG.education, description: "Outer thigh musculature and coaching cues.", tags: ["education"] },
  { id: "anatomy-adductors", name: "Anatomy of the Adductors", timeInSeconds: 0, muscleGroups: MG.education, description: "Inner thigh musculature and coaching cues.", tags: ["education"] },
  { id: "anatomy-hamstrings", name: "Anatomy of the Hamstrings", timeInSeconds: 0, muscleGroups: MG.education, description: "Hamstring role, lines and safe ranges.", tags: ["education"] },
  { id: "anatomy-quadriceps", name: "Anatomy of the Quadriceps", timeInSeconds: 0, muscleGroups: MG.education, description: "Quad anatomy and knee alignment (Green Line).", tags: ["education"] },
  { id: "anatomy-gastrocnemius", name: "Anatomy of the Gastrocnemius", timeInSeconds: 0, muscleGroups: MG.education, description: "Calf complex and spring cueing considerations.", tags: ["education"] },
  { id: "anatomy-abs", name: "Anatomy of the Abs", timeInSeconds: 0, muscleGroups: MG.education, description: "Abdominal wall function; bracing vs hollowing.", tags: ["education"] },
  { id: "anatomy-triceps", name: "Anatomy of the Triceps", timeInSeconds: 0, muscleGroups: MG.education, description: "Elbow extension mechanics and cueing.", tags: ["education"] },
  { id: "anatomy-biceps", name: "Anatomy of the Biceps", timeInSeconds: 0, muscleGroups: MG.education, description: "Elbow flexion mechanics and coaching.", tags: ["education"] },
  { id: "anatomy-shoulders", name: "The Anatomy of the Shoulders", timeInSeconds: 0, muscleGroups: MG.education, description: "Shoulder complex and common faults.", tags: ["education"] },
  { id: "anatomy-chest", name: "Anatomy of the Chest", timeInSeconds: 0, muscleGroups: MG.education, description: "Pectoral function; press vs fly cueing.", tags: ["education"] },
  { id: "anatomy-back", name: "The Anatomy of the Back", timeInSeconds: 0, muscleGroups: MG.education, description: "Lats, mid-back, and scapular mechanics.", tags: ["education"] },
]

/* -------------------------------------------------------------------------- */
/* Export final library                                                       */
/* -------------------------------------------------------------------------- */

export const lagreeExercises: WorkoutExercise[] = [
  ...PLANK,
  ...WHEELBARROW,
  ...SAW,
  ...BEAR,
  ...CATFISH,

  ...LUNGES,

  ...TWISTS,

  ...GLUTES,
  ...ABDUCTORS,
  ...ADDUCTORS,
  ...HAMSTRINGS,
  ...QUADS,

  ...ABS,
  ...TRICEPS,
  ...BICEPS,
  ...SHOULDERS,
  ...CHEST,
  ...BACK,

  ...STRETCHES,
  ...EDUCATION,
]
