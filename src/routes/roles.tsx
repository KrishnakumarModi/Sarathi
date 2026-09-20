import { useQuery } from '@tanstack/react-query'
import { Layers } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDocumentTitle } from '@/components/shared/document-title'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { RoleGrid } from '@/features/roles/components/role-grid'
import { fetchRolesView } from '@/features/roles/api'
import { RolesSkeleton } from './skeletons/roles'

export default function RolesPage() {
  useDocumentTitle('Roles')
  const query = useQuery({
    queryKey: ['roles'],
    queryFn: ({ signal }) => fetchRolesView(signal),
  })

  return (
    <QueryBoundary query={query} skeleton={<RolesSkeleton />}>
      {(view) => (
        <div className="space-y-6">
          <PageHeader
            title="Roles"
            description="Proximity is directional: it shows how your evidence lines up with a role profile, not whether you will be hired."
            action={
              view.enabledCount > 0 ? (
                <Badge variant="info">{view.enabledCount} targeted</Badge>
              ) : (
                <Badge variant="muted">Exploring</Badge>
              )
            }
          />

          {view.enabledCount === 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">No target role selected</CardTitle>
                <CardDescription>
                  That is a valid choice — the planner falls back to broadly useful foundations.
                  Targeting a role sharpens what gets prioritised.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          {view.overlap.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Layers className="h-4 w-4 text-muted-foreground" aria-hidden />
                  Shared across your targets
                </CardTitle>
                <CardDescription>
                  These skills move several roles at once — the cheapest way to widen your options.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {view.overlap.slice(0, 10).map((item) => (
                  <Badge key={item.skill_id} variant="outline">
                    {view.skillNames[item.skill_id] ?? item.skill_id} · {item.roles.length} roles
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <RoleGrid roles={view.roles} skillNames={view.skillNames} />
        </div>
      )}
    </QueryBoundary>
  )
}
