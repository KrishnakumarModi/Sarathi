/** CS view model (computed by `backend/app/queries/cs.py`). */

import type { CsDomainRow, CsQuestionRow } from '@/types/database.types'
import type { CSTopicWithMastery } from './cs-calculations'

export interface CsView {
  domains: CsDomainRow[]
  topicsByDomain: Record<string, CSTopicWithMastery[]>
  questionsByTopic: Record<string, CsQuestionRow[]>
  allTopics: CSTopicWithMastery[]
  csReadiness: number
  criticalGaps: CSTopicWithMastery[]
}
