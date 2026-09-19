import { Suspense, lazy } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3 } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { useDocumentTitle } from '@/components/shared/document-title'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { ApplicationFunnel } from '@/features/analytics/components/application-funnel'
import { CareerReadinessGauge } from '@/features/analytics/components/career-readiness-gauge'
import { fetchAnalyticsView } from '@/features/analytics/api'
import { AnalyticsSkeleton } from './skeletons/analytics'

// Recharts is heavy and needs the DOM: load the chart bundle lazily so it
// stays out of the initial payload (00_GLOBAL_RULES.md 13.2).
const ChartsFallback = () => <Skeleton className="h-[300px] w-full" />

const LearningVelocityChart = lazy(async () => ({
  default: (await import('@/features/analytics/components/charts')).LearningVelocityChart,
}))
const SkillRadarChart = lazy(async () => ({
  default: (await import('@/features/analytics/components/charts')).SkillRadarChart,
}))
const RoleReadinessChart = lazy(async () => ({
  default: (await import('@/features/analytics/components/charts')).RoleReadinessChart,
}))
const CurriculumDonut = lazy(async () => ({
  default: (await import('@/features/analytics/components/charts')).CurriculumDonut,
}))
const DsaHeatmap = lazy(async () => ({
  default: (await import('@/features/analytics/components/charts')).DsaHeatmap,
}))

export default function AnalyticsPage() {
  useDocumentTitle('Analytics')
  const query = useQuery({
    queryKey: ['analytics', 30],
    queryFn: ({ signal }) => fetchAnalyticsView(30, signal),
  })

  return (
    <QueryBoundary query={query} skeleton={<AnalyticsSkeleton />}>
      {(view) => (
        <div className="space-y-6">
          <PageHeader
            title="Analytics"
            description="Diagnostic trends. The daily plan is still where the work happens."
          />

          {!view.hasAnyData ? (
            <EmptyState
              icon={BarChart3}
              title="Not enough data yet"
              description="Complete a few units, log some problems, or run a study session and the trends will fill in."
              action={{ label: "Go to today's plan", href: '/today' }}
            />
          ) : null}

          <CareerReadinessGauge result={view.careerReadiness} />

          <Suspense fallback={<ChartsFallback />}>
            <div className="grid gap-4 lg:grid-cols-2">
              <LearningVelocityChart data={view.velocity} />
              <SkillRadarChart data={view.skillRadar} />
              <RoleReadinessChart roles={view.roleReadiness} />
              <CurriculumDonut data={view.curriculum} />
            </div>

            <DsaHeatmap coverage={view.patternCoverage} patternNames={view.patternNames} />
          </Suspense>

          <ApplicationFunnel funnel={view.funnel} />
        </div>
      )}
    </QueryBoundary>
  )
}
