/** Applications and JD analyser API. */

import { api, toActionResult } from '@/lib/api-client'
import { refreshData } from '@/lib/query-client'
import type { ApplicationStatus, JobApplicationRow } from '@/types/database.types'
import type { ActionResult } from '@/types/global'
import type { RoleWithReadiness } from '@/features/roles/lib/role-queries'
import type { FunnelStats, MatchResult } from './lib/match-calculator'
import type { CreateApplicationInput } from './validators'

export interface ApplicationsView {
  applications: JobApplicationRow[]
  funnel: FunnelStats
  topRole: RoleWithReadiness | null
  strategy: { dailyTarget: number; message: string }
}

export function fetchApplications(signal?: AbortSignal): Promise<ApplicationsView> {
  return api.get<ApplicationsView>('/applications', signal)
}

export async function createApplication(
  input: CreateApplicationInput
): Promise<ActionResult<{ id: string }>> {
  const result = await toActionResult(() => api.post<{ id: string }>('/applications', input))
  if ('success' in result) refreshData()
  return result
}

export async function updateApplicationStatus(input: {
  id: string
  status: ApplicationStatus
}): Promise<ActionResult> {
  const result = await toActionResult(() =>
    api.patch(`/applications/${input.id}/status`, { status: input.status })
  )
  if ('success' in result) refreshData()
  return result as ActionResult
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  const result = await toActionResult(() => api.delete(`/applications/${id}`))
  if ('success' in result) refreshData()
  return result as ActionResult
}

export async function analyzeJobDescription(input: {
  jd_text: string
}): Promise<ActionResult<MatchResult & { skillNames: Record<string, string> }>> {
  // A read, not a write: nothing to invalidate afterwards.
  return toActionResult(() =>
    api.post<MatchResult & { skillNames: Record<string, string> }>('/applications/analyze', input)
  )
}
