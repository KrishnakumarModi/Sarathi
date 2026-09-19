import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DomainIcon } from '@/components/shared/domain-icon'
import { Progress } from '@/components/ui/progress'
import { cn, progressColor } from '@/lib/utils'
import type { DomainSummary } from '../types'

export function DomainCard({ domain }: { domain: DomainSummary }) {
  return (
    <Link
      to={`/curriculum/${domain.id}`}
      id={`domain-${domain.id}`}
      className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full transition-colors duration-200 hover:border-primary/40">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <DomainIcon name={domain.icon} className={cn('mt-0.5 h-5 w-5', domain.color ?? 'text-primary')} />
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate">{domain.name}</CardTitle>
              {domain.description ? (
                <CardDescription className="mt-1 line-clamp-2">{domain.description}</CardDescription>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {domain.completedUnits} of {domain.unitCount} units complete
            </span>
            <span className="font-medium tabular-nums text-foreground">{domain.averageMastery}%</span>
          </div>
          <Progress
            value={domain.averageMastery}
            indicatorClassName={progressColor(domain.averageMastery)}
            aria-label={`${domain.name} mastery`}
          />
          {domain.startedUnits > domain.completedUnits ? (
            <p className="text-xs text-muted-foreground">
              {domain.startedUnits - domain.completedUnits} in progress
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}

export function DomainGrid({ domains }: { domains: DomainSummary[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {domains.map((domain) => (
        <DomainCard key={domain.id} domain={domain} />
      ))}
    </div>
  )
}
