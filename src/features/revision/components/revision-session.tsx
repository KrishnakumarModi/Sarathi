import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRouter } from '@/hooks/use-navigation'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { DueRevision } from '../lib/revision-queries'
import { FlashCard } from './flash-card'

export function RevisionSession({ items }: { items: DueRevision[] }) {
  const router = useRouter()
  const [index, setIndex] = useState(0)

  if (index >= items.length) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" aria-hidden />
          <CardTitle>Session finished</CardTitle>
          <CardDescription>
            {items.length} review{items.length === 1 ? '' : 's'} recorded. Each one is scheduled
            again based on how it went.
          </CardDescription>
          <div className="mt-2 flex gap-2">
            <Button variant="outline" onClick={() => router.refresh()}>
              Check for more
            </Button>
            <Button asChild>
              <Link to="/today">Back to today</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Progress
        value={(index / items.length) * 100}
        className="mx-auto max-w-2xl"
        aria-label="Session progress"
      />
      <FlashCard
        key={items[index].unitId}
        item={items[index]}
        index={index}
        total={items.length}
        onComplete={() => setIndex((current) => current + 1)}
      />
    </div>
  )
}
