/** Aptitude API. */

import { api, toActionResult } from '@/lib/api-client'
import { refreshData } from '@/lib/query-client'
import type { ActionResult } from '@/types/global'
import type { AptitudeView } from './lib/aptitude-queries'
import type { RecordAptitudeAttemptInput } from './validators'

export function fetchAptitudeView(signal?: AbortSignal): Promise<AptitudeView> {
  return api.get<AptitudeView>('/aptitude', signal)
}

export async function recordAptitudeAttempt(
  input: RecordAptitudeAttemptInput
): Promise<ActionResult<{ accuracy: number }>> {
  const result = await toActionResult(() =>
    api.post<{ accuracy: number }>('/aptitude/attempts', input)
  )
  if ('success' in result) refreshData()
  return result
}
