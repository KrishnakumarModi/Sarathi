/** Dashboard API. */

import { api } from '@/lib/api-client'
import type { DomainSummary } from '@/features/curriculum/types'
import type { DashboardData } from './lib/dashboard-queries'

export interface RoadmapView {
  domains: DomainSummary[]
  totalMinutes: number
  weeklyMinutes: number
  weeksNeeded: number | null
  weeksElapsed: number
  targetTimelineWeeks: number | null
}

export function fetchDashboard(signal?: AbortSignal): Promise<DashboardData> {
  return api.get<DashboardData>('/dashboard', signal)
}

export function fetchRoadmap(signal?: AbortSignal): Promise<RoadmapView> {
  return api.get<RoadmapView>('/roadmap', signal)
}
