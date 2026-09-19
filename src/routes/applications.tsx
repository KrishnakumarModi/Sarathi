import { useQuery } from '@tanstack/react-query'
import { Percent, Send, Send as SendIcon, Target, Trophy } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDocumentTitle } from '@/components/shared/document-title'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { StatCard } from '@/components/shared/stat-card'
import { ApplicationForm } from '@/features/jobs/components/application-form'
import { ApplicationTable } from '@/features/jobs/components/application-table'
import { JdAnalyzer } from '@/features/jobs/components/jd-analyzer'
import { fetchApplications } from '@/features/jobs/api'
import { ApplicationsSkeleton } from './skeletons/applications'

export default function ApplicationsPage() {
  useDocumentTitle('Applications')
  const query = useQuery({
    queryKey: ['applications'],
    queryFn: ({ signal }) => fetchApplications(signal),
  })

  return (
    <QueryBoundary query={query} skeleton={<ApplicationsSkeleton />}>
      {({ applications, funnel, topRole, strategy }) => (
        <div className="space-y-6">
          <PageHeader
            title="Applications"
            description="Track every role through the pipeline, from discovered to offer."
            action={
              <div className="flex gap-2">
                <JdAnalyzer />
                <ApplicationForm />
              </div>
            }
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Suggested pace</CardTitle>
              <CardDescription>
                {topRole
                  ? `Based on your proximity to ${topRole.name} (${Math.round(topRole.readiness.score)}%).`
                  : 'Set a target role to get a sharper suggestion.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                <span className="font-medium">
                  About {strategy.dailyTarget} application{strategy.dailyTarget === 1 ? '' : 's'} a
                  day.
                </span>{' '}
                <span className="text-muted-foreground">{strategy.message}</span>
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total tracked" value={funnel.total} icon={SendIcon} />
            <StatCard label="Applied" value={funnel.applied} icon={Target} />
            <StatCard
              label="Callback rate"
              value={`${Math.round(funnel.callbackRate)}%`}
              icon={Percent}
              hint={`${funnel.callbacks} reached assessment or beyond`}
            />
            <StatCard label="Offers" value={funnel.offers} icon={Trophy} />
          </div>

          {applications.length === 0 ? (
            <EmptyState
              icon={Send}
              title="No applications yet"
              description="Add a role you are considering, or paste a job description into the analyser to see how your evidence lines up before you spend time on it."
            />
          ) : (
            <ApplicationTable applications={applications} />
          )}
        </div>
      )}
    </QueryBoundary>
  )
}
