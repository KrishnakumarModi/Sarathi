/**
 * CS fundamentals metrics (cs/03_CS_ANALYTICS.md).
 * CS_Readiness feeds the role readiness calculator.
 */

import { percent } from '@/lib/utils'
import type { Importance } from '@/types/database.types'

export interface CSTopicWithMastery {
  id: string
  domain_id: string
  name: string
  difficulty: number
  importance: Importance
  concept_understood: boolean
  questions_practiced: boolean
  quiz_passed: boolean
  interview_ready: boolean
  confidence: number | null
}

const DIMENSIONS = [
  'concept_understood',
  'questions_practiced',
  'quiz_passed',
  'interview_ready',
] as const

/** 0-100 completeness for one topic across its four dimensions. */
export function calculateTopicCompleteness(topic: CSTopicWithMastery): number {
  const done = DIMENSIONS.filter((d) => topic[d]).length
  return (done / DIMENSIONS.length) * 100
}

/** Average topic completeness across a domain. Empty domain scores 0. */
export function calculateDomainMastery(topics: CSTopicWithMastery[]): number {
  if (topics.length === 0) return 0
  const total = topics.reduce((sum, t) => sum + calculateTopicCompleteness(t), 0)
  return total / topics.length
}

/** Share of ALL topics whose concept is understood — the role-readiness input. */
export function calculateCSReadiness(allTopics: CSTopicWithMastery[]): number {
  if (allTopics.length === 0) return 0
  return percent(allTopics.filter((t) => t.concept_understood).length, allTopics.length)
}

export function calculateTopicCoverage(topics: CSTopicWithMastery[]): number {
  if (topics.length === 0) return 0
  return percent(topics.filter((t) => t.concept_understood).length, topics.length)
}

export function calculateInterviewRate(topics: CSTopicWithMastery[]): number {
  if (topics.length === 0) return 0
  return percent(topics.filter((t) => t.interview_ready).length, topics.length)
}

export interface DomainMastery {
  domainId: string
  mastery: number
}

/** Domains sorted weakest first. */
export function getWeakestDomains(
  topicsByDomain: Record<string, CSTopicWithMastery[]>
): DomainMastery[] {
  return Object.entries(topicsByDomain)
    .map(([domainId, topics]) => ({ domainId, mastery: calculateDomainMastery(topics) }))
    .sort((a, b) => a.mastery - b.mastery || a.domainId.localeCompare(b.domainId))
}

/** Critical topics whose concept is not yet understood. */
export function getCriticalGaps(allTopics: CSTopicWithMastery[]): CSTopicWithMastery[] {
  return allTopics.filter((t) => t.importance === 'critical' && !t.concept_understood)
}

export function groupTopicsByDomain(
  topics: CSTopicWithMastery[]
): Record<string, CSTopicWithMastery[]> {
  const grouped: Record<string, CSTopicWithMastery[]> = {}
  for (const topic of topics) {
    ;(grouped[topic.domain_id] ??= []).push(topic)
  }
  return grouped
}

/** Left-border colour band for a topic card (05_DESIGN_SYSTEM.md). */
export function getCompletenessColor(completeness: number): string {
  if (completeness >= 100) return 'border-l-primary'
  if (completeness >= 75) return 'border-l-emerald-500'
  if (completeness >= 50) return 'border-l-blue-500'
  if (completeness >= 25) return 'border-l-amber-500'
  return 'border-l-muted'
}
