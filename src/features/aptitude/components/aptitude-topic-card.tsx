import { Minus, Play, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { daysBetween, progressColor, toDateString } from '@/lib/utils'
import type { TopicWithStats } from '../lib/aptitude-queries'
import { PracticeSessionForm } from './practice-session-form'

function lastPracticedLabel(date: string | null): string {
  if (!date) return 'Not practised yet'
  const days = daysBetween(date, toDateString())
  if (days <= 0) return 'Practised today'
  if (days === 1) return 'Practised yesterday'
  return `Practised ${days} days ago`
}

export function AptitudeTopicCard({ topic }: { topic: TopicWithStats }) {
  const TrendIcon =
    topic.trend === 'improving' ? TrendingUp : topic.trend === 'declining' ? TrendingDown : Minus

  return (
    <article className="content-auto space-y-3 rounded-md border p-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium">{topic.name}</h3>
        <Badge variant="outline">Difficulty {topic.difficulty}</Badge>
      </div>

      {topic.accuracy === null ? (
        <p className="text-xs text-muted-foreground">Not practised yet</p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {Math.round(topic.accuracy)}% accuracy · {topic.questionsPracticed} questions
            </span>
            {topic.trend ? (
              <span className="flex items-center gap-1 text-muted-foreground">
                <TrendIcon className="h-3 w-3" aria-hidden />
                {topic.trend}
              </span>
            ) : null}
          </div>
          <Progress
            value={topic.accuracy}
            indicatorClassName={progressColor(topic.accuracy)}
            aria-label={`${topic.name} accuracy`}
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {lastPracticedLabel(topic.lastPracticed)}
          {topic.speed !== null ? ` · ${topic.speed.toFixed(1)} q/min` : ''}
        </span>
        <PracticeSessionForm
          topicId={topic.id}
          topicName={topic.name}
          trigger={
            <Button size="sm" variant="outline">
              <Play className="h-3.5 w-3.5" />
              Practise
            </Button>
          }
        />
      </div>

      {topic.recentSessions.length > 0 ? (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Last {topic.recentSessions.length} session
            {topic.recentSessions.length === 1 ? '' : 's'}
          </summary>
          <ul className="mt-2 space-y-1">
            {topic.recentSessions.map((session, index) => (
              <li key={index} className="flex justify-between text-muted-foreground">
                <span>{session.session_date}</span>
                <span className="tabular-nums">
                  {session.questions_correct}/{session.questions_attempted} ·{' '}
                  {Math.round(
                    (session.questions_correct / Math.max(1, session.questions_attempted)) * 100
                  )}
                  %
                </span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </article>
  )
}
