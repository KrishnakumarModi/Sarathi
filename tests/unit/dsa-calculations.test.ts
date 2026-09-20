import { describe, expect, it } from 'vitest'
import {
  calculateDsaMetrics,
  calculatePatternCoverage,
  countPatternsCovered,
  deriveProblemStatus,
  getWeeklyProgress,
  isSolvedStatus,
  type Attempt,
  type ProblemLike,
} from '@/features/dsa/lib/dsa-calculations'

function attempt(overrides: Partial<Attempt> = {}): Attempt {
  return {
    problem_id: 'two-sum',
    solved: true,
    solved_independently: true,
    hint_used: false,
    editorial_used: false,
    confidence: 3,
    time_minutes: 20,
    mistake_category: 'none',
    created_at: '2026-03-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('deriveProblemStatus', () => {
  it('reports not-attempted with no history', () => {
    expect(deriveProblemStatus([])).toBe('not-attempted')
  })

  it('reports attempted when never solved', () => {
    expect(deriveProblemStatus([attempt({ solved: false })])).toBe('attempted')
  })

  it('treats a solve with no independence recorded as attempted', () => {
    // The guideline's ladder has no plain "solved" rung: a solve that was
    // neither independent nor explicitly assisted stays at 'attempted' until
    // the user records how they got there.
    expect(deriveProblemStatus([attempt({ solved_independently: false })])).toBe('attempted')
  })

  it('reports solved-assisted when the editorial was used', () => {
    expect(deriveProblemStatus([attempt({ editorial_used: true })])).toBe('solved-assisted')
  })

  it('reports solved-hint when only a hint was used', () => {
    expect(deriveProblemStatus([attempt({ hint_used: true })])).toBe('solved-hint')
  })

  it('reports solved-independent without high confidence', () => {
    expect(
      deriveProblemStatus([attempt({ solved_independently: true, confidence: 3 })])
    ).toBe('solved-independent')
  })

  it('reports mastered for an independent solve with confidence 4 or more', () => {
    expect(
      deriveProblemStatus([attempt({ solved_independently: true, confidence: 4 })])
    ).toBe('mastered')
  })

  it('uses the best attempt, so an early hint is not permanent', () => {
    expect(
      deriveProblemStatus([
        attempt({ hint_used: true }),
        attempt({ solved_independently: true, confidence: 5 }),
      ])
    ).toBe('mastered')
  })

  it('treats a null confidence as low', () => {
    expect(
      deriveProblemStatus([attempt({ solved_independently: true, confidence: null })])
    ).toBe('solved-independent')
  })

  it('classifies which statuses count as solved', () => {
    expect(isSolvedStatus('not-attempted')).toBe(false)
    expect(isSolvedStatus('attempted')).toBe(false)
    expect(isSolvedStatus('solved-assisted')).toBe(true)
    expect(isSolvedStatus('mastered')).toBe(true)
  })
})

const PROBLEMS: ProblemLike[] = [
  { id: 'two-sum', pattern_id: 'hashing', difficulty: 'easy' },
  { id: 'group-anagrams', pattern_id: 'hashing', difficulty: 'medium' },
  { id: 'three-sum', pattern_id: 'two-pointers', difficulty: 'medium' },
]

describe('calculatePatternCoverage', () => {
  it('includes patterns with no problems solved', () => {
    const coverage = calculatePatternCoverage(PROBLEMS, [], ['hashing', 'two-pointers', 'trie'])
    expect(coverage).toHaveLength(3)
    expect(coverage.every((c) => c.solved === 0)).toBe(true)
    expect(coverage.find((c) => c.patternId === 'trie')?.total).toBe(0)
  })

  it('computes coverage per pattern', () => {
    const coverage = calculatePatternCoverage(
      PROBLEMS,
      [attempt({ problem_id: 'two-sum', solved_independently: true, confidence: 5 })],
      ['hashing', 'two-pointers']
    )
    const hashing = coverage.find((c) => c.patternId === 'hashing')
    expect(hashing).toMatchObject({ total: 2, solved: 1, mastered: 1, coveragePercent: 50 })
  })

  it('ignores attempts for problems outside the given set', () => {
    const coverage = calculatePatternCoverage(
      PROBLEMS,
      [attempt({ problem_id: 'unknown-problem' })],
      ['hashing']
    )
    expect(coverage[0].solved).toBe(0)
  })

  it('counts patterns meeting the minimum-solved bar', () => {
    const coverage = calculatePatternCoverage(
      PROBLEMS,
      [attempt({ problem_id: 'two-sum' }), attempt({ problem_id: 'group-anagrams' })],
      ['hashing', 'two-pointers']
    )
    expect(countPatternsCovered(coverage, 2)).toBe(1)
    expect(countPatternsCovered(coverage, 1)).toBe(1)
  })
})

describe('calculateDsaMetrics', () => {
  it('returns a well-formed zero state', () => {
    const metrics = calculateDsaMetrics(PROBLEMS, [])
    expect(metrics.totalSolved).toBe(0)
    expect(metrics.independentRate).toBe(0)
    expect(metrics.avgTimeByDifficulty.easy).toBeNull()
    expect(metrics.mistakeFrequency).toEqual([])
  })

  it('computes the independent rate over solved problems', () => {
    const metrics = calculateDsaMetrics(PROBLEMS, [
      attempt({ problem_id: 'two-sum', solved_independently: true, confidence: 5 }),
      attempt({ problem_id: 'group-anagrams', hint_used: true }),
    ])
    expect(metrics.totalSolved).toBe(2)
    expect(metrics.totalMastered).toBe(1)
    expect(metrics.independentRate).toBe(50)
  })

  it('averages solve time per difficulty', () => {
    const metrics = calculateDsaMetrics(PROBLEMS, [
      attempt({ problem_id: 'two-sum', time_minutes: 10 }),
      attempt({ problem_id: 'two-sum', time_minutes: 20 }),
      attempt({ problem_id: 'three-sum', time_minutes: 40 }),
    ])
    expect(metrics.avgTimeByDifficulty.easy).toBe(15)
    expect(metrics.avgTimeByDifficulty.medium).toBe(40)
    expect(metrics.avgTimeByDifficulty.hard).toBeNull()
  })

  it('ranks mistake categories and ignores "none"', () => {
    const metrics = calculateDsaMetrics(PROBLEMS, [
      attempt({ mistake_category: 'logic' }),
      attempt({ mistake_category: 'logic' }),
      attempt({ mistake_category: 'edge-case' }),
      attempt({ mistake_category: 'none' }),
    ])
    expect(metrics.mistakeFrequency[0]).toEqual({ category: 'logic', count: 2 })
    expect(metrics.mistakeFrequency.map((m) => m.category)).not.toContain('none')
  })

  it('counts solved problems by difficulty', () => {
    const metrics = calculateDsaMetrics(PROBLEMS, [
      attempt({ problem_id: 'two-sum' }),
      attempt({ problem_id: 'three-sum' }),
    ])
    expect(metrics.solvedByDifficulty).toEqual({ easy: 1, medium: 1, hard: 0 })
  })
})

describe('getWeeklyProgress', () => {
  it('reports progress against the weekly target', () => {
    expect(getWeeklyProgress(12, 15)).toEqual({
      solved: 12,
      target: 15,
      percent: 80,
      onTrack: false,
    })
    expect(getWeeklyProgress(15, 15).onTrack).toBe(true)
  })

  it('returns 0 rather than NaN for a zero target', () => {
    expect(getWeeklyProgress(3, 0).percent).toBe(0)
  })
})
