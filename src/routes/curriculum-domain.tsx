import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useDocumentTitle } from '@/components/shared/document-title'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { RealtimeSync } from '@/components/shared/realtime-sync'
import { CurriculumFilters } from '@/features/curriculum/components/curriculum-filters'
import { CurriculumTree } from '@/features/curriculum/components/curriculum-tree'
import { fetchDomainTree } from '@/features/curriculum/api'
import { CurriculumDomainidSkeleton } from './skeletons/curriculum-domainId'

const REALTIME_TABLES = ['task_completions']

export default function CurriculumDomainPage() {
  const { domainId = '' } = useParams()
  const [searchParams] = useSearchParams()
  useDocumentTitle(domainId.replace(/-/g, ' '))

  const query = useQuery({
    queryKey: ['curriculum', 'domain', domainId],
    queryFn: ({ signal }) => fetchDomainTree(domainId, signal),
    enabled: Boolean(domainId),
  })

  const rawDifficulty = searchParams.get('difficulty')
  const difficulty = rawDifficulty === null ? undefined : Number(rawDifficulty)

  return (
    <QueryBoundary
      query={query}
      skeleton={<CurriculumDomainidSkeleton />}
      description="That domain could not be loaded."
    >
      {({ domain, unitNames }) => (
        <div className="space-y-6">
          <RealtimeSync tables={REALTIME_TABLES} />

          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link to="/curriculum">
              <ArrowLeft className="h-4 w-4" />
              All domains
            </Link>
          </Button>

          <PageHeader title={domain.name} description={domain.description ?? undefined} />

          <CurriculumFilters />

          <CurriculumTree
            domain={domain}
            unitNames={unitNames}
            filters={{
              difficulty: Number.isFinite(difficulty) ? difficulty : undefined,
              status: searchParams.get('status') ?? undefined,
              search: searchParams.get('search') ?? undefined,
            }}
          />
        </div>
      )}
    </QueryBoundary>
  )
}
