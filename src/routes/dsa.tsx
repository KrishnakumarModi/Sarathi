import { useQuery } from '@tanstack/react-query'
import { Code, Percent, Target, Trophy } from 'lucide-react'

import { useDocumentTitle } from '@/components/shared/document-title'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { RealtimeSync } from '@/components/shared/realtime-sync'
import { StatCard } from '@/components/shared/stat-card'
import { PatternGrid } from '@/features/dsa/components/pattern-grid'
import { fetchDsaOverview } from '@/features/dsa/api'
import { DsaSkeleton } from './skeletons/dsa'

const REALTIME_TABLES = ['leetcode_attempts']

export default function DsaPage() {
  useDocumentTitle('DSA')
  const query = useQuery({
    queryKey: ['dsa'],
    queryFn: ({ signal }) => fetchDsaOverview(signal),
  })

  return (
    <QueryBoundary query={query} skeleton={<DsaSkeleton />}>
      {(overview) => {
        const patternsTouched = overview.patterns.filter((p) => p.coverage.solved > 0).length
        return (
          <div className="space-y-6">
            <RealtimeSync tables={REALTIME_TABLES} />

            <PageHeader
              title="DSA"
              description={`${overview.patterns.length} patterns · ${overview.totalProblems} curated problems`}
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Problems solved" value={overview.metrics.totalSolved} icon={Code} />
              <StatCard
                label="Solved independently"
                value={`${Math.round(overview.metrics.independentRate)}%`}
                icon={Percent}
                hint={`${overview.metrics.totalMastered} mastered`}
              />
              <StatCard
                label="Patterns covered"
                value={`${patternsTouched}/${overview.patterns.length}`}
                icon={Trophy}
              />
              <StatCard
                label="This week"
                value={`${overview.solvedThisWeek}/${overview.weeklyTarget}`}
                icon={Target}
                trend={
                  overview.solvedThisWeek >= overview.weeklyTarget ? 'Target met' : 'Below target'
                }
                trendDirection={
                  overview.solvedThisWeek >= overview.weeklyTarget ? 'up' : 'neutral'
                }
              />
            </div>

            <PatternGrid patterns={overview.patterns} />
          </div>
        )
      }}
    </QueryBoundary>
  )
}
