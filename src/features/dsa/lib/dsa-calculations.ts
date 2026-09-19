/**
 * DSA metrics: derived problem status, pattern coverage, and aggregates.
 * Pure functions — aggregation happens server-side, charts receive results.
 */

import { percent } from '@/lib/utils'
import type { LeetcodeAttemptRow, MistakeCategory, ProblemDifficulty } from '@/types/database.types'

export const PROBLEM_STATUSES = [
  'not-attempted',
  'attempted',
  'solved-assisted',
  'solved-hint',
  'solved-independent',
  'mastered',
] as const
export type ProblemStatus = (typeof PROBLEM_STATUSES)[number]

export type Attempt = Pick<
  LeetcodeAttemptRow,
  | 'problem_id'
  | 'solved'
  | 'solved_independently'
  | 'hint_used'
  | 'editorial_used'
  | 'confidence'
  | 'time_minutes'
  | 'mistake_category'
  | 'created_at'
>

/** How good an attempt is, for picking the best one. Higher wins. */
function attemptRank(a: Attempt): number {
  if (!a.solved) return 0
  if (a.editorial_used) return 1
  if (a.hint_used) return 2
  if (a.solved_independently && (a.confidence ?? 0) >= 4) return 4
  if (a.solved_independently) return 3
  return 1
}

/**
 * Status from the user's whole attempt history for one problem.
 *
 * The BEST attempt wins: needing a hint the first time should not
 * permanently mark a problem you later solved cleanly.
 */
export function deriveProblemStatus(attempts: Attempt[]): ProblemStatus {
  if (attempts.length === 0) return 'not-attempted'

  const best = attempts.reduce((bestSoFar, current) =>
    attemptRank(current) > attemptRank(bestSoFar) ? current : bestSoFar
  )

  if (!best.solved) return 'attempted'
  if (best.solved_independently && (best.confidence ?? 0) >= 4) return 'mastered'
  if (best.editorial_used) return 'solved-assisted'
  if (best.hint_used) return 'solved-hint'
  if (best.solved_independently) return 'solved-independent'
  return 'attempted'
}

export function isSolvedStatus(status: ProblemStatus): boolean {
  return status !== 'not-attempted' && status !== 'attempted'
}

export interface ProblemLike {
  id: string
  pattern_id: string
  difficulty: ProblemDifficulty
}

export interface PatternCoverage {
  patternId: string
  total: number
  solved: number
  mastered: number
  coveragePercent: number
}

/** Per-pattern coverage. Every pattern appears, including untouched ones. */
export function calculatePatternCoverage(
  problems: ProblemLike[],
  attempts: Attempt[],
  patternIds: string[]
): PatternCoverage[] {
  const statusByProblem = groupStatuses(problems, attempts)

  return patternIds.map((patternId) => {
    const inPattern = problems.filter((p) => p.pattern_id === patternId)
    let solved = 0
    let mastered = 0
    for (const problem of inPattern) {
      const status = statusByProblem.get(problem.id) ?? 'not-attempted'
      if (isSolvedStatus(status)) solved += 1
      if (status === 'mastered') mastered += 1
    }
    return {
      patternId,
      total: inPattern.length,
      solved,
      mastered,
      coveragePercent: percent(solved, inPattern.length),
    }
  })
}

/** Patterns with at least `minSolved` problems solved — the DSA readiness input. */
export function countPatternsCovered(coverage: PatternCoverage[], minSolved = 2): number {
  return coverage.filter((c) => c.solved >= minSolved).length
}

export interface DsaMetrics {
  totalSolved: number
  totalMastered: number
  totalAttempted: number
  independentRate: number
  avgTimeByDifficulty: Record<ProblemDifficulty, number | null>
  solvedByDifficulty: Record<ProblemDifficulty, number>
  mistakeFrequency: Array<{ category: MistakeCategory; count: number }>
}

export function calculateDsaMetrics(
  problems: ProblemLike[],
  attempts: Attempt[]
): DsaMetrics {
  const statusByProblem = groupStatuses(problems, attempts)
  const difficultyById = new Map(problems.map((p) => [p.id, p.difficulty]))

  let totalSolved = 0
  let totalMastered = 0
  let independentOrBetter = 0
  const solvedByDifficulty: Record<ProblemDifficulty, number> = { easy: 0, medium: 0, hard: 0 }

  for (const [problemId, status] of statusByProblem) {
    if (!isSolvedStatus(status)) continue
    totalSolved += 1
    if (status === 'mastered') totalMastered += 1
    if (status === 'mastered' || status === 'solved-independent') independentOrBetter += 1
    const difficulty = difficultyById.get(problemId)
    if (difficulty) solvedByDifficulty[difficulty] += 1
  }

  const timeSums: Record<ProblemDifficulty, { total: number; count: number }> = {
    easy: { total: 0, count: 0 },
    medium: { total: 0, count: 0 },
    hard: { total: 0, count: 0 },
  }
  const mistakes = new Map<MistakeCategory, number>()

  for (const attempt of attempts) {
    const difficulty = difficultyById.get(attempt.problem_id)
    if (difficulty && attempt.time_minutes && attempt.time_minutes > 0) {
      timeSums[difficulty].total += attempt.time_minutes
      timeSums[difficulty].count += 1
    }
    if (attempt.mistake_category && attempt.mistake_category !== 'none') {
      mistakes.set(attempt.mistake_category, (mistakes.get(attempt.mistake_category) ?? 0) + 1)
    }
  }

  const avgTimeByDifficulty = {
    easy: timeSums.easy.count ? Math.round(timeSums.easy.total / timeSums.easy.count) : null,
    medium: timeSums.medium.count
      ? Math.round(timeSums.medium.total / timeSums.medium.count)
      : null,
    hard: timeSums.hard.count ? Math.round(timeSums.hard.total / timeSums.hard.count) : null,
  }

  return {
    totalSolved,
    totalMastered,
    totalAttempted: statusByProblem.size,
    independentRate: percent(independentOrBetter, totalSolved),
    avgTimeByDifficulty,
    solvedByDifficulty,
    mistakeFrequency: [...mistakes.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
  }
}

/** Weekly target progress against `weekly-plan-defaults.json`. */
export function getWeeklyProgress(
  solvedThisWeek: number,
  target: number
): { solved: number; target: number; percent: number; onTrack: boolean } {
  return {
    solved: solvedThisWeek,
    target,
    percent: percent(solvedThisWeek, target),
    onTrack: solvedThisWeek >= target,
  }
}

function groupStatuses(
  problems: ProblemLike[],
  attempts: Attempt[]
): Map<string, ProblemStatus> {
  const byProblem = new Map<string, Attempt[]>()
  for (const attempt of attempts) {
    const list = byProblem.get(attempt.problem_id)
    if (list) list.push(attempt)
    else byProblem.set(attempt.problem_id, [attempt])
  }

  const known = new Set(problems.map((p) => p.id))
  const result = new Map<string, ProblemStatus>()
  for (const [problemId, problemAttempts] of byProblem) {
    if (!known.has(problemId)) continue
    result.set(problemId, deriveProblemStatus(problemAttempts))
  }
  return result
}
