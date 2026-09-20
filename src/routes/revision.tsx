import { useState, useTransition } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, RefreshCw, Sparkles, Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useDocumentTitle } from '@/components/shared/document-title'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { RevisionSession } from '@/features/revision/components/revision-session'
import { AIQuiz } from '@/features/revision/components/ai-quiz'
import { fetchRevisionView } from '@/features/revision/api'
import type { UpcomingRevision } from '@/features/revision/lib/revision-queries'
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

function UpcomingCard({ item }: { item: UpcomingRevision }) {
  const [practiceNow, setPracticeNow] = useState(false)

  if (practiceNow) {
    // Build a minimal DueRevision so AIQuiz is satisfied
    const asDue = {
      id: item.id,
      unitId: item.unitId,
      unitName: item.unitName,
      unitDescription: null,
      nextReviewDate: item.nextReviewDate,
      repetitionCount: 0,
      intervalDays: item.intervalDays,
      daysOverdue: 0,
      domainName: item.domainName,
    }
    return (
      <AIQuiz
        item={asDue}
        onComplete={() => setPracticeNow(false)}
        onCancel={() => setPracticeNow(false)}
      />
    )
  }

  return (
    <Card className="transition-colors hover:border-primary/30">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{item.unitName}</p>
          {item.domainName && (
            <p className="text-xs text-muted-foreground">{item.domainName}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="muted" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            in {item.daysUntilDue}d
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs h-7"
            onClick={() => setPracticeNow(true)}
          >
            <Sparkles className="h-3 w-3" />
            Practice early
          </Button>
        </div>
      </CardContent>
    </Card>
  )
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

            {/* ── Due now ────────────────────────────────────────────────── */}
            {view.due.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Due now ({view.due.length})
                </h2>
                <RevisionSession items={view.due} />
              </div>
            ) : (
              <EmptyState
                icon={RefreshCw}
                title="No reviews due today"
                description={
                  view.totalTracked === 0
                    ? 'Checkpoints appear automatically once you finish theory and practice for a unit.'
                    : `${view.upcomingCount} checkpoint${view.upcomingCount === 1 ? '' : 's'} scheduled for later.`
                }
                action={
                  view.totalTracked === 0
                    ? { label: "Start learning", href: '/curriculum' }
                    : { label: "Back to today's plan", href: '/today' }
                }
              />
            )}

            {/* ── Upcoming (next 7 days) — always shown if items exist ─── */}
            {view.upcoming && view.upcoming.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Upcoming — next 7 days ({view.upcoming.length})
                </h2>
                <div className="space-y-2">
                  {view.upcoming.map((item) => (
                    <UpcomingCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      }}
    </QueryBoundary>
  )
}
