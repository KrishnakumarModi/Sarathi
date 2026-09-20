/** Role view models (computed by `backend/app/queries/roles.py`). */

import type { RoleRow } from '@/types/database.types'
import type { ReadinessResult, RoleOverlap } from './readiness-calculator'

export interface RoleWithReadiness extends RoleRow {
  isEnabled: boolean
  isPrimary: boolean
  readiness: ReadinessResult
}

export interface RolesView {
  roles: RoleWithReadiness[]
  skillNames: Record<string, string>
  overlap: RoleOverlap[]
  enabledCount: number
}
