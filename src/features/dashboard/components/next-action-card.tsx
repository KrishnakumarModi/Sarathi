import { Link } from 'react-router-dom'
import { ArrowRight, Compass } from 'lucide-react'
import { ALL_NAV_ITEMS } from '@/components/shared/nav-items'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface NextActionCardProps {
  action: { label: string; detail: string; href: string } | null
}

/** The dashboard's answer to "what matters most next". */
export function NextActionCard({ action }: NextActionCardProps) {
  if (!action) return null

  // Actions can point at a nested route (for example, a DSA pattern), so use
  // the longest matching navigation path to retain the parent section's icon.
  const destination = ALL_NAV_ITEMS
    .filter((item) => action.href.startsWith(item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]
  const DestinationIcon = destination?.icon ?? Compass

  return (
    <Card className="overflow-hidden border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="rounded-xl bg-primary p-2 text-primary-foreground shadow-lg shadow-primary/25">
              <DestinationIcon className="h-4 w-4" aria-hidden />
            </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Highest-impact next step
            </p>
            <p className="mt-0.5 font-medium">{action.label}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{action.detail}</p>
          </div>
        </div>
        <Button asChild className="shrink-0">
          <Link to={action.href}>
            Go
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
