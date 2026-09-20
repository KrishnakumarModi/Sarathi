import { Skeleton } from '@/components/ui/skeleton'

export function RolesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-96" />
      </div>
      {Array.from({ length: 3 }).map((_, section) => (
        <div key={section} className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
