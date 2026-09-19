import { useMemo, useState, useTransition } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import type { ApplicationStatus, JobApplicationRow } from '@/types/database.types'
import { updateApplicationStatus } from '../api'
import { APPLICATION_STATUS_ORDER, ApplicationStatusBadge, STATUS_LABELS } from './status-badge'

const ALL = 'all'

function StatusSelect({ application }: { application: JobApplicationRow }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Select
      value={application.status}
      disabled={isPending}
      onValueChange={(value) =>
        startTransition(async () => {
          const result = await updateApplicationStatus({
            id: application.id,
            status: value as ApplicationStatus,
          })
          if ('error' in result) toast.error('Could not update', result.error)
        })
      }
    >
      <SelectTrigger
        className="h-8 w-40"
        aria-label={`Status for ${application.company} ${application.role_title}`}
      >
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
  )
}

export function ApplicationTable({ applications }: { applications: JobApplicationRow[] }) {
  const [statusFilter, setStatusFilter] = useState(ALL)

  const filtered = useMemo(
    () =>
      statusFilter === ALL
        ? applications
        : applications.filter((a) => a.status === statusFilter),
    [applications, statusFilter]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-44 space-y-1.5">
          <Label htmlFor="application-filter">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="application-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All</SelectItem>
              {APPLICATION_STATUS_ORDER.map((value) => (
                <SelectItem key={value} value={value}>
                  {STATUS_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {applications.length}
        </p>
      </div>

      {/* Mobile: cards. Desktop: table with the less important columns kept. */}
      <div className="space-y-2 md:hidden">
        {filtered.map((application) => (
          <div key={application.id} className="content-auto space-y-2 rounded-md border p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{application.company}</p>
                <p className="truncate text-xs text-muted-foreground">{application.role_title}</p>
              </div>
              <ApplicationStatusBadge status={application.status} />
            </div>
            <StatusSelect application={application} />
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">{application.company}</TableCell>
                <TableCell>{application.role_title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {application.is_remote ? 'Remote' : (application.location ?? '—')}
                </TableCell>
                <TableCell className="text-muted-foreground">{application.source ?? '—'}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {application.date_applied ?? '—'}
                </TableCell>
                <TableCell>
                  <StatusSelect application={application} />
                </TableCell>
                <TableCell className="text-right">
                  {application.job_url ? (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={application.job_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="sr-only">{`Open ${application.company} posting`}</span>
                      </a>
                    </Button>
                  ) : (
                    '—'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
