/** Aptitude view models (computed by `backend/app/queries/aptitude.py`). */

import type { AptitudeCategoryRow, AptitudeTopicRow } from '@/types/database.types'
import type { AptitudeAttempt, CategorySummary, Trend, WeakTopic } from './aptitude-calculations'

export interface TopicWithStats extends AptitudeTopicRow {
  accuracy: number | null
  speed: number | null
  trend: Trend | null
  sessionCount: number
  questionsPracticed: number
  lastPracticed: string | null
  recentSessions: AptitudeAttempt[]
}

export interface AptitudeView {
  categories: AptitudeCategoryRow[]
  topicsByCategory: Record<string, TopicWithStats[]>
  summaryByCategory: Record<string, CategorySummary>
  weakTopics: WeakTopic[]
  weeklyQuestions: number
  topicNames: Record<string, string>
}
