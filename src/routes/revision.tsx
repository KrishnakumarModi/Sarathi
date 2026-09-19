import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { useDocumentTitle } from '@/components/shared/document-title'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { RevisionSession } from '@/features/revision/components/revision-session'
import { fetchRevisionView } from '@/features/revision/api'
import { RevisionSkeleton } from './skeletons/revision'

const HEALTH_COPY = {
  strong: { label: 'Retention looks strong', variant: 'success' as const },
  steady: { label: 'Retention is steady', variant: 'info' as const },
  fragile: { label: 'Retention needs attention', variant: 'warning' as const },
  'insufficient-data': {
    label: 'Not enough reviews yet to judge retention',
    variant: 'muted' as const,
  },
}

export default function RevisionPage() {
  useDocumentTitle('Revision')
  const query = useQuery({
    queryKey: ['revision'],
    queryFn: ({ signal }) => fetchRevisionView(signal),
  })

  return (
    <QueryBoundary query={query} skeleton={<RevisionSkeleton />}>
      {(view) => {
        const health = HEALTH_COPY[view.retentionHealth]
        return (
          <div className="space-y-6">
            <PageHeader
              title="Revision"
              description={`${view.totalTracked} concept${view.totalTracked === 1 ? '' : 's'} tracked · ${view.reviewsLast30Days} reviewed in the last 30 days`}
              action={<Badge variant={health.variant}>{health.label}</Badge>}
            />

            {view.due.length === 0 ? (
              <EmptyState
                icon={RefreshCw}
                title="No reviews due today"
                description={
                  view.totalTracked === 0
                    ? 'Checkpoints appear automatically once you finish theory and practice for a unit.'
                    : `${view.upcomingCount} checkpoint${view.upcomingCount === 1 ? '' : 's'} scheduled for later.`
                }
                action={{ label: "Back to today's plan", href: '/today' }}
              />
            ) : (
              <RevisionSession items={view.due} />
            )}
          </div>
        )
      }}
    </QueryBoundary>
  )
}
