import { useRouter, usePathname, useSearchParams } from '@/hooks/use-navigation'
import { useCallback, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { DIFFICULTY_LABELS } from '@/types/global'

const ALL = 'all'

/**
 * Filters live in URL search params, not component state: the view is then
 * shareable, the back button works, and the server component can read them
 * directly (01_ARCHITECTURE_GUIDE.md §5).
 */
export function CurriculumFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null || value === ALL || value === '') params.delete(key)
      else params.set(key, value)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const difficulty = searchParams.get('difficulty') ?? ALL
  const status = searchParams.get('status') ?? ALL
  const hasFilters = searchParams.toString().length > 0

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        setParam('search', search)
      }}
    >
      <div className="min-w-[10rem] flex-1 space-y-1.5">
        <Label htmlFor="curriculum-search">Search units</Label>
        <Input
          id="curriculum-search"
          value={search}
          placeholder="Search by name"
          onChange={(event) => setSearch(event.target.value)}
          onBlur={() => setParam('search', search)}
        />
      </div>

      <div className="w-36 space-y-1.5">
        <Label htmlFor="difficulty-filter">Difficulty</Label>
        <Select value={difficulty} onValueChange={(value) => setParam('difficulty', value)}>
          <SelectTrigger id="difficulty-filter" aria-label="Filter by difficulty">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All</SelectItem>
            {DIFFICULTY_LABELS.map((label, level) => (
              <SelectItem key={level} value={String(level)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-40 space-y-1.5">
        <Label htmlFor="status-filter">Status</Label>
        <Select value={status} onValueChange={(value) => setParam('status', value)}>
          <SelectTrigger id="status-filter" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All</SelectItem>
            <SelectItem value="not-started">Not started</SelectItem>
            <SelectItem value="in-progress">In progress</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch('')
            router.replace(pathname, { scroll: false })
          }}
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      ) : null}
    </form>
  )
}
