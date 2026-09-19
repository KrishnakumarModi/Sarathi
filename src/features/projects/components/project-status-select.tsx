import { useTransition } from 'react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import type { ProjectStatus } from '@/types/database.types'
import { updateProject } from '../api'

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  idea: 'Idea',
  planning: 'Planning',
  'in-progress': 'In progress',
  testing: 'Testing',
  deployed: 'Deployed',
  archived: 'Archived',
}

export const STATUS_ORDER: ProjectStatus[] = [
  'idea', 'planning', 'in-progress', 'testing', 'deployed', 'archived',
]

interface ProjectStatusSelectProps {
  projectId: string
  status: ProjectStatus
}

/**
 * A select rather than drag-and-drop: it is keyboard accessible by default
 * and one less dependency (career/04_PROJECT_TRACKER.md).
 */
export function ProjectStatusSelect({ projectId, status }: ProjectStatusSelectProps) {
  const [isPending, startTransition] = useTransition()

  function handleChange(next: string) {
    startTransition(async () => {
      const result = await updateProject({ id: projectId, status: next as ProjectStatus })
      if ('error' in result) {
        toast.error('Could not update status', result.error)
        return
      }
      if (next === 'deployed') {
        toast.success('Marked as deployed', 'This now counts as project evidence.')
      }
    })
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="h-8 w-36" aria-label="Project status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_ORDER.map((value) => (
          <SelectItem key={value} value={value}>
            {STATUS_LABELS[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
