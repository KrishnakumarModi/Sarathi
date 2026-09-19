import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useDocumentTitle } from '@/components/shared/document-title'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { RealtimeSync } from '@/components/shared/realtime-sync'
import { ProblemList } from '@/features/dsa/components/problem-list'
import { fetchPatternDetail } from '@/features/dsa/api'
import { progressColor } from '@/lib/utils'
import { DsaPatternidSkeleton } from './skeletons/dsa-patternId'

const REALTIME_TABLES = ['leetcode_attempts']

export default function DsaPatternPage() {
  const { patternId = '' } = useParams()
  useDocumentTitle(patternId.replace(/-/g, ' '))

  const query = useQuery({
    queryKey: ['dsa', 'pattern', patternId],
    queryFn: ({ signal }) => fetchPatternDetail(patternId, signal),
    enabled: Boolean(patternId),
  })

  return (
    <QueryBoundary
      query={query}
      skeleton={<DsaPatternidSkeleton />}
      description="That pattern could not be loaded."
    >
      {(detail) => (
        <div className="space-y-6">
          <RealtimeSync tables={REALTIME_TABLES} />

          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link to="/dsa">
              <ArrowLeft className="h-4 w-4" />
              All patterns
            </Link>
          </Button>

          <PageHeader
            title={detail.pattern.name}
            description={detail.pattern.description ?? undefined}
          />

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">When to reach for it</CardTitle>
                <CardDescription>Recognition cues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{detail.pattern.recognition_cues}</p>
                {detail.pattern.template_code ? (
                  <div>
                    <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Template
                    </h3>
                    <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                      <code>{detail.pattern.template_code}</code>
                    </pre>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your coverage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold tabular-nums">
                  {detail.coverage.solved}
                  <span className="text-base font-normal text-muted-foreground">
                    {' '}
                    / {detail.coverage.total}
                  </span>
                </div>
                <Progress
                  value={detail.coverage.coveragePercent}
                  indicatorClassName={progressColor(detail.coverage.coveragePercent)}
                  aria-label="Pattern coverage"
                />
                <p className="text-xs text-muted-foreground">
                  {detail.coverage.mastered} mastered · solving two or more counts this pattern
                  toward role proximity.
                </p>
              </CardContent>
            </Card>
          </div>

          <ProblemList problems={detail.problems} />
        </div>
      )}
    </QueryBoundary>
  )
}
