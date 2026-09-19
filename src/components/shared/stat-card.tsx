import type { LucideIcon } from 'lucide-react'
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendDirection?: 'up' | 'down' | 'neutral'
  hint?: string
}

export function StatCard({ label, value, icon: Icon, trend, trendDirection = 'neutral', hint }: StatCardProps) {
  const TrendIcon = trendDirection === 'up' ? ArrowUp : trendDirection === 'down' ? ArrowDown : ArrowRight

  return (
    <Card className="overflow-hidden">
      <CardContent className="relative p-4">
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/5" />
        <div className="relative flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-lg bg-primary/10 p-1.5 text-primary"><Icon className="h-3.5 w-3.5" aria-hidden /></span>
          <span>{label}</span>
        </div>
        <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
        {trend ? (
          <div
            className={cn(
              'mt-1 flex items-center gap-1 text-xs',
              trendDirection === 'up' && 'text-emerald-600 dark:text-emerald-400',
              trendDirection === 'down' && 'text-destructive',
              trendDirection === 'neutral' && 'text-muted-foreground'
            )}
          >
            <TrendIcon className="h-3 w-3" aria-hidden />
            <span>{trend}</span>
          </div>
        ) : null}
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}
