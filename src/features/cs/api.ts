/** CS fundamentals API. */

import { api, toActionResult } from '@/lib/api-client'
import { refreshData } from '@/lib/query-client'
import type { ActionResult } from '@/types/global'
import type { CsView } from './lib/cs-queries'
import type { CsMasteryField } from './validators'

export function fetchCsView(signal?: AbortSignal): Promise<CsView> {
  return api.get<CsView>('/cs', signal)
}

export async function updateCsMastery(input: {
  topic_id: string
  field: CsMasteryField
  value: boolean
}): Promise<ActionResult> {
  const result = await toActionResult(() => api.post('/cs/mastery', input))
  if ('success' in result) refreshData()
  return result as ActionResult
}

export async function updateCsConfidence(input: {
  topic_id: string
  confidence: number
}): Promise<ActionResult> {
  const result = await toActionResult(() => api.post('/cs/confidence', input))
  if ('success' in result) refreshData()
  return result as ActionResult
}
