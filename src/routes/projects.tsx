import { useQuery } from '@tanstack/react-query'
import { FolderKanban } from 'lucide-react'

import { useDocumentTitle } from '@/components/shared/document-title'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { CreateProjectDialog } from '@/features/projects/components/create-project-dialog'
import { ProjectList } from '@/features/projects/components/project-list'
import { fetchProjects } from '@/features/projects/api'
import { ProjectsSkeleton } from './skeletons/projects'

export default function ProjectsPage() {
  useDocumentTitle('Projects')
  const query = useQuery({
    queryKey: ['projects'],
    queryFn: ({ signal }) => fetchProjects(signal),
  })

  return (
    <QueryBoundary query={query} skeleton={<ProjectsSkeleton />}>
      {({ projects, templates, taskCounts }) => {
        const deployed = projects.filter((p) => p.status === 'deployed').length
        return (
          <div className="space-y-6">
            <PageHeader
              title="Projects"
              description={
                projects.length > 0
                  ? `${projects.length} project${projects.length === 1 ? '' : 's'} · ${deployed} deployed`
                  : 'Portfolio work is the strongest evidence you can show.'
              }
              action={<CreateProjectDialog templates={templates} />}
            />

            {projects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No projects yet"
                description="Start from one of the three flagship templates — each comes with a task list, resume bullets, and the questions an interviewer will actually ask."
              />
            ) : (
              <ProjectList projects={projects} taskCounts={taskCounts} />
            )}
          </div>
        )
      }}
    </QueryBoundary>
  )
}
