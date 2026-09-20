/**
 * Row types.
 *
 * These mirror the API's serialised rows one-for-one, which in turn mirror
 * `backend/app/db/models.py`. The field names and the ISO-8601 date and
 * timestamp formats are the contract between the two services: change a
 * column there and this file has to follow, or the UI silently reads
 * `undefined`.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ---------------------------------------------------------------- enums

export type LearningType = 'concept' | 'exercise' | 'project' | 'quiz' | 'interview-question'
export type RoleTier = 'A' | 'B' | 'C'
export type ProblemDifficulty = 'easy' | 'medium' | 'hard'
export type Importance = 'critical' | 'high' | 'medium' | 'low'
export type TaskCategory = 'ai-ml' | 'dsa' | 'cs' | 'aptitude' | 'project' | 'career' | 'review'
export type TaskSource = 'curriculum' | 'revision' | 'backlog' | 'project' | 'career' | 'manual'
export type TaskStatus = 'planned' | 'in_progress' | 'completed' | 'skipped' | 'rescheduled' | 'expired'
export type RescheduleDecision = 'rescheduled' | 'expired' | 'dropped_by_user'
export type EvidenceSource = 'completion' | 'assessment' | 'applied_work' | 'project' | 'interview' | 'revision'
export type ProjectStatus = 'idea' | 'planning' | 'in-progress' | 'testing' | 'deployed' | 'archived'
export type MistakeCategory = 'logic' | 'edge-case' | 'timeout' | 'wrong-pattern' | 'syntax' | 'none'
export type OnboardingStatus = 'pending' | 'baseline' | 'complete'
export type GoalMode = 'open' | 'targeted'
export type BaselineMode = 'assessment' | 'fundamentals'
export type Theme = 'light' | 'dark' | 'system'
export type StudyIntensity = 'light' | 'moderate' | 'intense'

export const APPLICATION_STATUSES = [
  'discovered', 'saved', 'shortlisted', 'applied', 'assessment', 'interview',
  'technical-round', 'hr-round', 'offer', 'rejected', 'ghosted', 'withdrawn',
] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

// ---------------------------------------------------------------- rows

export type Resource = {
  title: string
  url: string
  type: 'article' | 'video' | 'docs' | 'practice'
}

export type DomainRow = {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  sort_order: number
  created_at: string
}

export type ModuleRow = {
  id: string
  domain_id: string
  name: string
  description: string | null
  sort_order: number
  created_at: string
}

export type TopicRow = {
  id: string
  module_id: string
  name: string
  description: string | null
  sort_order: number
  created_at: string
}

export type SubtopicRow = {
  id: string
  topic_id: string
  name: string
  description: string | null
  sort_order: number
  created_at: string
}

export type AtomicUnitRow = {
  id: string
  subtopic_id: string
  name: string
  description: string | null
  difficulty: number
  estimated_minutes: number
  learning_type: LearningType
  resources: Resource[]
  sort_order: number
  created_at: string
}

export type SkillRow = {
  id: string
  name: string
  category: string
  description: string | null
  sort_order: number
  created_at: string
}

export type RoleRow = {
  id: string
  name: string
  description: string | null
  tier: RoleTier
  category: string
  core_skills: string[]
  sort_order: number
  created_at: string
}

export type RoleSkillRow = {
  role_id: string
  skill_id: string
  weight: number
  is_critical: boolean
  created_at: string
}

export type UnitSkillRow = {
  unit_id: string
  skill_id: string
  created_at: string
}

export type PrerequisiteRow = {
  unit_id: string
  prerequisite_id: string
  created_at: string
}

export type DsaPatternRow = {
  id: string
  name: string
  description: string | null
  category: string
  concept_explanation: string | null
  template_code: string | null
  recognition_cues: string | null
  sort_order: number
  created_at: string
}

export type LeetcodeProblemRow = {
  id: string
  title: string
  leetcode_number: number | null
  url: string | null
  difficulty: ProblemDifficulty
  pattern_id: string
  secondary_patterns: string[]
  topic: string
  estimated_minutes: number
  prerequisite_concepts: string[]
  week_recommended: number | null
  sort_order: number
  created_at: string
}

export type CsDomainRow = {
  id: string
  name: string
  description: string | null
  sort_order: number
  created_at: string
}

export type CsTopicRow = {
  id: string
  domain_id: string
  name: string
  description: string | null
  difficulty: number
  importance: Importance
  sort_order: number
  created_at: string
}

export type CsQuestionRow = {
  id: string
  topic_id: string
  question: string
  answer_summary: string | null
  difficulty: number
  question_type: string
  sort_order: number
  created_at: string
}

export type AptitudeCategoryRow = {
  id: string
  name: string
  description: string | null
  sort_order: number
  created_at: string
}

export type AptitudeTopicRow = {
  id: string
  category_id: string
  name: string
  description: string | null
  difficulty: number
  sort_order: number
  created_at: string
}

export type InterviewQuestionRow = {
  id: string
  category: string
  subcategory: string | null
  question: string
  expected_answer: string | null
  difficulty: number
  role_relevance: string[]
  sort_order: number
  created_at: string
}

export type ProjectTemplateRow = {
  id: string
  title: string
  description: string | null
  tech_stack: string[]
  features: Json
  default_tasks: Json
  resume_bullets: string[]
  interview_questions: Json
  failure_modes: string | null
  created_at: string
}

export type AchievementRow = {
  id: string
  name: string
  description: string | null
  icon: string | null
  category: string
  condition_type: string
  condition_value: number
  created_at: string
}

export type ProfileRow = {
  id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  timezone: string
  start_date: string
  onboarding_status: OnboardingStatus
  onboarding_completed_at: string | null
  goal_mode: GoalMode
  target_timeline_weeks: number | null
  baseline_mode: BaselineMode | null
  created_at: string
  updated_at: string
}

export type UserSettingsRow = {
  id: string
  user_id: string
  weekly_hours: Record<string, number>
  weekly_capacity_minutes: number
  max_daily_minutes: number
  planning_days_per_week: number
  theme: Theme
  study_intensity: StudyIntensity
  dsa_weekly_target: number
  application_daily_target: number
  preferred_study_start: string | null
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

export type BaselineResponseRow = {
  id: string
  user_id: string
  area: string
  question_id: string
  response: string
  is_correct: boolean | null
  self_rating: number | null
  created_at: string
}

export type UserRoleRow = {
  id: string
  user_id: string
  role_id: string
  is_primary: boolean
  is_enabled: boolean
  created_at: string
}

export type TaskCompletionRow = {
  id: string
  user_id: string
  unit_id: string
  theory_complete: boolean
  practice_complete: boolean
  implementation_complete: boolean
  quiz_complete: boolean
  interview_complete: boolean
  project_complete: boolean
  confidence: number | null
  notes: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type SkillMasteryRow = {
  id: string
  user_id: string
  skill_id: string
  mastery_score: number
  mastery_level: number
  updated_at: string
}

export type CompetencyEvidenceRow = {
  id: string
  user_id: string
  skill_id: string
  source_type: EvidenceSource
  source_id: string
  score: number
  weight: number
  observed_at: string
  metadata: Json
  created_at: string
}

export type DailyPlanRow = {
  id: string
  user_id: string
  plan_date: string
  available_minutes: number
  energy_level: number | null
  focus_level: number | null
  created_at: string
  updated_at: string
}

export type DailyTaskRow = {
  id: string
  plan_id: string
  user_id: string
  unit_id: string | null
  title: string
  category: TaskCategory
  source: TaskSource
  reference_id: string | null
  estimated_minutes: number
  priority: number
  priority_score: number
  difficulty: number | null
  status: TaskStatus
  non_completion_reason: string | null
  origin_date: string
  reschedule_count: number
  is_completed: boolean
  completed_at: string | null
  sort_order: number
  notes: string | null
  created_at: string
  updated_at: string
}

export type TaskRescheduleRow = {
  id: string
  user_id: string
  task_id: string
  from_date: string
  to_date: string | null
  decision: RescheduleDecision
  reason: string
  created_at: string
}

export type StudySessionRow = {
  id: string
  user_id: string
  start_time: string
  end_time: string | null
  duration_minutes: number | null
  category: string
  task_id: string | null
  focus_rating: number | null
  notes: string | null
  created_at: string
}

export type RevisionItemRow = {
  id: string
  user_id: string
  unit_id: string
  next_review_date: string
  interval_days: number
  repetition_count: number
  ease_factor: number
  last_confidence: number | null
  created_at: string
  updated_at: string
}

export type RevisionReviewRow = {
  id: string
  user_id: string
  unit_id: string
  reviewed_on: string
  confidence: number
  was_due: boolean
  interval_applied: number
  created_at: string
}

export type LeetcodeAttemptRow = {
  id: string
  user_id: string
  problem_id: string
  attempt_number: number
  solved: boolean
  solved_independently: boolean
  hint_used: boolean
  editorial_used: boolean
  time_minutes: number | null
  confidence: number | null
  approach: string | null
  mistake_category: MistakeCategory | null
  notes: string | null
  needs_revision: boolean
  revision_date: string | null
  created_at: string
}

export type CsMasteryRow = {
  id: string
  user_id: string
  topic_id: string
  concept_understood: boolean
  questions_practiced: boolean
  quiz_passed: boolean
  interview_ready: boolean
  confidence: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type AptitudeAttemptRow = {
  id: string
  user_id: string
  topic_id: string
  session_date: string
  questions_attempted: number
  questions_correct: number
  time_seconds: number
  is_timed: boolean
  notes: string | null
  created_at: string
}

export type ProjectRow = {
  id: string
  user_id: string
  title: string
  description: string | null
  status: ProjectStatus
  tech_stack: string[]
  github_url: string | null
  live_url: string | null
  architecture_notes: string | null
  features: Json
  resume_bullets: string[]
  interview_questions: Json
  failure_modes: string | null
  scaling_notes: string | null
  metrics: Json
  template_id: string | null
  created_at: string
  updated_at: string
}

export type ProjectTaskRow = {
  id: string
  user_id: string
  project_id: string
  title: string
  is_completed: boolean
  sort_order: number
  created_at: string
}

export type JobApplicationRow = {
  id: string
  user_id: string
  company: string
  role_title: string
  location: string | null
  is_remote: boolean
  salary_range: string | null
  job_url: string | null
  source: string | null
  status: ApplicationStatus
  date_found: string
  date_applied: string | null
  resume_version: string | null
  referral_contact: string | null
  recruiter_contact: string | null
  required_skills: string[]
  matched_skills: string[]
  missing_skills: string[]
  match_percentage: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type InterviewSessionRow = {
  id: string
  user_id: string
  session_type: string
  session_date: string
  total_questions: number
  correct_answers: number
  duration_minutes: number | null
  project_id: string | null
  notes: string | null
  created_at: string
}

export type WeeklyReviewRow = {
  id: string
  user_id: string
  week_number: number
  year: number
  planned_hours: number
  completed_hours: number
  completion_rate: number
  strongest_skills: string[]
  weakest_skills: string[]
  role_readiness: Record<string, number>
  dsa_solved: number
  dsa_independent: number
  applications_sent: number
  callbacks: number
  next_week_priorities: string[]
  capacity_change_minutes: number | null
  blockers: string | null
  user_notes: string | null
  created_at: string
}

export type UserAchievementRow = {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
}

export type ActivityLogRow = {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Json | null
  created_at: string
}
