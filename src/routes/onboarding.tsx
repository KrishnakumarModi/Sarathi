import { useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { Skeleton } from '@/components/ui/skeleton'
import { useDocumentTitle } from '@/components/shared/document-title'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { OnboardingWizard } from '@/features/onboarding/components/onboarding-wizard'
import { fetchOnboardingContext } from '@/features/settings/api'

function OnboardingSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-[32rem] w-full" />
    </div>
  )
}

export default function OnboardingPage() {
  useDocumentTitle('Set up')
  const query = useQuery({
    queryKey: ['onboarding'],
    queryFn: ({ signal }) => fetchOnboardingContext(signal),
  })

  /**
   * The status as it was when the page opened.
   *
   * The Next.js version made this decision once, on the server, before
   * rendering. Re-deciding it on every refetch would unmount the wizard the
   * instant its own submission invalidates the cache — and the navigation
   * the wizard is about to perform would be lost with it.
   */
  const statusOnEntry = useRef<string | null>(null)

  return (
    <QueryBoundary query={query} skeleton={<OnboardingSkeleton />}>
      {(context) => {
        statusOnEntry.current ??= context.onboardingStatus

        // Already set up — the wizard is not a place to get stuck.
        if (statusOnEntry.current === 'complete') return <Navigate to="/dashboard" replace />

        return (
          <div className="mx-auto max-w-2xl space-y-6">
            <PageHeader
              title="Set up your plan"
              description="Four short steps. Nothing is scheduled until this is done."
            />
            <OnboardingWizard
              roles={context.roles}
              defaultName={context.defaultName}
              defaultTimezone={context.defaultTimezone}
            />
          </div>
        )
      }}
    </QueryBoundary>
  )
}
