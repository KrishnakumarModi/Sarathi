/** App-wide constants. No magic numbers in feature code. */

export const APP_NAME = 'AI Career OS'

// ---------------------------------------------------------------- mastery
export const MAX_MASTERY_SCORE = 100
export const MIN_MASTERY_SCORE = 0
export const MAX_MASTERY_LEVEL = 6

// ---------------------------------------------------------------- planner
/** Hard ceiling on a single day's scheduled work, regardless of availability. */
export const MAX_DAILY_MINUTES = 480
/** A task harder than this is dropped on a low-energy day. */
export const LOW_ENERGY_DIFFICULTY_CUTOFF = 5
/** energy_level at or below this counts as a low-energy day. */
export const LOW_ENERGY_THRESHOLD = 2
/** Backlog items older than this are surfaced as aging, never silently dropped. */
export const BACKLOG_AGING_DAYS = 7
/** Ceiling on how many times one task may be rescheduled before it expires. */
export const MAX_RESCHEDULE_COUNT = 3

// ---------------------------------------------------------------- revision
/** V1 fixed intervals (06_PRODUCT_ALIGNMENT_PLAN.md Phase 3). */
export const REVISION_INTERVALS = [3, 7, 15] as const
export const REVISION_FAILURE_INTERVAL_DAYS = 1
export const REVISION_CONFIDENCE_PASS_THRESHOLD = 3
/** Retention health is only shown once there are this many observations. */
export const MIN_RETENTION_OBSERVATIONS = 5

// ---------------------------------------------------------------- readiness
/** A critical skill below this mastery caps role proximity. */
export const CRITICAL_SKILL_THRESHOLD = 40
export const CRITICAL_SKILL_CAP = 50
export const PROJECT_EVIDENCE_TARGET = 3

// ---------------------------------------------------------------- jd match
export const JD_STRONG_MASTERY = 60
export const JD_WEAK_MASTERY = 20
export const JD_APPLY_NOW_THRESHOLD = 70
export const JD_IMPROVE_THRESHOLD = 50
export const JD_TOP_MISSING_SKILLS = 5

// ---------------------------------------------------------------- aptitude
export const APTITUDE_WEAK_ACCURACY = 60
export const APTITUDE_MIN_QUESTIONS_FOR_WEAKNESS = 5
export const APTITUDE_MIN_SESSIONS_FOR_TREND = 3
export const APTITUDE_TREND_DELTA = 0.05

// ---------------------------------------------------------------- ui
export const PAGE_SIZE = 25
export const SEARCH_DEBOUNCE_MS = 300
export const TOAST_SUCCESS_MS = 3000
export const TOAST_ERROR_MS = 5000
export const MAX_REALTIME_CHANNELS_PER_PAGE = 3
export const MAX_DASHBOARD_ROLES = 5
export const TOP_WEAKNESSES = 5
