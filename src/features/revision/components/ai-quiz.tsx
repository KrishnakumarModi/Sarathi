import { useState, useTransition } from 'react'
import { Bot, CheckCircle2, ChevronRight, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import type { DueRevision } from '../lib/revision-queries'
import { createAIQuiz, submitAIQuiz, type Quiz, type AnswerSubmission } from '../api'

interface AIQuizProps {
  item: DueRevision
  onComplete: () => void
  onCancel: () => void
}

export function AIQuiz({ item, onComplete, onCancel }: AIQuizProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isGenerating, startGeneration] = useTransition()

  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const [isSubmitting, startSubmit] = useTransition()
  const [evaluation, setEvaluation] = useState<any | null>(null)

  function handleGenerateQuiz() {
    startGeneration(async () => {
      const result = await createAIQuiz(item.id)
      if ('error' in result) {
        toast.error('Failed to generate quiz', result.error)
        return
      }
      if (result?.data) {
        setQuiz(result.data)
      }
    })
  }

  function handleNext() {
    if (!quiz) return
    if (currentStep < quiz.questions.length - 1) {
      setCurrentStep(s => s + 1)
    } else {
      submitQuiz()
    }
  }

  function submitQuiz() {
    if (!quiz) return
    startSubmit(async () => {
      const submission: AnswerSubmission[] = quiz.questions.map(q => ({
        question_id: q.id,
        user_response: answers[q.id] || ''
      }))
      const result = await submitAIQuiz(quiz.id, submission)
      if ('error' in result) {
        toast.error('Failed to submit quiz', result.error)
        return
      }
      setEvaluation(result.data)
    })
  }

  // ── State 1: Idle — show prompt to generate quiz ──────────────────────────
  if (!quiz && !isGenerating) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1">
                Due for revision
              </div>
              <CardTitle>{item.unitName}</CardTitle>
              {item.domainName && (
                <CardDescription className="mt-1">{item.domainName}</CardDescription>
              )}
            </div>
            <Badge variant="warning" className="shrink-0">
              {item.daysOverdue > 0 ? `${item.daysOverdue}d overdue` : 'Due today'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {item.unitDescription && (
            <p className="text-sm text-muted-foreground">{item.unitDescription}</p>
          )}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Bot className="h-4 w-4 text-primary" />
              AI-Powered Quiz
            </div>
            <p className="text-xs text-muted-foreground">
              Gemini will generate 2 multiple-choice and 1 short-answer question 
              tailored to your repetition count ({item.repetitionCount} reviews so far).
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-between border-t p-4">
          <Button variant="ghost" onClick={onCancel}>Skip for now</Button>
          <Button onClick={handleGenerateQuiz} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate AI Quiz
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // ── State 2: Generating ───────────────────────────────────────────────────
  if (isGenerating) {
    return (
      <Card className="mx-auto w-full max-w-2xl text-center p-12">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <h3 className="mt-4 text-lg font-medium">Generating AI Quiz...</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Tailoring questions for <strong>{item.unitName}</strong>
        </p>
      </Card>
    )
  }

  // ── State 3: Evaluation result ────────────────────────────────────────────
  if (evaluation) {
    const confidenceColors: Record<number, string> = {
      0: 'text-destructive', 1: 'text-destructive', 2: 'text-orange-500',
      3: 'text-yellow-500', 4: 'text-emerald-500', 5: 'text-emerald-500',
    }
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Quiz Complete — {item.unitName}
          </CardTitle>
          <CardDescription className="space-y-1">
            <span className="block">
              Score: <strong>{evaluation.total_score.toFixed(1)}</strong> / {quiz?.questions.length} &nbsp;·&nbsp;
              Confidence: <span className={confidenceColors[evaluation.calculated_confidence] || ''}><strong>{evaluation.calculated_confidence}/5</strong></span>
            </span>
            {evaluation.next_review_date && (
              <span className="block text-xs">
                Next review scheduled: {new Date(evaluation.next_review_date).toLocaleDateString()}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
          {evaluation.evaluations.map((ev: any, idx: number) => {
            const q = quiz?.questions.find(q => q.id === ev.question_id)
            return (
              <div key={ev.question_id} className="rounded-md border p-4 space-y-2">
                <p className="font-medium text-sm">Q{idx + 1}: {q?.content}</p>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Your answer:</span> {answers[ev.question_id] || '(blank)'}</p>
                  <p className={ev.is_correct ? 'text-emerald-500 font-medium' : 'text-destructive font-medium'}>
                    {ev.is_correct ? '✓ Correct' : '✗ Incorrect'} ({ev.score_awarded.toFixed(1)} pts)
                  </p>
                  {ev.ai_explanation && (
                    <div className="mt-2 bg-muted p-3 rounded text-xs text-muted-foreground leading-relaxed">
                      {ev.ai_explanation}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t p-4">
          <Button onClick={onComplete}>Next Review →</Button>
        </CardFooter>
      </Card>
    )
  }

  // ── State 4: Answering questions ──────────────────────────────────────────
  if (!quiz) return null

  const question = quiz.questions[currentStep]
  const isLast = currentStep === quiz.questions.length - 1
  const currentAnswer = answers[question.id] || ''

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            Question {currentStep + 1} of {quiz.questions.length}
          </span>
          <Badge variant="muted">{question.question_type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}</Badge>
        </div>
        <CardTitle className="text-base">{item.unitName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base font-medium leading-relaxed">{question.content}</p>

        {question.question_type === 'mcq' && question.options ? (
          <RadioGroup
            value={currentAnswer}
            onValueChange={(val: string) => setAnswers(prev => ({ ...prev, [question.id]: val }))}
            className="space-y-2"
          >
            {Object.entries(question.options).map(([key, val]) => (
              <div
                key={key}
                className="flex items-center space-x-3 border rounded-md p-3 hover:bg-muted/50 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors"
              >
                <RadioGroupItem value={key} id={`q-${question.id}-${key}`} />
                <Label htmlFor={`q-${question.id}-${key}`} className="flex-1 cursor-pointer font-normal">
                  <span className="font-medium">{key}.</span> {val}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <Textarea
            value={currentAnswer}
            onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
            placeholder="Type your answer here..."
            rows={5}
            className="resize-none"
          />
        )}
      </CardContent>
      <CardFooter className="justify-between border-t p-4">
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Skip
        </Button>
        <Button onClick={handleNext} disabled={!currentAnswer || isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {isLast ? 'Submit Quiz' : 'Next Question'}
          {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
        </Button>
      </CardFooter>
    </Card>
  )
}
