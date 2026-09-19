import { useState, useTransition } from 'react'
import { useRouter } from '@/hooks/use-navigation'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import type { ProjectTemplateRow } from '@/types/database.types'
import { createProject } from '../api'

const SCRATCH = 'scratch'

export function CreateProjectDialog({ templates }: { templates: ProjectTemplateRow[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [templateId, setTemplateId] = useState(SCRATCH)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const selectedTemplate = templates.find((t) => t.id === templateId)

  function handleTemplateChange(value: string) {
    setTemplateId(value)
    const template = templates.find((t) => t.id === value)
    if (template) {
      setTitle(template.title)
      setDescription(template.description ?? '')
    } else {
      setTitle('')
      setDescription('')
    }
  }

  function handleCreate() {
    setErrors({})
    startTransition(async () => {
      const result = await createProject({
        title,
        description: description || undefined,
        template_id: templateId === SCRATCH ? null : templateId,
        tech_stack: [],
      })

      if ('error' in result) {
        if (result.fieldErrors) setErrors(result.fieldErrors)
        toast.error('Could not create project', result.error)
        return
      }

      toast.success('Project created', title)
      setOpen(false)
      setTitle('')
      setDescription('')
      setTemplateId(SCRATCH)
      if (result.data?.id) router.push(`/projects/${result.data.id}`)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="create-project">
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Start from a flagship template — it comes with a task list, resume bullets, and the
            questions an interviewer will ask — or from scratch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-template">Template</Label>
            <Select value={templateId} onValueChange={handleTemplateChange}>
              <SelectTrigger id="project-template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SCRATCH}>Start from scratch</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate ? (
              <p className="text-xs text-muted-foreground">
                Includes {(selectedTemplate.default_tasks as unknown[])?.length ?? 0} tasks and{' '}
                {selectedTemplate.resume_bullets.length} resume bullets.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-title">Title</Label>
            <Input
              id="project-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Self-Evaluating Enterprise RAG"
            />
            {errors.title ? <p className="text-xs text-destructive">{errors.title[0]}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isPending || !title.trim()}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
