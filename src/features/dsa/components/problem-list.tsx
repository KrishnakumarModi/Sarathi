import { useMemo, useState } from 'react'
import { ExternalLink, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatMinutes } from '@/lib/utils'
import type { ProblemWithStatus } from '../lib/dsa-queries'
import { isSolvedStatus } from '../lib/dsa-calculations'
import { AttemptForm } from './attempt-form'
import { DifficultyPill, ProblemStatusBadge } from './status-badge'

const ALL = 'all'

export function ProblemList({ problems }: { problems: ProblemWithStatus[] }) {
  const [difficulty, setDifficulty] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const [week, setWeek] = useState(ALL)

  const filtered = useMemo(
    () =>
      problems.filter((problem) => {
        if (difficulty !== ALL && problem.difficulty !== difficulty) return false
        if (week !== ALL && String(problem.week_recommended ?? '') !== week) return false
        if (status === 'solved' && !isSolvedStatus(problem.status)) return false
        if (status === 'unsolved' && isSolvedStatus(problem.status)) return false
        if (status === 'mastered' && problem.status !== 'mastered') return false
        return true
      }),
    [problems, difficulty, status, week]
  )

  const weeks = [...new Set(problems.map((p) => p.week_recommended).filter(Boolean))].sort(
    (a, b) => (a as number) - (b as number)
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-36 space-y-1.5">
          <Label htmlFor="filter-difficulty">Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger id="filter-difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-40 space-y-1.5">
          <Label htmlFor="filter-status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="filter-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All</SelectItem>
              <SelectItem value="unsolved">Not solved</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
              <SelectItem value="mastered">Mastered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-32 space-y-1.5">
          <Label htmlFor="filter-week">Week</Label>
          <Select value={week} onValueChange={setWeek}>
            <SelectTrigger id="filter-week">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All</SelectItem>
              {weeks.map((w) => (
                <SelectItem key={w} value={String(w)}>
                  Week {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {problems.length} problems
        </p>
      </div>

      {/* Mobile: cards. Desktop: table. */}
      <div className="space-y-2 md:hidden">
        {filtered.map((problem) => (
          <div key={problem.id} className="content-auto space-y-2 rounded-md border p-3">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium">
                {problem.leetcode_number ? `${problem.leetcode_number}. ` : ''}
                {problem.title}
              </span>
              <DifficultyPill difficulty={problem.difficulty} />
            </div>
            <ProblemStatusBadge status={problem.status} />
            <div className="flex items-center gap-2">
              <AttemptForm
                problemId={problem.id}
                problemTitle={problem.title}
                trigger={
                  <Button size="sm" variant="outline" className="flex-1">
                    <Plus className="h-3.5 w-3.5" />
                    Log attempt
                  </Button>
                }
              />
              {problem.url ? (
                <Button size="sm" variant="ghost" asChild>
                  <a href={problem.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="sr-only">{`Open ${problem.title} on LeetCode`}</span>
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Problem</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Best time</TableHead>
              <TableHead>Week</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((problem) => (
              <TableRow key={problem.id}>
                <TableCell className="font-medium">
                  {problem.leetcode_number ? `${problem.leetcode_number}. ` : ''}
                  {problem.title}
                </TableCell>
                <TableCell>
                  <DifficultyPill difficulty={problem.difficulty} />
                </TableCell>
                <TableCell>
                  <ProblemStatusBadge status={problem.status} />
                </TableCell>
                <TableCell className="tabular-nums">{problem.attemptCount}</TableCell>
                <TableCell className="tabular-nums">
                  {problem.bestTimeMinutes ? formatMinutes(problem.bestTimeMinutes) : '—'}
                </TableCell>
                <TableCell className="tabular-nums">{problem.week_recommended ?? '—'}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <AttemptForm
                      problemId={problem.id}
                      problemTitle={problem.title}
                      trigger={
                        <Button size="sm" variant="outline">
                          <Plus className="h-3.5 w-3.5" />
                          Log
                        </Button>
                      }
                    />
                    {problem.url ? (
                      <Button size="sm" variant="ghost" asChild>
                        <a href={problem.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span className="sr-only">{`Open ${problem.title} on LeetCode`}</span>
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
