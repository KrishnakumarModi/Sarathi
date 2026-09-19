import { Link, Navigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocumentTitle } from '@/components/shared/document-title'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { ProjectDetailTabs } from '@/features/projects/components/project-detail-tabs'
import { ProjectStatusSelect } from '@/features/projects/components/project-status-select'
import { fetchProject } from '@/features/projects/api'

const UUID_RE = /^[0-9a-f-]{36}$/i

function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-[28rem] w-full" />
    </div>
  )
}

export default function ProjectDetailPage() {
  const { projectId = '' } = useParams()
  useDocumentTitle('Project')

  // A malformed id would make Postgres reject the uuid comparison outright.
  const isUuid = UUID_RE.test(projectId)

  const query = useQuery({
    queryKey: ['projects', projectId],
    queryFn: ({ signal }) => fetchProject(projectId, signal),
    enabled: isUuid,
  })

  if (!isUuid) return <Navigate to="/projects" replace />

  return (
    <QueryBoundary
      query={query}
      skeleton={<ProjectDetailSkeleton />}
      description="That project could not be loaded."
    >
      {({ project, tasks }) => (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4" />
              All projects
            </Link>
          </Button>

          <PageHeader
            title={project.title}
            description={project.description ?? undefined}
            action={<ProjectStatusSelect projectId={project.id} status={project.status} />}
          />

          <ProjectDetailTabs project={project} tasks={tasks} />
        </div>
      )}
    </QueryBoundary>
  )
}
