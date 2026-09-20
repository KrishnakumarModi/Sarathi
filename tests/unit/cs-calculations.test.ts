import { describe, expect, it } from 'vitest'
import {
  calculateCSReadiness,
  calculateDomainMastery,
  calculateInterviewRate,
  calculateTopicCompleteness,
  getCriticalGaps,
  getWeakestDomains,
  groupTopicsByDomain,
  type CSTopicWithMastery,
} from '@/features/cs/lib/cs-calculations'

function topic(overrides: Partial<CSTopicWithMastery> = {}): CSTopicWithMastery {
  return {
    id: 'dbms-acid',
    domain_id: 'dbms',
    name: 'ACID Properties',
    difficulty: 2,
    importance: 'critical',
    concept_understood: false,
    questions_practiced: false,
    quiz_passed: false,
    interview_ready: false,
    confidence: null,
    ...overrides,
  }
}

describe('calculateTopicCompleteness', () => {
  it('scores 0 with nothing ticked and 100 with everything', () => {
    expect(calculateTopicCompleteness(topic())).toBe(0)
    expect(
      calculateTopicCompleteness(
        topic({
          concept_understood: true,
          questions_practiced: true,
          quiz_passed: true,
          interview_ready: true,
        })
      )
    ).toBe(100)
  })

  it('scores each dimension at 25', () => {
    expect(calculateTopicCompleteness(topic({ concept_understood: true }))).toBe(25)
    expect(
      calculateTopicCompleteness(topic({ concept_understood: true, quiz_passed: true }))
    ).toBe(50)
  })
})

describe('calculateDomainMastery', () => {
  it('returns 0 for an empty domain', () => {
    expect(calculateDomainMastery([])).toBe(0)
  })

  it('averages topic completeness', () => {
    expect(
      calculateDomainMastery([
        topic({ id: 'a', concept_understood: true, questions_practiced: true }),
        topic({ id: 'b' }),
      ])
    ).toBe(25)
  })

  it('reaches 100 when every topic is fully complete', () => {
    const complete = {
      concept_understood: true,
      questions_practiced: true,
      quiz_passed: true,
      interview_ready: true,
    }
    expect(calculateDomainMastery([topic({ id: 'a', ...complete }), topic({ id: 'b', ...complete })])).toBe(100)
  })
})

describe('calculateCSReadiness', () => {
  it('counts only concept_understood across all topics', () => {
    expect(
      calculateCSReadiness([
        topic({ id: 'a', concept_understood: true }),
        topic({ id: 'b', quiz_passed: true }),
        topic({ id: 'c' }),
        topic({ id: 'd', concept_understood: true }),
      ])
    ).toBe(50)
  })

  it('returns 0 with no topics', () => {
    expect(calculateCSReadiness([])).toBe(0)
  })
})

describe('getWeakestDomains', () => {
  it('sorts weakest first and is deterministic on ties', () => {
    const grouped = groupTopicsByDomain([
      topic({ id: 'os-1', domain_id: 'os', concept_understood: true, quiz_passed: true }),
      topic({ id: 'cn-1', domain_id: 'cn' }),
      topic({ id: 'dbms-1', domain_id: 'dbms' }),
    ])
    const weakest = getWeakestDomains(grouped)
    expect(weakest[0].mastery).toBe(0)
    expect(weakest.at(-1)?.domainId).toBe('os')
    expect(weakest.slice(0, 2).map((d) => d.domainId)).toEqual(['cn', 'dbms'])
  })
})

describe('getCriticalGaps', () => {
  it('returns critical topics whose concept is not understood', () => {
    const gaps = getCriticalGaps([
      topic({ id: 'a', importance: 'critical' }),
      topic({ id: 'b', importance: 'critical', concept_understood: true }),
      topic({ id: 'c', importance: 'low' }),
    ])
    expect(gaps.map((g) => g.id)).toEqual(['a'])
  })

  it('returns nothing when there are no critical topics', () => {
    expect(getCriticalGaps([topic({ importance: 'medium' })])).toEqual([])
  })
})

describe('calculateInterviewRate', () => {
  it('measures the share of interview-ready topics', () => {
    expect(
      calculateInterviewRate([
        topic({ id: 'a', interview_ready: true }),
        topic({ id: 'b' }),
      ])
    ).toBe(50)
  })

  it('returns 0 for no topics', () => {
    expect(calculateInterviewRate([])).toBe(0)
  })
})
