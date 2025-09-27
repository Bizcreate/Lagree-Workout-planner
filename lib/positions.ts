/**
 * Canonical Megaformer positioning map.
 * We assume industry-standard mapping:
 *  L1 Standard:  front platform, face front
 *  L2 Reverse:   front platform, face back
 *  L3 Giant Rev: back  platform, face back
 *  L4 Giant:     back  platform, face front
 * If your studio uses a different convention, edit the strings below.
 */
export type Positioning = "standard" | "reverse" | "giantReverse" | "giant"

export const POSITIONS: Record<
  Positioning,
  {
    level: 1 | 2 | 3 | 4
    key: Positioning
    label: string
    platform: "front" | "back"
    facing: "front" | "back"
    short: string
  }
> = {
  standard: {
    level: 1,
    key: "standard",
    label: "Level 1 • Standard (front ▶ front)",
    platform: "front",
    facing: "front",
    short: "L1 • Standard",
  },
  reverse: {
    level: 2,
    key: "reverse",
    label: "Level 2 • Reverse (front ▶ back)",
    platform: "front",
    facing: "back",
    short: "L2 • Reverse",
  },
  giantReverse: {
    level: 3,
    key: "giantReverse",
    label: "Level 3 • Giant Reverse (back ▶ back)",
    platform: "back",
    facing: "back",
    short: "L3 • Giant Rev",
  },
  giant: {
    level: 4,
    key: "giant",
    label: "Level 4 • Giant (back ▶ front)",
    platform: "back",
    facing: "front",
    short: "L4 • Giant",
  },
}

/** Human-friendly label from optional pos; defaults to L1. */
export function positionBadge(pos?: Positioning) {
  return POSITIONS[pos ?? "standard"].label
}

/** Short label (for chips). */
export function positionShort(pos?: Positioning) {
  return POSITIONS[pos ?? "standard"].short
}

