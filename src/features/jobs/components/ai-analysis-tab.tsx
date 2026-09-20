import { useState, useTransition } from 'react'
import { Bot, Loader2, Sparkles, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { aiAnalyzeJob, type AIAnalysisResponse } from '../api'

export function AIAnalysisTab({ jobId, company, role }: { jobId: string, company: string, role: string }) {
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState<AIAnalysisResponse | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAnalyze() {
    startTransition(async () => {
      const response = await aiAnalyzeJob(jobId)
      if ('error' in response) {
        toast.error('Could not analyse', response.error)
        return
      }
      if (response.data) {
        setResult(response.data)
      }
    })
  }

  // Fetch immediately if opened and no result yet
  function onOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (newOpen && !result && !isPending) {
      handleAnalyze()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Sparkles className="mr-2 h-4 w-4 text-primary" />
          AI Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Job Analysis</DialogTitle>
          <DialogDescription>
            {company} - {role}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isPending && !result ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing job description with Gemini...</p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {result.is_fallback && (
                <div className="flex items-center gap-2 rounded-md bg-amber-500/15 p-3 text-sm text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>AI service is currently unavailable. Displaying basic keyword matching results.</span>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Match Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{result.semantic_match_percentage}%</div>
                    <Progress value={result.semantic_match_percentage} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">JD Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{result.quality_score}/100</div>
                    <Progress value={result.quality_score} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Extracted Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {result.extracted_skills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {result.red_flags.length > 0 && (
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-destructive">Red Flags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-inside list-disc space-y-1 text-sm text-destructive">
                      {result.red_flags.map((flag, i) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {result.resume_tips.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Resume Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      {result.resume_tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
             <div className="text-center text-sm text-muted-foreground">
               Something went wrong loading the analysis.
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
