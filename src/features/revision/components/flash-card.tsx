import { useEffect, useState, useTransition } from 'react'
import { Eye, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import type { DueRevision } from '../lib/revision-queries'
import { recordReview } from '../api'

const CONFIDENCE_OPTIONS = [
  { value: 0, label: 'Blank', hint: 'No recall at all' },
  { value: 1, label: 'Barely', hint: 'Recognised it only' },
  { value: 2, label: 'Shaky', hint: 'Partial, with gaps' },
  { value: 3, label: 'Okay', hint: 'Got the gist' },
  { value: 4, label: 'Solid', hint: 'Recalled it cleanly' },
  { value: 5, label: 'Instant', hint: 'No hesitation' },
]

interface FlashCardProps {
  item: DueRevision
  index: number
  total: number
  onComplete: () => void
}

/**
 * One review. Keys 0-5 set confidence and space flips the card, so a whole
 * session can be done from the keyboard.
 */
export function FlashCard({ item, index, total, onComplete }: FlashCardProps) {
  const [revealed, setRevealed] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setRevealed(false)
  }, [item.unitId])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return

      if (event.code === 'Space') {
        event.preventDefault()
        setRevealed((current) => !current)
        return
      }
      if (!revealed || isPending) return
      const digit = Number(event.key)
      if (Number.isInteger(digit) && digit >= 0 && digit <= 5) {
        event.preventDefault()
        submit(digit)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, isPending, item.unitId])

  function submit(confidence: number) {
    startTransition(async () => {
      const result = await recordReview({ unit_id: item.unitId, confidence })
      if ('error' in result) {
        toast.error('Could not save your review', result.error)
        return
      }
      toast.success(
        result.data?.passed ? 'Scheduled' : 'Back tomorrow',
        `Next review in ${result.data?.intervalDays} day${result.data?.intervalDays === 1 ? '' : 's'}.`
      )
      onComplete()
    })
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted">
            {index + 1} of {total}
          </Badge>
          {item.domainName ? <Badge variant="outline">{item.domainName}</Badge> : null}
          {item.daysOverdue > 0 ? (
            <Badge variant="warning">{item.daysOverdue}d overdue</Badge>
          ) : null}
          <Badge variant="info">Review {item.repetitionCount + 1}</Badge>
        </div>
        <CardTitle className="pt-2 text-xl">{item.unitName}</CardTitle>
        <CardDescription>
          Recall what you can before revealing. Rate honestly — a low score just brings it back
          sooner.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          className={cn(
            'min-h-[8rem] rounded-md border p-4 text-sm transition-colors',
            revealed ? 'bg-muted/40' : 'flex items-center justify-center bg-muted/20'
          )}
        >
          {revealed ? (
            <p>{item.unitDescription ?? item.unitName}</p>
          ) : (
            <Button variant="outline" onClick={() => setRevealed(true)}>
              <Eye className="h-4 w-4" />
              Reveal (space)
            </Button>
          )}
        </div>

        {revealed ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              How well did you recall it? Press 0-5 or choose below.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CONFIDENCE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={option.value >= 3 ? 'outline' : 'ghost'}
                  className="h-auto flex-col items-start gap-0.5 py-2"
                  onClick={() => submit(option.value)}
                  disabled={isPending}
                  aria-label={`${option.label}: ${option.hint}`}
                >
                  <span className="text-sm font-medium">
                    {option.value} · {option.label}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">{option.hint}</span>
                </Button>
              ))}
            </div>
            {isPending ? (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
