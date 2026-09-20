import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Map } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useDocumentTitle } from '@/components/shared/document-title'
import { DomainIcon } from '@/components/shared/domain-icon'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { fetchRoadmap } from '@/features/dashboard/api'
import { cn, formatMinutes, progressColor } from '@/lib/utils'
import { RoadmapSkeleton } from './skeletons/roadmap'

/**
 * Sequence view of the whole path. Deliberately ordered by dependency
 * (domain sort_order), not by calendar week — the plan adapts to capacity,
 * so a fixed 8-week grid would be a promise the planner cannot keep.
 */
export default function RoadmapPage() {
  useDocumentTitle('Roadmap')
  const query = useQuery({
    queryKey: ['roadmap'],
    queryFn: ({ signal }) => fetchRoadmap(signal),
  })

  return (
    <QueryBoundary query={query} skeleton={<RoadmapSkeleton />}>
      {(view) => {
        const { domains, totalMinutes, weeklyMinutes, weeksNeeded, weeksElapsed } = view
        const completedUnits = domains.reduce((s, d) => s + d.completedUnits, 0)
        const totalUnits = domains.reduce((s, d) => s + d.unitCount, 0)
        const overall = totalUnits > 0 ? (completedUnits / totalUnits) * 100 : 0

        return (
          <div className="space-y-6">
            <PageHeader
              title="Roadmap"
              description="The whole path in dependency order. Where you actually spend time each day comes from the planner."
              action={<Badge variant="muted">Week {weeksElapsed}</Badge>}
            />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Overall progress</CardTitle>
                <CardDescription>
                  {completedUnits} of {totalUnits} units complete · {formatMinutes(totalMinutes)} of
                  content in total
                  {weeksNeeded
                    ? ` · roughly ${weeksNeeded} weeks at your current availability`
                    : ' · set your weekly availability to estimate a timeline'}
                  {view.targetTimelineWeeks
                    ? ` · you targeted ${view.targetTimelineWeeks} weeks`
                    : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress
                  value={overall}
                  indicatorClassName={progressColor(overall)}
                  aria-label="Overall curriculum progress"
                />
                {weeksNeeded &&
                view.targetTimelineWeeks &&
                weeksNeeded > view.targetTimelineWeeks ? (
                  <p className="mt-3 rounded-md bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                    At {Math.round(weeklyMinutes / 60)} hours a week the full curriculum takes about{' '}
                    {weeksNeeded} weeks, longer than your {view.targetTimelineWeeks}-week target.
                    Either raise your availability, extend the target, or accept covering less of
                    the curriculum — the planner will still prioritise by role relevance.
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <ol className="space-y-3">
              {domains.map((domain, index) => {
                const isComplete = domain.unitCount > 0 && domain.completedUnits === domain.unitCount
                const isStarted = domain.startedUnits > 0

                return (
                  <li key={domain.id}>
                    <Link
                      to={`/curriculum/${domain.id}`}
                      className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Card
                        className={cn(
                          'transition-colors duration-200 hover:border-primary/40',
                          isComplete && 'border-emerald-500/40'
                        )}
                      >
                        <CardContent className="flex items-center gap-4 p-4">
                          <div
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium tabular-nums',
                              isComplete
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                : isStarted
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {index + 1}
                          </div>

                          <DomainIcon
                            name={domain.icon}
                            className={cn(
                              'hidden h-5 w-5 shrink-0 sm:block',
                              domain.color ?? 'text-primary'
                            )}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="truncate font-medium">{domain.name}</h2>
                              {isComplete ? <Badge variant="success">Complete</Badge> : null}
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {domain.description}
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                              <Progress
                                value={domain.averageMastery}
                                indicatorClassName={progressColor(domain.averageMastery)}
                                className="h-1.5"
                                aria-label={`${domain.name} progress`}
                              />
                              <span className="w-20 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                                {domain.completedUnits}/{domain.unitCount}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                )
              })}
            </ol>

            {domains.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                  <Map className="h-8 w-8 text-muted-foreground" aria-hidden />
                  <p className="text-sm text-muted-foreground">
                    No curriculum loaded. Run the seed script.
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        )
      }}
    </QueryBoundary>
  )
}
