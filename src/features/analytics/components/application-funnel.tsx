import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { percent } from '@/lib/utils'
import type { FunnelStats } from '@/features/jobs/lib/match-calculator'

const STAGES = [
  { key: 'discovered', label: 'Discovered' },
  { key: 'saved', label: 'Saved' },
  { key: 'applied', label: 'Applied' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
] as const

export function ApplicationFunnel({ funnel }: { funnel: FunnelStats }) {
  const widest = Math.max(1, ...STAGES.map((stage) => funnel.byStatus[stage.key] ?? 0))

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Application funnel</CardTitle>
        <CardDescription>
          {funnel.applied > 0
            ? `${Math.round(funnel.callbackRate)}% callback rate across ${funnel.applied} applications.`
            : 'No applications sent yet.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {funnel.total === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Track a role to see the pipeline.
          </p>
        ) : (
          STAGES.map((stage) => {
            const count = funnel.byStatus[stage.key] ?? 0
            return (
              <div key={stage.key} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-muted-foreground">{stage.label}</span>
                <Progress
                  value={percent(count, widest)}
                  className="h-2 flex-1"
                  aria-label={`${stage.label}: ${count}`}
                />
                <span className="w-8 shrink-0 text-right tabular-nums">{count}</span>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
