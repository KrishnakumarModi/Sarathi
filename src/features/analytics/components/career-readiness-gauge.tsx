import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { CareerReadinessResult } from '../lib/analytics-calculations'
import { CAREER_READINESS_WEIGHTS } from '../lib/analytics-calculations'
import { progressColor } from '@/lib/utils'

const COMPONENT_LABELS: Record<keyof typeof CAREER_READINESS_WEIGHTS, string> = {
  technical_skills: 'Technical skills',
  projects: 'Projects',
  dsa: 'DSA',
  cs_fundamentals: 'CS fundamentals',
  interview: 'Interview practice',
  applications: 'Applications',
  aptitude: 'Aptitude',
}

export function CareerReadinessGauge({ result }: { result: CareerReadinessResult }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Career readiness</CardTitle>
        <CardDescription>
          A composite of everything tracked here. Useful for spotting an ignored area — it is not
          a prediction about hiring.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold tabular-nums">{Math.round(result.score)}</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
        <Progress
          value={result.score}
          indicatorClassName={progressColor(result.score)}
          aria-label="Career readiness"
        />

        <div className="space-y-2 border-t pt-3">
          {(Object.keys(CAREER_READINESS_WEIGHTS) as Array<keyof typeof CAREER_READINESS_WEIGHTS>).map(
            (key) => (
              <div key={key} className="flex items-center gap-3 text-sm">
                <span className="w-36 shrink-0 text-muted-foreground">{COMPONENT_LABELS[key]}</span>
                <Progress
                  value={result.components[key]}
                  className="h-1.5 flex-1"
                  indicatorClassName={progressColor(result.components[key])}
                  aria-label={COMPONENT_LABELS[key]}
                />
                <span className="w-24 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {result.contributions[key].toFixed(1)} of{' '}
                  {Math.round(CAREER_READINESS_WEIGHTS[key] * 100)}
                </span>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}
