/** Revision API. */

import { api, toActionResult } from '@/lib/api-client'
import { refreshData } from '@/lib/query-client'
import type { ActionResult } from '@/types/global'
import type { RevisionView } from './lib/revision-queries'

export interface ReviewResult {
  nextReviewDate: string
  intervalDays: number
  passed: boolean
}

export function fetchRevisionView(signal?: AbortSignal): Promise<RevisionView> {
  return api.get<RevisionView>('/revision', signal)
}

export async function recordReview(input: {
  unit_id: string
  confidence: number
}): Promise<ActionResult<ReviewResult>> {
  const result = await toActionResult(() => api.post<ReviewResult>('/revision/reviews', input))
  if ('success' in result) refreshData()
  return result
}

export interface QuizQuestion {
  id: string
  question_type: string
  difficulty: number
  content: string
  options: Record<string, string> | null
}

export interface Quiz {
  id: string
  revision_item_id: string
  questions: QuizQuestion[]
}

export interface AnswerSubmission {
  question_id: string
  user_response: string
}

export interface QuizEvaluation {
  total_score: number
  calculated_confidence: number
  evaluations: Array<{
    question_id: string
    is_correct: boolean
    score_awarded: number
    ai_explanation: string | null
  }>
  next_review_date: string
}

export async function createAIQuiz(itemId: string): Promise<ActionResult<Quiz>> {
  return toActionResult(() => api.post<Quiz>(`/revision/${itemId}/ai-quiz`))
}

export async function submitAIQuiz(
  quizId: string,
  answers: AnswerSubmission[]
): Promise<ActionResult<QuizEvaluation>> {
  const result = await toActionResult(() =>
    api.post<QuizEvaluation>(`/revision/quiz/${quizId}/submit`, { answers })
  )
  if ('success' in result) refreshData()
  return result
}
