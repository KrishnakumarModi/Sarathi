/** Dashboard view model (computed by `backend/app/queries/dashboard.py`). */

import type { ProfileRow } from '@/types/database.types'
import type { Weakness } from '@/features/analytics/lib/analytics-calculations'
import type { BacklogSummary } from '@/features/planner/lib/backlog-manager'
import type { RoleWithReadiness } from '@/features/roles/lib/role-queries'

export interface DashboardData {
  profile: ProfileRow | null
  today: {
    planned: number
    completed: number
    remainingMinutes: number
    hasPlan: boolean
  }
  dueRevisionCount: number
  backlog: BacklogSummary
  streak: number
  totalHours: number
  weeklyHoursByCategory: Array<{ category: string; hours: number }>
  curriculum: { completed: number; total: number; percent: number }
  roleReadiness: RoleWithReadiness[]
  dsa: { solved: number; independent: number }
  applicationsThisWeek: number
  weakSkills: Weakness[]
  skillNames: Record<string, string>
  /** The single most valuable thing to do next, with why. */
  nextAction: { label: string; detail: string; href: string } | null
}
