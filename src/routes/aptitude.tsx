import { useQuery } from '@tanstack/react-query'
import { Brain } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDocumentTitle } from '@/components/shared/document-title'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { AptitudeTracker } from '@/features/aptitude/components/aptitude-tracker'
import { fetchAptitudeView } from '@/features/aptitude/api'
import { AptitudeSkeleton } from './skeletons/aptitude'

export default function AptitudePage() {
  useDocumentTitle('Aptitude')
  const query = useQuery({
    queryKey: ['aptitude'],
    queryFn: ({ signal }) => fetchAptitudeView(signal),
  })

  return (
    <QueryBoundary query={query} skeleton={<AptitudeSkeleton />}>
      {(view) => {
        if (view.categories.length === 0) {
          return (
            <div className="space-y-6">
              <PageHeader title="Aptitude" />
              <EmptyState
                icon={Brain}
                title="Content not loaded"
                description="Run the seed script to load aptitude categories and topics."
              />
            </div>
          )
        }

        return (
          <div className="space-y-6">
            <PageHeader
              title="Aptitude"
              description="Practice for placement drives and company aptitude rounds."
              action={<Badge variant="info">{view.weeklyQuestions} questions this week</Badge>}
            />

            {view.weakTopics.length > 0 ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Worth another pass</CardTitle>
                  <CardDescription>
                    Below 60% accuracy with at least five questions practised.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1.5">
                  {view.weakTopics.slice(0, 8).map((weak) => (
                    <Badge key={weak.topicId} variant="warning">
                      {view.topicNames[weak.topicId] ?? weak.topicId} · {Math.round(weak.accuracy)}%
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            <AptitudeTracker
              categories={view.categories}
              topicsByCategory={view.topicsByCategory}
              summaryByCategory={view.summaryByCategory}
            />
          </div>
        )
      }}
    </QueryBoundary>
  )
}
