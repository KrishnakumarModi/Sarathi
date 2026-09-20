/** Curriculum API. */

import { api, toActionResult } from '@/lib/api-client'
import { refreshData } from '@/lib/query-client'
import type { ActionResult, CompletionDimension } from '@/types/global'
import type { DomainSummary, DomainTree } from './types'

export interface CompletionUpdateResult {
  unitScore: number
  isComplete: boolean
  revisionScheduled: boolean
}

export interface DomainTreeResponse {
  domain: DomainTree
  unitNames: Record<string, string>
}

export function fetchDomainSummaries(signal?: AbortSignal): Promise<DomainSummary[]> {
  return api.get<DomainSummary[]>('/curriculum/domains', signal)
}

export function fetchDomainTree(
  domainId: string,
  signal?: AbortSignal
): Promise<DomainTreeResponse> {
  return api.get<DomainTreeResponse>(
    `/curriculum/domains/${encodeURIComponent(domainId)}`,
    signal
  )
}

export async function updateTaskCompletion(input: {
  unit_id: string
  dimension: CompletionDimension
  value: boolean
}): Promise<ActionResult<CompletionUpdateResult>> {
  const result = await toActionResult(() =>
    api.post<CompletionUpdateResult>('/curriculum/completion', input)
  )
  if ('success' in result) refreshData()
  return result
}

export async function updateUnitNotes(input: {
  unit_id: string
  confidence?: number
  notes?: string
}): Promise<ActionResult> {
  const result = await toActionResult(() => api.post('/curriculum/notes', input))
  if ('success' in result) refreshData()
  return result as ActionResult
}
