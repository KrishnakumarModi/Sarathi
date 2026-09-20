/** Interview practice API. */

import { api, toActionResult } from '@/lib/api-client'
import { refreshData } from '@/lib/query-client'
import type { InterviewQuestionRow, ProjectRow } from '@/types/database.types'
import type { ActionResult } from '@/types/global'
import type { RecordSessionInput } from './validators'

export interface InterviewsView {
  questionsByCategory: Record<string, InterviewQuestionRow[]>
  projects: ProjectRow[]
  sessions: Array<{
    session_type: string
    session_date: string
    total_questions: number
    correct_answers: number
  }>
}

export function fetchInterviewsView(signal?: AbortSignal): Promise<InterviewsView> {
  return api.get<InterviewsView>('/interviews', signal)
}

export async function recordInterviewSession(
  input: RecordSessionInput
): Promise<ActionResult<{ score: number }>> {
  const result = await toActionResult(() =>
    api.post<{ score: number }>('/interviews/sessions', input)
  )
  if ('success' in result) refreshData()
  return result
}
