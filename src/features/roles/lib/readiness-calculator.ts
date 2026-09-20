/**
 * Role proximity — client-side contract.
 *
 * The score is computed in `backend/app/services/readiness_calculator.py`
 * and arrives fully explained: the breakdown, each component's
 * contribution, the ranked gaps, and the single highest-impact next action.
 * The copy below stays here because it is presentation, and because the
 * wording is a product constraint — the labels are deliberately gradual and
 * must never imply employment (06_PRODUCT_ALIGNMENT_PLAN.md Phase 4).
 */

import type { ProximityLabel } from '@/types/global'

export interface RoleSkillRequirement {
  skill_id: string
  weight: number
  is_critical: boolean
}

export interface SkillGap {
  skill_id: string
  mastery: number
  weight: number
  is_critical: boolean
  /** How many readiness points closing this gap would add. */
  potentialGain: number
}

export interface ReadinessBreakdown {
  technical: number
  dsa: number
  cs: number
  projects: number
  interview: number
}

export interface ReadinessResult {
  roleId: string
  score: number
  label: ProximityLabel
  breakdown: ReadinessBreakdown
  /** Contribution of each component to the final score. */
  contributions: ReadinessBreakdown
  gaps: SkillGap[]
  criticalGaps: SkillGap[]
  /** Capped because a critical skill is below threshold. */
  isCapped: boolean
  nextAction: string | null
}

export interface RoleOverlap {
  skill_id: string
  roles: string[]
  /** Highest weight this skill carries across the compared roles. */
  maxWeight: number
}

export const PROXIMITY_DESCRIPTIONS: Record<ProximityLabel, string> = {
  EXPLORING: 'Early in this direction. Foundations are still forming.',
  BUILDING: 'Core skills are taking shape. Keep compounding the basics.',
  APPROACHING: 'Most of the profile is in place. Close the remaining gaps.',
  'STRONG ALIGNMENT': 'Your evidence lines up well with this role profile.',
}
