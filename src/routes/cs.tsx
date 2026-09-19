import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, GraduationCap } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDocumentTitle } from '@/components/shared/document-title'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { CsTracker } from '@/features/cs/components/cs-tracker'
import { fetchCsView } from '@/features/cs/api'
import { CsSkeleton } from './skeletons/cs'

export default function CsPage() {
  useDocumentTitle('CS Fundamentals')
  const query = useQuery({
    queryKey: ['cs'],
    queryFn: ({ signal }) => fetchCsView(signal),
  })

  return (
    <QueryBoundary query={query} skeleton={<CsSkeleton />}>
      {(view) => {
        if (view.domains.length === 0) {
          return (
            <div className="space-y-6">
              <PageHeader title="CS Fundamentals" />
              <EmptyState
                icon={GraduationCap}
                title="Content not loaded"
                description="Run the seed script to load CS domains, topics, and interview questions."
              />
            </div>
          )
        }

        return (
          <div className="space-y-6">
            <PageHeader
              title="CS Fundamentals"
              description={`${view.domains.length} domains · ${view.allTopics.length} topics`}
              action={<Badge variant="info">{Math.round(view.csReadiness)}% understood</Badge>}
            />

            {view.criticalGaps.length > 0 ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden />
                    Critical topics not yet understood
                  </CardTitle>
                  <CardDescription>
                    These come up most often in interviews. {view.criticalGaps.length} remaining.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1.5">
                  {view.criticalGaps.slice(0, 8).map((topic) => (
                    <Badge key={topic.id} variant="outline">
                      {topic.name}
                    </Badge>
                  ))}
                  {view.criticalGaps.length > 8 ? (
                    <Badge variant="muted">+{view.criticalGaps.length - 8} more</Badge>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            <CsTracker
              domains={view.domains}
              topicsByDomain={view.topicsByDomain}
              questionsByTopic={view.questionsByTopic}
            />
          </div>
        )
      }}
    </QueryBoundary>
  )
}
