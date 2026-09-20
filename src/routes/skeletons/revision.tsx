import { Skeleton } from '@/components/ui/skeleton'

export function RevisionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="mx-auto h-2 w-full max-w-2xl" />
      <Skeleton className="mx-auto h-80 w-full max-w-2xl" />
    </div>
  )
}
