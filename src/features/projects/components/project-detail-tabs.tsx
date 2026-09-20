import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import type { ProjectRow, ProjectTaskRow } from '@/types/database.types'
import { addProjectTask, toggleProjectTask, updateProject } from '../api'

interface ProjectFeature {
  name?: string
  detail?: string
}

interface ProjectQuestion {
  question?: string
  focus?: string
}

interface ProjectDetailTabsProps {
  project: ProjectRow
  tasks: ProjectTaskRow[]
}

/** The 13 prompts every portfolio project must survive (career/07). */
const PROJECT_INTERVIEW_PROMPTS = [
  'Explain this project in 60 seconds.',
  'Explain it again in 5 minutes, with the architecture.',
  'Draw the architecture. Why these components?',
  'What trade-offs did you make, and why?',
  'What failed, and what did you do about it?',
  'How would you scale this to 100x traffic?',
  'What is the latency profile, and where does the time go?',
  'What are the security considerations?',
  'What does this cost to run, and how would you halve it?',
  'How did you test it?',
  'How do you evaluate quality for this system?',
  'What would you change if you rebuilt it today?',
  'Who used it, and what did they say?',
]

export function ProjectDetailTabs({ project, tasks }: ProjectDetailTabsProps) {
  const [isPending, startTransition] = useTransition()
  const [newTask, setNewTask] = useState('')
  const [notes, setNotes] = useState({
    architecture_notes: project.architecture_notes ?? '',
    failure_modes: project.failure_modes ?? '',
    scaling_notes: project.scaling_notes ?? '',
    github_url: project.github_url ?? '',
    live_url: project.live_url ?? '',
  })

  const features = (project.features ?? []) as ProjectFeature[]
  const questions = (project.interview_questions ?? []) as ProjectQuestion[]
  const doneCount = tasks.filter((t) => t.is_completed).length

  function saveNotes() {
    startTransition(async () => {
      const result = await updateProject({ id: project.id, ...notes })
      if ('error' in result) {
        toast.error('Could not save', result.error)
        return
      }
      toast.success('Saved')
    })
  }

  function handleAddTask() {
    if (!newTask.trim()) return
    startTransition(async () => {
      const result = await addProjectTask({ project_id: project.id, title: newTask })
      if ('error' in result) {
        toast.error('Could not add task', result.error)
        return
      }
      setNewTask('')
    })
  }

  function handleToggleTask(taskId: string, isCompleted: boolean) {
    startTransition(async () => {
      const result = await toggleProjectTask({ task_id: taskId, is_completed: isCompleted })
      if ('error' in result) toast.error('Could not update task', result.error)
    })
  }

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tasks">Tasks ({doneCount}/{tasks.length})</TabsTrigger>
        <TabsTrigger value="evidence">Evidence</TabsTrigger>
        <TabsTrigger value="interview">Interview prep</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        {features.length > 0 ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Planned features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{feature.name}</span>
                    {feature.detail ? (
                      <span className="text-muted-foreground"> — {feature.detail}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notes</CardTitle>
            <CardDescription>
              The things an interviewer will ask about. Write them while you still remember.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project-github">GitHub URL</Label>
                <Input
                  id="project-github"
                  value={notes.github_url}
                  onChange={(e) => setNotes({ ...notes, github_url: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-live">Live URL</Label>
                <Input
                  id="project-live"
                  value={notes.live_url}
                  onChange={(e) => setNotes({ ...notes, live_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            {(
              [
                ['architecture_notes', 'Architecture', 'Components, data flow, and why.'],
                ['failure_modes', 'Failure modes', 'What breaks first, and how you would know.'],
                ['scaling_notes', 'Scaling', 'The first bottleneck at 100x, with numbers.'],
              ] as const
            ).map(([key, label, hint]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`project-${key}`}>{label}</Label>
                <Textarea
                  id={`project-${key}`}
                  rows={3}
                  value={notes[key]}
                  onChange={(e) => setNotes({ ...notes, [key]: e.target.value })}
                  placeholder={hint}
                />
              </div>
            ))}

            <Button onClick={saveNotes} disabled={isPending}>
              Save notes
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tasks" className="space-y-4">
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex gap-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTask()
                  }
                }}
                placeholder="Add a task"
                aria-label="New task title"
              />
              <Button onClick={handleAddTask} disabled={isPending || !newTask.trim()}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {tasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No tasks yet.</p>
            ) : (
              <ul className="space-y-1">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50">
                    <Checkbox
                      id={`ptask-${task.id}`}
                      checked={task.is_completed}
                      disabled={isPending}
                      onCheckedChange={(checked) => handleToggleTask(task.id, checked === true)}
                      aria-label={`Mark "${task.title}" ${task.is_completed ? 'incomplete' : 'complete'}`}
                    />
                    <label
                      htmlFor={`ptask-${task.id}`}
                      className={cn(
                        'cursor-pointer text-sm',
                        task.is_completed && 'text-muted-foreground line-through'
                      )}
                    >
                      {task.title}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="evidence" className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resume bullets</CardTitle>
            <CardDescription>
              Replace the placeholder numbers with your measured ones before using these.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {project.resume_bullets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No bullets yet. Templates come with a starting set.
              </p>
            ) : (
              <ul className="space-y-2">
                {project.resume_bullets.map((bullet, index) => (
                  <li key={index} className="rounded-md bg-muted p-3 text-sm">
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Known failure modes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {project.failure_modes ?? 'Not documented yet.'}
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="interview" className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">The thirteen questions</CardTitle>
            <CardDescription>
              If you can answer all of these, the project will hold up under questioning.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {PROJECT_INTERVIEW_PROMPTS.map((prompt, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <span className="shrink-0 text-muted-foreground tabular-nums">{index + 1}.</span>
                  <span>{prompt}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {questions.length > 0 ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Specific to this project</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {questions.map((question, index) => (
                  <li key={index} className="flex items-start justify-between gap-2 text-sm">
                    <span>{question.question}</span>
                    {question.focus ? (
                      <Badge variant="muted" className="shrink-0">
                        {question.focus}
                      </Badge>
                    ) : null}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}
      </TabsContent>
    </Tabs>
  )
}
