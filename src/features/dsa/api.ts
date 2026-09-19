/** DSA API. */

import { api, toActionResult } from '@/lib/api-client'
import { refreshData } from '@/lib/query-client'
import type { ActionResult } from '@/types/global'
import type { DsaOverview, PatternDetail } from './lib/dsa-queries'
import type { RecordAttemptInput } from './validators'

export function fetchDsaOverview(signal?: AbortSignal): Promise<DsaOverview> {
  return api.get<DsaOverview>('/dsa', signal)
}

export function fetchPatternDetail(
  patternId: string,
  signal?: AbortSignal
): Promise<PatternDetail> {
  return api.get<PatternDetail>(`/dsa/patterns/${encodeURIComponent(patternId)}`, signal)
}

export async function recordAttempt(
  input: RecordAttemptInput
): Promise<ActionResult<{ status: string; attemptNumber: number }>> {
  const result = await toActionResult(() =>
    api.post<{ status: string; attemptNumber: number }>('/dsa/attempts', input)
  )
  if ('success' in result) refreshData()
  return result
}
