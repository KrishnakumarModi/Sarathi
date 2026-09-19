import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { PatternWithProgress } from '../lib/dsa-queries'
import { progressColor } from '@/lib/utils'

export function PatternGrid({ patterns }: { patterns: PatternWithProgress[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {patterns.map((pattern) => (
        <Link
          key={pattern.id}
          to={`/dsa/${pattern.id}`}
          id={`pattern-${pattern.id}`}
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="h-full transition-colors duration-200 hover:border-primary/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{pattern.name}</CardTitle>
              <CardDescription className="line-clamp-2">{pattern.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {pattern.coverage.solved} of {pattern.coverage.total} solved
                </span>
                {pattern.coverage.mastered > 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {pattern.coverage.mastered} mastered
                  </span>
                ) : null}
              </div>
              <Progress
                value={pattern.coverage.coveragePercent}
                indicatorClassName={progressColor(pattern.coverage.coveragePercent)}
                aria-label={`${pattern.name} coverage`}
              />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
