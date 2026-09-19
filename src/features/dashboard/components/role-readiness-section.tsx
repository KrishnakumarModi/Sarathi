import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ReadinessBar } from '@/features/roles/components/readiness-bar'
import type { RoleWithReadiness } from '@/features/roles/lib/role-queries'

interface RoleReadinessSectionProps {
  roles: RoleWithReadiness[]
  skillNames: Record<string, string>
}

export function RoleReadinessSection({ roles, skillNames }: RoleReadinessSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Role proximity</CardTitle>
        <CardDescription>
          {roles.length === 0
            ? 'No target roles yet — pick one to see how your evidence lines up.'
            : 'How your evidence maps to each role profile. Directional, not a prediction.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {roles.length === 0 ? (
          <Link
            to="/roles"
            className="block rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground"
          >
            Choose target roles
          </Link>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="space-y-1.5">
              <ReadinessBar
                name={role.name}
                label={role.readiness.label}
                score={role.readiness.score}
              />
              {role.readiness.criticalGaps.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Critical gap:{' '}
                  {role.readiness.criticalGaps
                    .slice(0, 2)
                    .map((gap) => skillNames[gap.skill_id] ?? gap.skill_id)
                    .join(', ')}
                </p>
              ) : role.readiness.nextAction ? (
                <p className="text-xs text-muted-foreground">{role.readiness.nextAction}</p>
              ) : null}
              {role.isPrimary ? <Badge variant="muted">Primary target</Badge> : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
