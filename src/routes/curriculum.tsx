import { useQuery } from '@tanstack/react-query'
import { BookOpen } from 'lucide-react'

import { useDocumentTitle } from '@/components/shared/document-title'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { DomainGrid } from '@/features/curriculum/components/domain-card'
import { fetchDomainSummaries } from '@/features/curriculum/api'
import { CurriculumSkeleton } from './skeletons/curriculum'

export default function CurriculumPage() {
  useDocumentTitle('Curriculum')
  const query = useQuery({
    queryKey: ['curriculum', 'domains'],
    queryFn: ({ signal }) => fetchDomainSummaries(signal),
  })

  return (
    <QueryBoundary query={query} skeleton={<CurriculumSkeleton />}>
      {(domains) => {
        const totalUnits = domains.reduce((sum, d) => sum + d.unitCount, 0)
        const completedUnits = domains.reduce((sum, d) => sum + d.completedUnits, 0)

        return (
          <div className="space-y-6">
            <PageHeader
              title="Curriculum"
              description={
                totalUnits > 0
                  ? `${domains.length} domains · ${completedUnits} of ${totalUnits} units complete`
                  : 'Browse the full learning path.'
              }
            />

            {domains.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No curriculum loaded"
                description="Run the seed script to load domains, modules, and atomic units."
              />
            ) : (
              <DomainGrid domains={domains} />
            )}
          </div>
        )
      }}
    </QueryBoundary>
  )
}
