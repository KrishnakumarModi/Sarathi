import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useDocumentTitle } from '@/components/shared/document-title'

export default function NotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <FileQuestion className="h-10 w-10 text-muted-foreground" aria-hidden />
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        That page does not exist. It may have been moved, or the link may be wrong.
      </p>
      <Button asChild>
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </main>
  )
}
