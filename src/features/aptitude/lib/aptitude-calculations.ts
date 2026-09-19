/**
 * Aptitude — client-side contract.
 *
 * Accuracy, speed, trend, and weakness detection are computed in
 * `backend/app/services/aptitude_calculations.py`, where the "return null
 * rather than a misleading zero" rule is enforced. These are the shapes the
 * tracker renders.
 */

export type Trend = 'improving' | 'declining' | 'stable'

export interface AptitudeAttempt {
  topic_id: string
  session_date: string
  questions_attempted: number
  questions_correct: number
  time_seconds: number
  is_timed: boolean
}

export interface WeakTopic {
  topicId: string
  accuracy: number
  questionsTotal: number
}

export interface CategorySummary {
  totalQuestionsPracticed: number
  overallAccuracy: number | null
  topicsPracticed: number
  weakTopics: number
}
