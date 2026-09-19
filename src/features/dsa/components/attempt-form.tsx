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
import type { MistakeCategory } from '@/types/database.types'
import { recordAttempt } from '../api'

const MISTAKE_OPTIONS: Array<{ value: MistakeCategory; label: string }> = [
  { value: 'none', label: 'No mistake' },
  { value: 'logic', label: 'Logic error' },
  { value: 'edge-case', label: 'Missed edge case' },
  { value: 'timeout', label: 'Too slow / TLE' },
  { value: 'wrong-pattern', label: 'Wrong pattern' },
  { value: 'syntax', label: 'Syntax / language' },
]

interface AttemptFormProps {
  problemId: string
  problemTitle: string
  trigger: React.ReactNode
}

export function AttemptForm({ problemId, problemTitle, trigger }: AttemptFormProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const [solved, setSolved] = useState(true)
  const [independent, setIndependent] = useState(true)
  const [hintUsed, setHintUsed] = useState(false)
  const [editorialUsed, setEditorialUsed] = useState(false)
  const [timeMinutes, setTimeMinutes] = useState('25')
  const [confidence, setConfidence] = useState('3')
  const [mistake, setMistake] = useState<MistakeCategory>('none')
  const [approach, setApproach] = useState('')
  const [notes, setNotes] = useState('')
  const [needsRevision, setNeedsRevision] = useState(false)

  function handleSubmit() {
    setErrors({})
    startTransition(async () => {
      const result = await recordAttempt({
        problem_id: problemId,
        solved,
        solved_independently: solved && independent,
        hint_used: hintUsed,
        editorial_used: editorialUsed,
        time_minutes: Number(timeMinutes),
        confidence: Number(confidence),
        approach: approach || undefined,
        mistake_category: mistake,
        notes: notes || undefined,
        needs_revision: needsRevision,
      })

      if ('error' in result) {
        if (result.fieldErrors) setErrors(result.fieldErrors)
        toast.error('Could not save attempt', result.error)
        return
      }

      toast.success('Attempt logged', problemTitle)
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log attempt</DialogTitle>
          <DialogDescription>{problemTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-sm font-medium">Outcome</span>
            <div className="space-y-2">
              {[
                { id: 'solved', label: 'I solved it', checked: solved, set: setSolved },
                {
                  id: 'independent',
                  label: 'Without looking anything up',
                  checked: independent,
                  set: setIndependent,
                  disabled: !solved,
                },
                { id: 'hint', label: 'I used a hint', checked: hintUsed, set: setHintUsed },
                {
                  id: 'editorial',
                  label: 'I read the editorial',
                  checked: editorialUsed,
                  set: setEditorialUsed,
                },
              ].map((option) => (
                <label key={option.id} htmlFor={`attempt-${option.id}`} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    id={`attempt-${option.id}`}
                    checked={option.checked}
                    disabled={option.disabled}
                    onCheckedChange={(checked) => option.set(checked === true)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {errors.solved_independently ? (
              <p className="text-xs text-destructive">{errors.solved_independently[0]}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="attempt-time">Time spent (minutes)</Label>
              <Input
                id="attempt-time"
                type="number"
                min={1}
                max={600}
                value={timeMinutes}
                onChange={(e) => setTimeMinutes(e.target.value)}
              />
              {errors.time_minutes ? (
                <p className="text-xs text-destructive">{errors.time_minutes[0]}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="attempt-confidence">Confidence (1-5)</Label>
              <Select value={confidence} onValueChange={setConfidence}>
                <SelectTrigger id="attempt-confidence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['1', '2', '3', '4', '5'].map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attempt-mistake">What went wrong?</Label>
            <Select value={mistake} onValueChange={(value) => setMistake(value as MistakeCategory)}>
              <SelectTrigger id="attempt-mistake">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MISTAKE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attempt-approach">Approach (high level)</Label>
            <Textarea
              id="attempt-approach"
              value={approach}
              onChange={(e) => setApproach(e.target.value)}
              placeholder="Two pointers from both ends, shrink toward the middle..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attempt-notes">Notes</Label>
            <Textarea
              id="attempt-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <label htmlFor="attempt-revision" className="flex items-center gap-2 text-sm">
            <Checkbox
              id="attempt-revision"
              checked={needsRevision}
              onCheckedChange={(checked) => setNeedsRevision(checked === true)}
            />
            Flag for revision in 3 days
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save attempt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
