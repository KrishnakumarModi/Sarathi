import type { DailyPlanRow, DailyTaskRow } from '@/types/database.types'
import type { BacklogSummary } from './lib/backlog-manager'

export interface PlanWithTasks extends DailyPlanRow {
  tasks: DailyTaskRow[]
}

export interface TodayView {
  plan: PlanWithTasks | null
  backlog: BacklogSummary
  dueRevisionCount: number
  capacityMinutes: number
  completedMinutes: number
  onboardingComplete: boolean
}
