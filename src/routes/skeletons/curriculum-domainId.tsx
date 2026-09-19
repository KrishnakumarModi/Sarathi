import { Skeleton } from '@/components/ui/skeleton'

export function CurriculumDomainidSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-16 w-full" />
      <div className="space-y-3 rounded-lg border p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2" style={{ paddingLeft: `${(i % 3) * 12}px` }}>
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
