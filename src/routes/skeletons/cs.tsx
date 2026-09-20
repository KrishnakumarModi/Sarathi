import { Skeleton } from '@/components/ui/skeleton'

export function CsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-9 w-full max-w-xl" />
      <Skeleton className="h-40 w-full" />
      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    </div>
  )
}
