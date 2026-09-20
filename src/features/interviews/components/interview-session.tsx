import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from '@/hooks/use-navigation'
import { CheckCircle2, Eye, Loader2, RotateCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import type { InterviewQuestionRow, ProjectRow } from '@/types/database.types'
import { SESSION_TYPES, type SessionType } from '../validators'
import { recordInterviewSession } from '../api'
import { generateProjectQuestions } from '../lib/project-questions'

const TYPE_LABELS: Record<SessionType, string> = {
  dsa: 'DSA', ml: 'Machine learning', dl: 'Deep learning', llm: 'LLMs', rag: 'RAG',
  python: 'Python', sql: 'SQL', dbms: 'DBMS', os: 'Operating systems',
  networks: 'Networks', 'system-design': 'System design', project: 'Your project',
  behavioral: 'Behavioural',
}

type Rating = 'poor' | 'ok' | 'good'

interface Card_ {
  question: string
  answer: string | null
}

interface InterviewSessionProps {
  questionsByCategory: Record<string, InterviewQuestionRow[]>
  projects: ProjectRow[]
}

/**
 * Self-graded flashcards. "Good" counts as correct — that is the metric fed
 * to role readiness (career/07 handoff note).
 */
export function InterviewSession({ questionsByCategory, projects }: InterviewSessionProps) {
  const router = useRouter()
  const [sessionType, setSessionType] = useState<SessionType>('dsa')
  const [projectId, setProjectId] = useState<string>(projects[0]?.id ?? '')
  const [count, setCount] = useState('10')
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [isPending, startTransition] = useTransition()

  const selectedProject = projects.find((p) => p.id === projectId)

  const cards = useMemo<Card_[]>(() => {
    if (sessionType === 'project') {
      if (!selectedProject) return []
      return generateProjectQuestions({
        title: selectedProject.title,
        techStack: selectedProject.tech_stack,
        status: selectedProject.status,
      }).map((question) => ({ question, answer: null }))
    }

    const pool = questionsByCategory[sessionType] ?? []
    // Deterministic rotation rather than Math.random: a reload gives the same
    // set instead of silently reshuffling mid-session.
    const wanted = Math.min(Number(count), pool.length)
    const offset = new Date().getUTCDate() % Math.max(1, pool.length)
    return Array.from({ length: wanted }, (_, i) => {
      const item = pool[(offset + i) % pool.length]
      return { question: item.question, answer: item.expected_answer }
    })
  }, [sessionType, questionsByCategory, count, selectedProject])

  useEffect(() => {
    setRevealed(false)
  }, [index])

  function rate(rating: Rating) {
    const next = [...ratings, rating]
    setRatings(next)

    if (index + 1 < cards.length) {
      setIndex(index + 1)
      return
    }

    const correct = next.filter((r) => r === 'good').length
    startTransition(async () => {
      const result = await recordInterviewSession({
        session_type: sessionType,
        total_questions: cards.length,
        correct_answers: correct,
        project_id: sessionType === 'project' ? projectId : null,
      })
      if ('error' in result) {
        toast.error('Could not save session', result.error)
        return
      }
      toast.success('Session recorded', `${correct} of ${cards.length} rated "good".`)
      setIndex(index + 1)
      router.refresh()
    })
  }

  function reset() {
    setStarted(false)
    setIndex(0)
    setRatings([])
    setRevealed(false)
  }

  if (!started) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Start a session</CardTitle>
          <CardDescription>
            Answer out loud before revealing. Rate yourself honestly — the score feeds your role
            proximity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="session-type">Topic</Label>
              <Select value={sessionType} onValueChange={(v) => setSessionType(v as SessionType)}>
                <SelectTrigger id="session-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SESSION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {TYPE_LABELS[type]}
                      {type !== 'project'
                        ? ` (${questionsByCategory[type]?.length ?? 0})`
                        : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sessionType === 'project' ? (
              <div className="space-y-2">
                <Label htmlFor="session-project">Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger id="session-project">
                    <SelectValue placeholder="Pick a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="session-count">Questions</Label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger id="session-count">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['5', '10', '15', '20'].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {sessionType === 'project' && projects.length === 0 ? (
            <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              Create a project first — project questions are generated from its own details.
            </p>
          ) : null}

          <Button onClick={() => setStarted(true)} disabled={cards.length === 0}>
            Start ({cards.length} question{cards.length === 1 ? '' : 's'})
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (index >= cards.length) {
    const correct = ratings.filter((r) => r === 'good').length
    const score = Math.round((correct / cards.length) * 100)

    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" aria-hidden />
          <CardTitle>{score}% rated &quot;good&quot;</CardTitle>
          <CardDescription>
            {correct} of {cards.length} answered confidently.{' '}
            {score < 60
              ? 'Worth another pass at the weaker areas before an interview.'
              : 'Solid. Rotate to a different topic next.'}
          </CardDescription>
          <div className="mt-2 flex gap-2">
            <Button variant="outline" onClick={reset}>
              <RotateCw className="h-4 w-4" />
              New session
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const card = cards[index]

  return (
    <div className="space-y-4">
      <Progress value={(index / cards.length) * 100} aria-label="Session progress" />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="muted">
              {index + 1} of {cards.length}
            </Badge>
            <Badge variant="outline">{TYPE_LABELS[sessionType]}</Badge>
          </div>
          <CardTitle className="pt-2 text-lg">{card.question}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div
            className={cn(
              'min-h-[6rem] rounded-md border p-4 text-sm',
              revealed ? 'bg-muted/40' : 'flex items-center justify-center bg-muted/20'
            )}
          >
            {revealed ? (
              <p>
                {card.answer ??
                  'No model answer for this one — judge yourself on whether you could defend the answer to a sceptical interviewer.'}
              </p>
            ) : (
              <Button variant="outline" onClick={() => setRevealed(true)}>
                <Eye className="h-4 w-4" />
                Reveal
              </Button>
            )}
          </div>

          {revealed ? (
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ['poor', 'Poor', 'ghost'],
                  ['ok', 'OK', 'outline'],
                  ['good', 'Good', 'default'],
                ] as const
              ).map(([value, label, variant]) => (
                <Button
                  key={value}
                  variant={variant}
                  onClick={() => rate(value)}
                  disabled={isPending}
                >
                  {isPending && value === 'good' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {label}
                </Button>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
