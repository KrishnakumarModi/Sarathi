import { Badge } from '@/components/ui/badge'
import type { ProblemStatus } from '../lib/dsa-calculations'

const STATUS_CONFIG: Record<
  ProblemStatus,
  { label: string; variant: 'muted' | 'outline' | 'warning' | 'info' | 'success' | 'default' }
> = {
  'not-attempted': { label: 'Not attempted', variant: 'muted' },
  attempted: { label: 'Attempted', variant: 'outline' },
  'solved-assisted': { label: 'Solved with editorial', variant: 'warning' },
  'solved-hint': { label: 'Solved with hint', variant: 'info' },
  'solved-independent': { label: 'Solved independently', variant: 'success' },
  mastered: { label: 'Mastered', variant: 'default' },
}

export function ProblemStatusBadge({ status }: { status: ProblemStatus }) {
  const config = STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function DifficultyPill({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  const variant = difficulty === 'easy' ? 'success' : difficulty === 'medium' ? 'warning' : 'destructive'
  return (
    <Badge variant={variant} className="capitalize">
      {difficulty}
    </Badge>
  )
}
