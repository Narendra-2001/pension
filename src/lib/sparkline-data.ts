/** Curated sparkline shapes matching the admin dashboard aesthetic (min/max normalized in chart). */
export const SPARKLINE_PATTERNS = {
  trendUp: [12, 18, 15, 22, 19, 28, 24, 32],
  trendUpAlt: [18, 22, 20, 26, 24, 30, 28, 34],
  wave: [14, 16, 18, 15, 17, 19, 16, 18],
  moderate: [10, 12, 11, 14, 13, 15, 12, 14],
  subtle: [8, 10, 9, 12, 11, 13, 10, 12],
  decline: [22, 20, 21, 19, 18, 17, 16, 15],
} as const

export type SparklinePattern = keyof typeof SPARKLINE_PATTERNS

export function sparklinePattern(pattern: SparklinePattern): number[] {
  return [...SPARKLINE_PATTERNS[pattern]]
}

/** Pick a pattern by index so cards in a row get varied but consistent shapes. */
export function sparklinePatternAt(index: number): number[] {
  const keys = Object.keys(SPARKLINE_PATTERNS) as SparklinePattern[]
  return sparklinePattern(keys[index % keys.length])
}
