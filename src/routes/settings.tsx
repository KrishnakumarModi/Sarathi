import { Link, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDocumentTitle } from '@/components/shared/document-title'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { SettingsForm } from '@/features/settings/components/settings-form'
import { fetchSettings } from '@/features/settings/api'
import { ApiError } from '@/lib/api-client'
import { SettingsSkeleton } from './skeletons/settings'

export default function SettingsPage() {
  useDocumentTitle('Settings')
  const query = useQuery({
    queryKey: ['settings'],
    queryFn: ({ signal }) => fetchSettings(signal),
    retry: false,
  })

  // No profile yet means onboarding never finished.
  if (query.isError && query.error instanceof ApiError && query.error.status === 404) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <QueryBoundary query={query} skeleton={<SettingsSkeleton />}>
      {({ profile, settings, email }) => (
        <div className="max-w-3xl space-y-6">
          <PageHeader
            title="Settings"
            description="Your availability drives the planner. Keep it honest and the plan stays useful."
            action={<ThemeToggle />}
          />

          <SettingsForm profile={profile} settings={settings} />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Target roles</CardTitle>
              <CardDescription>
                Managed on the Roles page, where you can also see how your evidence maps to each
                one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link to="/roles">Manage roles</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Account</CardTitle>
              <CardDescription>{email}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
    </QueryBoundary>
  )
}
