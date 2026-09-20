/** Skills view models (computed by `backend/app/queries/skills.py`). */

import type { EvidenceSource } from '@/types/database.types'

export interface SkillEvidenceSummary {
  sourceType: EvidenceSource
  count: number
  bestScore: number
  latest: string
}

export interface SkillWithMasteryView {
  id: string
  name: string
  category: string
  description: string | null
  masteryScore: number
  masteryLevel: number
  /** Roles that want this skill, with the weight each assigns it. */
  roles: Array<{ roleId: string; roleName: string; weight: number; isCritical: boolean }>
  maxRoleWeight: number
  evidence: SkillEvidenceSummary[]
  freshnessDays: number | null
}

export interface SkillsView {
  skills: SkillWithMasteryView[]
  categories: string[]
  enabledRoleIds: string[]
}
