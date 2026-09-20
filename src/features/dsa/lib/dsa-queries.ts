/** DSA view models (computed by `backend/app/queries/dsa.py`). */

import type { DsaPatternRow, LeetcodeProblemRow } from '@/types/database.types'
import type { DsaMetrics, PatternCoverage, ProblemStatus } from './dsa-calculations'

export interface PatternWithProgress extends DsaPatternRow {
  coverage: PatternCoverage
}

export interface DsaOverview {
  patterns: PatternWithProgress[]
  metrics: DsaMetrics
  totalProblems: number
  solvedThisWeek: number
  weeklyTarget: number
}

export interface ProblemWithStatus extends LeetcodeProblemRow {
  status: ProblemStatus
  attemptCount: number
  bestTimeMinutes: number | null
}

export interface PatternDetail {
  pattern: DsaPatternRow
  problems: ProblemWithStatus[]
  coverage: PatternCoverage
}
