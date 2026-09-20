import { useState, useTransition } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { ApplicationStatus } from '@/types/database.types'
import { createApplication } from '../api'
import { APPLICATION_STATUS_ORDER, STATUS_LABELS } from './status-badge'

export function ApplicationForm() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [values, setValues] = useState({
    company: '',
    role_title: '',
    location: '',
    salary_range: '',
    job_url: '',
    source: '',
    notes: '',
  })
  const [isRemote, setIsRemote] = useState(false)
  const [status, setStatus] = useState<ApplicationStatus>('discovered')

  function update(field: keyof typeof values) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((current) => ({ ...current, [field]: event.target.value }))
  }

  function handleSubmit() {
    setErrors({})
    startTransition(async () => {
      const result = await createApplication({
        company: values.company,
        role_title: values.role_title,
        location: values.location || undefined,
        is_remote: isRemote,
        salary_range: values.salary_range || undefined,
        job_url: values.job_url || undefined,
        source: values.source || undefined,
        status,
        notes: values.notes || undefined,
        required_skills: [],
        matched_skills: [],
        missing_skills: [],
      })

      if ('error' in result) {
        if (result.fieldErrors) setErrors(result.fieldErrors)
        toast.error('Could not save', result.error)
        return
      }

      toast.success('Application added', `${values.company} · ${values.role_title}`)
      setOpen(false)
      setValues({
        company: '', role_title: '', location: '', salary_range: '', job_url: '', source: '', notes: '',
      })
      setStatus('discovered')
      setIsRemote(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="add-application">
          <Plus className="h-4 w-4" />
          Add application
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add application</DialogTitle>
          <DialogDescription>Keep it quick — you can fill in details later.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="app-company">Company</Label>
              <Input id="app-company" value={values.company} onChange={update('company')} />
              {errors.company ? (
                <p className="text-xs text-destructive">{errors.company[0]}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="app-role">Role</Label>
              <Input id="app-role" value={values.role_title} onChange={update('role_title')} />
              {errors.role_title ? (
                <p className="text-xs text-destructive">{errors.role_title[0]}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="app-location">Location</Label>
              <Input id="app-location" value={values.location} onChange={update('location')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="app-salary">Salary range</Label>
              <Input id="app-salary" value={values.salary_range} onChange={update('salary_range')} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="app-url">Job URL</Label>
              <Input id="app-url" value={values.job_url} onChange={update('job_url')} placeholder="https://" />
              {errors.job_url ? (
                <p className="text-xs text-destructive">{errors.job_url[0]}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="app-source">Source</Label>
              <Input id="app-source" value={values.source} onChange={update('source')} placeholder="LinkedIn, referral..." />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="app-status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ApplicationStatus)}>
                <SelectTrigger id="app-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUS_ORDER.map((value) => (
                    <SelectItem key={value} value={value}>
                      {STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end pb-2">
              <label htmlFor="app-remote" className="flex items-center gap-2 text-sm">
                <Checkbox
                  id="app-remote"
                  checked={isRemote}
                  onCheckedChange={(checked) => setIsRemote(checked === true)}
                />
                Remote
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="app-notes">Notes</Label>
            <Textarea id="app-notes" rows={2} value={values.notes} onChange={update('notes')} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !values.company.trim() || !values.role_title.trim()}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
