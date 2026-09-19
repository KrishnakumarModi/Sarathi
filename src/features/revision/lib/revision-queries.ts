/**
 * Revision view model.
 *
 * The queries themselves now run in the backend
 * (`backend/app/queries/revision.py`); what remains here is the shape the
 * API returns, so the components that render it keep their exact props.
 */

import type { RetentionHealth } from './revision-strategy'

export interface DueRevision {
  unitId: string
  unitName: string
  unitDescription: string | null
  nextReviewDate: string
  repetitionCount: number
  intervalDays: number
  daysOverdue: number
  domainName: string | null
}

export interface RevisionView {
  due: DueRevision[]
  upcomingCount: number
  totalTracked: number
  retentionHealth: RetentionHealth
  reviewsLast30Days: number
}
