/**
 * Planner API.
 *
 * These functions keep the names, signatures, and `ActionResult` returns of
 * the Server Actions they replace, so the components calling them are
 * unchanged. Each one refreshes the cached view models on success, which is
 * what `revalidatePath` used to do.
 */

import { api, toActionResult } from '@/lib/api-client'
import { refreshData } from '@/lib/query-client'
import type { ActionResult } from '@/types/global'
import type { TodayView } from './types'

export interface GeneratePlanResult {
  planId: string
  taskCount: number
  minutesScheduled: number
  capacityMinutes: number
  backlogSize: number
  skippedCount: number
}

export const todayQueryKey = ['planner', 'today'] as const

export function fetchTodayView(signal?: AbortSignal): Promise<TodayView> {
  return api.get<TodayView>('/planner/today', signal)
}

export async function generateDailyPlanAction(
  input: { energy_level: number; focus_level: number; plan_date?: string } = {
    energy_level: 3,
    focus_level: 3,
  }
): Promise<ActionResult<GeneratePlanResult>> {
  const result = await toActionResult(() =>
    api.post<GeneratePlanResult>('/planner/plan', input)
  )
  if ('success' in result) refreshData()
  return result
}

export async function updateTaskStatus(input: {
  task_id: string
  status: 'completed' | 'in_progress' | 'skipped' | 'planned'
  reason?: string
}): Promise<ActionResult> {
  const result = await toActionResult(() => api.patch('/planner/tasks/status', input))
  if ('success' in result) refreshData()
  return result as ActionResult
}

export async function dailyCheckIn(input: {
  plan_date: string
  energy_level: number
  focus_level: number
}): Promise<ActionResult> {
  const result = await toActionResult(() => api.post('/planner/check-in', input))
  if ('success' in result) refreshData()
  return result as ActionResult
}

export async function deferTask(taskId: string, reason: string): Promise<ActionResult> {
  const result = await toActionResult(() =>
    api.post('/planner/tasks/defer', { task_id: taskId, reason })
  )
  if ('success' in result) refreshData()
  return result as ActionResult
}
