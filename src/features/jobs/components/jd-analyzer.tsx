import { useState, useTransition } from 'react'
import { Loader2, ScanSearch } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { cn, progressColor } from '@/lib/utils'
import type { MatchResult } from '../lib/match-calculator'
import { analyzeJobDescription } from '../api'

type Analysis = MatchResult & { skillNames: Record<string, string> }

const RECOMMENDATION_STYLES = {
  'Apply Now': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  'Apply After Improving': 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  'Low ROI': 'bg-muted text-muted-foreground',
} as const

export function JdAnalyzer() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [result, setResult] = useState<Analysis | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAnalyze() {
    startTransition(async () => {
      const response = await analyzeJobDescription({ jd_text: text })
      if ('error' in response) {
        toast.error('Could not analyse', response.error)
        return
      }
      setResult(response.data ?? null)
    })
  }

  const name = (id: string) => result?.skillNames[id] ?? id

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ScanSearch className="h-4 w-4" />
          Analyse a JD
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Job description analyser</DialogTitle>
          <DialogDescription>
            Matches the posting against your demonstrated skills. Runs locally with a fixed
            dictionary — no AI service, no cost.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jd-text">Paste the job description</Label>
            <Textarea
              id="jd-text"
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="We are looking for an Applied AI Engineer with experience in Python, FastAPI, RAG..."
            />
          </div>

          <Button onClick={handleAnalyze} disabled={isPending || text.trim().length < 20}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Analyse
          </Button>

          {result ? (
            result.noSkillsDetected ? (
              <Card>
                <CardContent className="p-4 text-sm text-muted-foreground">
                  No known skills were recognised in that text. Either the posting is unusually
                  vague, or it uses terms outside the skill dictionary — the match percentage
                  would be meaningless, so none is shown.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">
                      {result.matchPercent.toFixed(0)}% match
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={cn('border-transparent', RECOMMENDATION_STYLES[result.recommendation])}
                    >
                      {result.recommendation}
                    </Badge>
                  </div>
                  <CardDescription>
                    {result.foundSkills.length} skills detected
                    {result.yearsRequired !== null
                      ? ` · asks for ${result.yearsRequired}+ years`
                      : ''}
                    {result.fresherFriendly ? ' · looks fresher friendly' : ''}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Progress
                    value={result.matchPercent}
                    indicatorClassName={progressColor(result.matchPercent)}
                    aria-label="Match percentage"
                  />

                  <div className="grid gap-3 sm:grid-cols-3">
                    {(
                      [
                        ['Strong', result.strongSkills, 'success'],
                        ['Partial', result.weakSkills, 'warning'],
                        ['Missing', result.missingSkills, 'muted'],
                      ] as const
                    ).map(([label, skills, variant]) => (
                      <div key={label} className="space-y-1.5">
                        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {label} ({skills.length})
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {skills.length === 0 ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            skills.map((id) => (
                              <Badge key={id} variant={variant}>
                                {name(id)}
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {result.studyPriorities.length > 0 ? (
                    <div className="rounded-md bg-muted p-3">
                      <h4 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Study these first
                      </h4>
                      <ol className="space-y-0.5 text-sm">
                        {result.studyPriorities.map((id, index) => (
                          <li key={id}>
                            {index + 1}. {name(id)}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
