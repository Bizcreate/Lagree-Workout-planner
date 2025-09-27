// lib/schemas.ts
import { z } from "zod"

/** Shared enums */
export const positionKeySchema = z.enum(["standard", "reverse", "giant", "giantReverse"])
export const levelSchema = z.enum(["beginner", "intermediate", "advanced", "all"])
export const metricSchema = z.enum(["time", "reps"])

/** Exercise schema */
export const exerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  description: z.string(),
  series: z.string(),
  muscleGroups: z.array(z.string()).nonempty(),
  equipment: z.array(z.string()).nonempty(),
  level: levelSchema.default("beginner"),
  unilateral: z.boolean().default(false),
  supportedPositions: z.array(positionKeySchema).min(1),
  defaultMetric: metricSchema,
  defaultTimeSec: z.number().int().positive().optional(),
  defaultReps: z.number().int().positive().optional(),
  aliases: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
})

/** Collections */
export const exerciseArraySchema = z.array(exerciseSchema)

/** Types inferred from schemas (use these across the app) */
export type PositionKey = z.infer<typeof positionKeySchema>
export type ExerciseZ = z.infer<typeof exerciseSchema>
