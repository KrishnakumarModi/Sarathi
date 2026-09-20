import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorDisplayProps {
  title?: string
  description?: string
  retry?: () => void
}

export function ErrorDisplay({
  title = 'Something went wrong',
  description,
  retry,
}: ErrorDisplayProps) {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden />
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        {retry ? (
          <Button variant="outline" onClick={retry} className="mt-2">
            Try again
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
