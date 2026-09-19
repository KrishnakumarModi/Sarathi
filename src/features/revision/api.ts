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
