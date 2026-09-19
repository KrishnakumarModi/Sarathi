import type {
  AtomicUnitRow, DomainRow, ModuleRow, SubtopicRow, TaskCompletionRow, TopicRow,
} from '@/types/database.types'
import type { UnlockStatus } from './lib/prerequisites'

export interface UnitWithProgress extends AtomicUnitRow {
  completion: TaskCompletionRow | null
  masteryScore: number
  masteryLevel: number
  unlock: UnlockStatus
  skillIds: string[]
}

export interface SubtopicWithUnits extends SubtopicRow {
  units: UnitWithProgress[]
}

export interface TopicWithSubtopics extends TopicRow {
  subtopics: SubtopicWithUnits[]
}

export interface ModuleWithTopics extends ModuleRow {
  topics: TopicWithSubtopics[]
}

export interface DomainTree extends DomainRow {
  modules: ModuleWithTopics[]
}

export interface DomainSummary extends DomainRow {
  unitCount: number
  completedUnits: number
  startedUnits: number
  averageMastery: number
}

export interface CurriculumFilters {
  difficulty?: number
  status?: 'not-started' | 'in-progress' | 'complete'
  search?: string
}
