import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { useTimerStore } from '@/stores/use-timer-store'
import { recordAptitudeAttempt } from '../api'
import { SessionTimer } from './session-timer'

type Step = 'setup' | 'timer' | 'log'

interface PracticeSessionFormProps {
  topicId: string
  topicName: string
  trigger: React.ReactNode
}

export function PracticeSessionForm({ topicId, topicName, trigger }: PracticeSessionFormProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('setup')
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const [questionCount, setQuestionCount] = useState('10')
  const [secondsPerQuestion, setSecondsPerQuestion] = useState('60')
  const [useTimer, setUseTimer] = useState(true)
  const [attempted, setAttempted] = useState('10')
  const [correct, setCorrect] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [notes, setNotes] = useState('')

  const startTimer = useTimerStore((state) => state.startTimer)
  const resetTimer = useTimerStore((state) => state.reset)

  function reset() {
    setStep('setup')
    setCorrect('')
    setNotes('')
    setElapsed(0)
    resetTimer()
  }

  function handleStart() {
    const count = Number(questionCount)
    setAttempted(String(count))
    if (useTimer) {
      startTimer(topicId, count, secondsPerQuestion === 'none' ? null : Number(secondsPerQuestion))
      setStep('timer')
    } else {
      setStep('log')
    }
  }

  function handleSave() {
    setErrors({})
    startTransition(async () => {
      const result = await recordAptitudeAttempt({
        topic_id: topicId,
        questions_attempted: Number(attempted),
        questions_correct: Number(correct || 0),
        time_seconds: elapsed,
        is_timed: useTimer,
        notes: notes || undefined,
      })

      if ('error' in result) {
        if (result.fieldErrors) setErrors(result.fieldErrors)
        toast.error('Could not save session', result.error)
        return
      }

      toast.success('Session saved', `${Math.round(result.data?.accuracy ?? 0)}% accuracy`)
      setOpen(false)
      reset()
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 'log' ? 'Log session' : 'Practice'}: {topicName}
          </DialogTitle>
          <DialogDescription>
            {step === 'setup'
              ? 'Practise on GFG, IndiaBIX, or anywhere you like — then log the result here.'
              : step === 'timer'
                ? 'Timer running. Stop when you are done.'
                : 'How did it go?'}
          </DialogDescription>
        </DialogHeader>

        {step === 'setup' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="practice-count">How many questions?</Label>
              <Input
                id="practice-count"
                type="number"
                min={1}
                max={200}
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="practice-seconds">Time per question</Label>
              <Select value={secondsPerQuestion} onValueChange={setSecondsPerQuestion}>
                <SelectTrigger id="practice-seconds">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">60 seconds</SelectItem>
                  <SelectItem value="90">90 seconds</SelectItem>
                  <SelectItem value="none">No limit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label htmlFor="practice-use-timer" className="flex items-center gap-2 text-sm">
              <Checkbox
                id="practice-use-timer"
                checked={useTimer}
                onCheckedChange={(checked) => setUseTimer(checked === true)}
              />
              Use the timer while I practise
            </label>
          </div>
        ) : null}

        {step === 'timer' ? (
          <SessionTimer
            onStop={(seconds) => {
              setElapsed(seconds)
              setStep('log')
            }}
          />
        ) : null}

        {step === 'log' ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="log-attempted">Questions attempted</Label>
                <Input
                  id="log-attempted"
                  type="number"
                  min={1}
                  max={200}
                  value={attempted}
                  onChange={(e) => setAttempted(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="log-correct">Questions correct</Label>
                <Input
                  id="log-correct"
                  type="number"
                  min={0}
                  value={correct}
                  onChange={(e) => setCorrect(e.target.value)}
                />
                {errors.questions_correct ? (
                  <p className="text-xs text-destructive">{errors.questions_correct[0]}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="log-time">Time taken (seconds)</Label>
              <Input
                id="log-time"
                type="number"
                min={0}
                value={elapsed}
                onChange={(e) => setElapsed(Number(e.target.value))}
              />
              {useTimer ? (
                <p className="text-xs text-muted-foreground">Filled in from the timer.</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="log-notes">Notes</Label>
              <Textarea
                id="log-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Struggled with pipes and cisterns..."
              />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          {step === 'setup' ? (
            <Button onClick={handleStart}>{useTimer ? 'Start timer' : 'Log results'}</Button>
          ) : null}
          {step === 'log' ? (
            <Button onClick={handleSave} disabled={isPending || correct === ''}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save session
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
