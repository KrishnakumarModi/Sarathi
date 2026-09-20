import { Link } from 'react-router-dom'
import { ExternalLink, Github } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProjectRow } from '@/types/database.types'
import { ProjectStatusSelect, STATUS_LABELS } from './project-status-select'

const STATUS_VARIANT: Record<string, 'muted' | 'info' | 'warning' | 'success'> = {
  idea: 'muted',
  planning: 'muted',
  'in-progress': 'info',
  testing: 'warning',
  deployed: 'success',
  archived: 'muted',
}

interface ProjectListProps {
  projects: ProjectRow[]
  taskCounts: Record<string, { total: number; done: number }>
}

export function ProjectList({ projects, taskCounts }: ProjectListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => {
        const counts = taskCounts[project.id] ?? { total: 0, done: 0 }
        return (
          <Card key={project.id} className="flex h-full flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">
                  <Link
                    to={`/projects/${project.id}`}
                    className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {project.title}
                  </Link>
                </CardTitle>
                <Badge variant={STATUS_VARIANT[project.status] ?? 'muted'} className="shrink-0">
                  {STATUS_LABELS[project.status]}
                </Badge>
              </div>
              {project.description ? (
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              ) : null}
            </CardHeader>

            <CardContent className="mt-auto space-y-3">
              {project.tech_stack.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {project.tech_stack.slice(0, 4).map((tech) => (
                    <Badge key={tech} variant="muted">
                      {tech}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <p className="text-xs text-muted-foreground">
                {counts.total > 0
                  ? `${counts.done} of ${counts.total} tasks done`
                  : 'No tasks yet'}
              </p>

              <div className="flex items-center justify-between gap-2">
                <ProjectStatusSelect projectId={project.id} status={project.status} />
                <div className="flex gap-1">
                  {project.github_url ? (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded p-1.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`${project.title} on GitHub`}
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  ) : null}
                  {project.live_url ? (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded p-1.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`${project.title} live site`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
