import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { Weakness } from '@/features/analytics/lib/analytics-calculations'
import { progressColor } from '@/lib/utils'

interface FocusAreasProps {
  weaknesses: Weakness[]
  skillNames: Record<string, string>
}

export function FocusAreas({ weaknesses, skillNames }: FocusAreasProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Where the leverage is</CardTitle>
        <CardDescription>
          Weighted by how much your target roles care, not just by what is lowest.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {weaknesses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing stands out yet.{' '}
            <Link to="/roles" className="text-primary hover:underline">
              Target a role
            </Link>{' '}
            to sharpen this.
          </p>
        ) : (
          weaknesses.slice(0, 3).map((weakness) => (
            <div key={weakness.skill_id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium">
                  {skillNames[weakness.skill_id] ?? weakness.skill_id}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {Math.round(weakness.mastery_score)}%
                </span>
              </div>
              <Progress
                value={weakness.mastery_score}
                indicatorClassName={progressColor(weakness.mastery_score)}
                className="h-1.5"
                aria-label={`${skillNames[weakness.skill_id] ?? weakness.skill_id} mastery`}
              />
              <p className="text-xs text-muted-foreground">{weakness.reason}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
