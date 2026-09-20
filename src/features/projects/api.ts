/** Project tracker API. */

import { api, toActionResult } from '@/lib/api-client'
import { refreshData } from '@/lib/query-client'
import type { ProjectRow, ProjectTaskRow, ProjectTemplateRow } from '@/types/database.types'
import type { ActionResult } from '@/types/global'
import type { CreateProjectInput, UpdateProjectInput } from './validators'

export interface ProjectsView {
  projects: ProjectRow[]
  templates: ProjectTemplateRow[]
  taskCounts: Record<string, { total: number; done: number }>
}

export interface ProjectDetail {
  project: ProjectRow
  tasks: ProjectTaskRow[]
}

export function fetchProjects(signal?: AbortSignal): Promise<ProjectsView> {
  return api.get<ProjectsView>('/projects', signal)
}

export function fetchProject(projectId: string, signal?: AbortSignal): Promise<ProjectDetail> {
  return api.get<ProjectDetail>(`/projects/${projectId}`, signal)
}

export async function createProject(
  input: CreateProjectInput
): Promise<ActionResult<{ id: string }>> {
  const result = await toActionResult(() => api.post<{ id: string }>('/projects', input))
  if ('success' in result) refreshData()
  return result
}

export async function updateProject(input: UpdateProjectInput): Promise<ActionResult> {
  const { id, ...fields } = input
  const result = await toActionResult(() => api.patch(`/projects/${id}`, fields))
  if ('success' in result) refreshData()
  return result as ActionResult
}

export async function addProjectTask(input: {
  project_id: string
  title: string
}): Promise<ActionResult> {
  const result = await toActionResult(() => api.post('/projects/tasks', input))
  if ('success' in result) refreshData()
  return result as ActionResult
}

export async function toggleProjectTask(input: {
  task_id: string
  is_completed: boolean
}): Promise<ActionResult> {
  const result = await toActionResult(() => api.patch('/projects/tasks/toggle', input))
  if ('success' in result) refreshData()
  return result as ActionResult
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const result = await toActionResult(() => api.delete(`/projects/${id}`))
  if ('success' in result) refreshData()
  return result as ActionResult
}
