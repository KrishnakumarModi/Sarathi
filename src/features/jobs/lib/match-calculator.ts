/**
 * JD match — client-side contract.
 *
 * The dictionary, the parser, and the scoring all run server-side
 * (`backend/app/services/{skill_dictionary,jd_parser,match_calculator}.py`),
 * which is what keeps the analyser free of any external call. These are the
 * shapes the analyser dialog and the funnel chart render.
 */

export type MatchRecommendation = 'Apply Now' | 'Apply After Improving' | 'Low ROI'

export interface SkillMatch {
  skillId: string
  mastery: number
  tier: 'strong' | 'weak' | 'missing'
}

export interface MatchResult {
  matchPercent: number
  recommendation: MatchRecommendation
  foundSkills: SkillMatch[]
  strongSkills: string[]
  weakSkills: string[]
  missingSkills: string[]
  /** Weakest-first study list, capped at JD_TOP_MISSING_SKILLS. */
  studyPriorities: string[]
  yearsRequired: number | null
  fresherFriendly: boolean
  /** True when no known skill was recognised — the UI explains rather than showing 0%. */
  noSkillsDetected: boolean
}

export interface FunnelStats {
  total: number
  applied: number
  callbacks: number
  offers: number
  /** callbacks / applied. 'discovered' and 'saved' are NOT in the denominator. */
  callbackRate: number
  byStatus: Record<string, number>
}
