import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDocumentTitle } from '@/components/shared/document-title'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { RealtimeSync } from '@/components/shared/realtime-sync'
import { BacklogSummaryCard } from '@/features/planner/components/backlog-summary-card'
import { DailyPlanView } from '@/features/planner/components/daily-plan-view'
import { GeneratePlanButton } from '@/features/planner/components/generate-plan-button'
import { fetchTodayView, todayQueryKey } from '@/features/planner/api'
import { TodaySkeleton } from './skeletons/today'

const REALTIME_TABLES = ['daily_tasks']

export default function TodayPage() {
  useDocumentTitle('Today')
  const query = useQuery({
    queryKey: todayQueryKey,
    queryFn: ({ signal }) => fetchTodayView(signal),
  })

  return (
    <QueryBoundary query={query} skeleton={<TodaySkeleton />}>
      {(view) => (
        <div className="space-y-6">
          <RealtimeSync tables={REALTIME_TABLES} />

          <PageHeader
            title="Today"
            description="What to learn, what to revise, and what is still pending."
            action={<GeneratePlanButton hasPlan={Boolean(view.plan)} />}
          />

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {view.plan && view.plan.tasks.length > 0 ? (
                <DailyPlanView tasks={view.plan.tasks} capacityMinutes={view.capacityMinutes} />
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="Your day is clear"
                  description="Generate today's plan and the scheduler will fit new learning, revision, and anything carried over into the time you actually have."
                />
              )}
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" aria-hidden />
                    Revision due
                  </CardTitle>
                  <CardDescription>
                    {view.dueRevisionCount === 0
                      ? 'Nothing due today.'
                      : `${view.dueRevisionCount} checkpoint${view.dueRevisionCount === 1 ? '' : 's'} ready.`}
                  </CardDescription>
                </CardHeader>
                {view.dueRevisionCount > 0 ? (
                  <CardContent>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to="/revision">Start reviewing</Link>
                    </Button>
                  </CardContent>
                ) : null}
              </Card>

              <BacklogSummaryCard backlog={view.backlog} />
            </div>
          </div>
        </div>
      )}
    </QueryBoundary>
  )
}
