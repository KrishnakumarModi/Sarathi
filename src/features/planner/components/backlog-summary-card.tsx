import { Layers } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMinutes } from '@/lib/utils'
import type { BacklogSummary } from '../lib/backlog-manager'

/**
 * Backlog is shown with size, age, and load — and deliberately neutral
 * language. No shame framing (06_PRODUCT_ALIGNMENT_PLAN.md Phase 5).
 */
export function BacklogSummaryCard({ backlog }: { backlog: BacklogSummary }) {
  if (backlog.size === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4 text-muted-foreground" aria-hidden />
            Backlog
          </CardTitle>
          <CardDescription>Nothing carried over. Everything planned so far is accounted for.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="h-4 w-4 text-muted-foreground" aria-hidden />
          Backlog
        </CardTitle>
        <CardDescription>Work carried forward from earlier days.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4 text-sm">
        <div>
          <div className="text-2xl font-bold tabular-nums">{backlog.size}</div>
          <div className="text-xs text-muted-foreground">items</div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">{backlog.oldestAgeDays}d</div>
          <div className="text-xs text-muted-foreground">oldest</div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">
            {formatMinutes(backlog.totalMinutes)}
          </div>
          <div className="text-xs text-muted-foreground">to clear</div>
        </div>
        {backlog.agingCount > 0 ? (
          <div className="flex items-center">
            <Badge variant="warning">{backlog.agingCount} aging</Badge>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
