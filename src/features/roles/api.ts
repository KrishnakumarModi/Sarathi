/** Target-role API. */

import { api, toActionResult } from '@/lib/api-client'
import { refreshData } from '@/lib/query-client'
import type { ActionResult } from '@/types/global'
import type { RolesView } from './lib/role-queries'

export function fetchRolesView(signal?: AbortSignal): Promise<RolesView> {
  return api.get<RolesView>('/roles', signal)
}

export async function toggleRole(input: {
  role_id: string
  enabled: boolean
}): Promise<ActionResult> {
  const result = await toActionResult(() => api.post('/roles/toggle', input))
  if ('success' in result) refreshData()
  return result as ActionResult
}

export async function setPrimaryRole(input: { role_id: string }): Promise<ActionResult> {
  const result = await toActionResult(() => api.post('/roles/primary', input))
  if ('success' in result) refreshData()
  return result as ActionResult
}
