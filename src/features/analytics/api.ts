/** Analytics API. */

import { api } from '@/lib/api-client'
import type { AnalyticsView } from './lib/analytics-queries'

export function fetchAnalyticsView(days = 30, signal?: AbortSignal): Promise<AnalyticsView> {
  return api.get<AnalyticsView>(`/analytics?days=${days}`, signal)
}
