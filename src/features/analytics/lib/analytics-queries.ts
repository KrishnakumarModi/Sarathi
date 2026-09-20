/** Analytics view models (computed by `backend/app/queries/analytics.py`). */

import type { PatternCoverage } from '@/features/dsa/lib/dsa-calculations'
import type { FunnelStats } from '@/features/jobs/lib/match-calculator'
import type { RoleWithReadiness } from '@/features/roles/lib/role-queries'
import type { CareerReadinessResult, DailyHours } from './analytics-calculations'

export interface SkillRadarPoint {
  category: string
  mastery: number
}

export interface CurriculumSplit {
  notStarted: number
  inProgress: number
  complete: number
}

export interface AnalyticsView {
  velocity: DailyHours[]
  skillRadar: SkillRadarPoint[]
  roleReadiness: RoleWithReadiness[]
  patternCoverage: PatternCoverage[]
  patternNames: Record<string, string>
  funnel: FunnelStats
  curriculum: CurriculumSplit
  careerReadiness: CareerReadinessResult
  hasAnyData: boolean
}
