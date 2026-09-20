/** App-wide types shared across features. */

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { error: string; fieldErrors?: Record<string, string[]> }

export function isActionError<T>(
  result: ActionResult<T>
): result is { error: string; fieldErrors?: Record<string, string[]> } {
  return 'error' in result
}

/** The six completion dimensions of an atomic unit. */
export const COMPLETION_DIMENSIONS = [
  'theory',
  'practice',
  'implementation',
  'quiz',
  'interview',
  'project',
] as const
export type CompletionDimension = (typeof COMPLETION_DIMENSIONS)[number]

/** Mastery levels 0-6, as defined in 05_DESIGN_SYSTEM.md. */
export const MASTERY_LABELS = [
  'Not Started',
  'Exposed',
  'Familiar',
  'Practiced',
  'Implemented',
  'Interview Ready',
  'Production Proven',
] as const
export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** Difficulty levels 0-7. */
export const DIFFICULTY_LABELS = [
  'Prereq',
  'Beginner',
  'Easy',
  'Intermediate',
  'Hard',
  'Advanced',
  'Production',
  'Interview',
] as const

/**
 * Role proximity labels. Deliberately gradual and non-committal: the product
 * must never imply employment or guarantee readiness
 * (06_PRODUCT_ALIGNMENT_PLAN.md Phase 4).
 */
export type ProximityLabel = 'EXPLORING' | 'BUILDING' | 'APPROACHING' | 'STRONG ALIGNMENT'
