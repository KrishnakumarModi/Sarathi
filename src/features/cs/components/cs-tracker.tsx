import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDebounce } from '@/hooks/use-debounce'
import type { CsDomainRow, CsQuestionRow } from '@/types/database.types'
import {
  calculateDomainMastery,
  calculateInterviewRate,
  calculateTopicCoverage,
  type CSTopicWithMastery,
} from '../lib/cs-calculations'
import { CsTopicCard } from './cs-topic-card'
import { progressColor } from '@/lib/utils'

const ALL = 'all'

interface CsTrackerProps {
  domains: CsDomainRow[]
  topicsByDomain: Record<string, CSTopicWithMastery[]>
  questionsByTopic: Record<string, CsQuestionRow[]>
}

export function CsTracker({ domains, topicsByDomain, questionsByTopic }: CsTrackerProps) {
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState(ALL)
  const [importance, setImportance] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const debouncedSearch = useDebounce(search)

  const filterTopics = useMemo(
    () => (topics: CSTopicWithMastery[]) =>
      topics.filter((topic) => {
        if (debouncedSearch && !topic.name.toLowerCase().includes(debouncedSearch.toLowerCase())) {
          return false
        }
        if (difficulty === 'easy' && topic.difficulty > 1) return false
        if (difficulty === 'medium' && (topic.difficulty < 2 || topic.difficulty > 3)) return false
        if (difficulty === 'hard' && topic.difficulty < 4) return false
        if (importance !== ALL && topic.importance !== importance) return false

        const done = [
          topic.concept_understood,
          topic.questions_practiced,
          topic.quiz_passed,
          topic.interview_ready,
        ].filter(Boolean).length
        if (status === 'not-started' && done > 0) return false
        if (status === 'in-progress' && (done === 0 || done === 4)) return false
        if (status === 'complete' && done < 4) return false
        return true
      }),
    [debouncedSearch, difficulty, importance, status]
  )

  return (
    <Tabs defaultValue={domains[0]?.id}>
      <div className="overflow-x-auto pb-1">
        <TabsList>
          {domains.map((domain) => (
            <TabsTrigger key={domain.id} value={domain.id}>
              {domain.name.length > 20 ? domain.id.toUpperCase() : domain.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[10rem] flex-1 space-y-1.5">
          <Label htmlFor="cs-search">Search topics</Label>
          <Input
            id="cs-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ACID, paging, TCP..."
          />
        </div>
        <div className="w-36 space-y-1.5">
          <Label htmlFor="cs-difficulty">Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger id="cs-difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All</SelectItem>
              <SelectItem value="easy">1 · Easy</SelectItem>
              <SelectItem value="medium">2-3 · Medium</SelectItem>
              <SelectItem value="hard">4+ · Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-36 space-y-1.5">
          <Label htmlFor="cs-importance">Importance</Label>
          <Select value={importance} onValueChange={setImportance}>
            <SelectTrigger id="cs-importance">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-40 space-y-1.5">
          <Label htmlFor="cs-status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="cs-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All</SelectItem>
              <SelectItem value="not-started">Not started</SelectItem>
              <SelectItem value="in-progress">In progress</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {domains.map((domain) => {
        const topics = topicsByDomain[domain.id] ?? []
        const filtered = filterTopics(topics)
        const mastery = calculateDomainMastery(topics)
        const understood = topics.filter((t) => t.concept_understood).length
        const interviewReady = topics.filter((t) => t.interview_ready).length

        return (
          <TabsContent key={domain.id} value={domain.id} className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{domain.name}</CardTitle>
                <CardDescription>{domain.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xl font-bold tabular-nums">{topics.length}</div>
                    <div className="text-xs text-muted-foreground">topics</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold tabular-nums">
                      {understood}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{topics.length}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      understood ({Math.round(calculateTopicCoverage(topics))}%)
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-bold tabular-nums">
                      {interviewReady}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{topics.length}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      interview ready ({Math.round(calculateInterviewRate(topics))}%)
                    </div>
                  </div>
                </div>
                <Progress
                  value={mastery}
                  indicatorClassName={progressColor(mastery)}
                  aria-label={`${domain.name} mastery`}
                />
                <p className="text-xs text-muted-foreground">{Math.round(mastery)}% mastered</p>
              </CardContent>
            </Card>

            {filtered.length === 0 ? (
              <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                No topics match your filters.
              </p>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {filtered.map((topic) => (
                  <CsTopicCard
                    key={topic.id}
                    topic={topic}
                    questions={questionsByTopic[topic.id] ?? []}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
