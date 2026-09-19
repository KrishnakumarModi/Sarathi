/**
 * Analytics — client-side contract.
 *
 * Aggregation and the composite score are computed in
 * `backend/app/services/analytics_calculations.py`. The weights stay here
 * too because the readiness gauge labels each row with the maximum it can
 * contribute, and that label has to match what the backend actually applied.
 */

export const CAREER_READINESS_WEIGHTS = {
  technical_skills: 0.3,
  projects: 0.2,
  dsa: 0.15,
  cs_fundamentals: 0.1,
  interview: 0.1,
  applications: 0.1,
  aptitude: 0.05,
} as const

export type CareerReadinessComponent = keyof typeof CAREER_READINESS_WEIGHTS

export interface CareerReadinessResult {
  score: number
  components: Record<CareerReadinessComponent, number>
  contributions: Record<CareerReadinessComponent, number>
}

export interface SkillWithMastery {
  skill_id: string
  mastery_score: number
  /** Highest role_skills weight across the user's enabled roles. */
  maxRoleWeight: number
  isPrimaryRoleSkill: boolean
}

export interface Weakness extends SkillWithMastery {
  score: number
  reason: string
}

export interface DailyHours {
  date: string
  hours: number
}

export interface CategoryHours {
  category: string
  hours: number
}
