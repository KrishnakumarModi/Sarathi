import { Link } from 'react-router-dom'
import { usePathname } from '@/hooks/use-navigation'
import { cn } from '@/lib/utils'
import { NAV_GROUPS } from './nav-items'

interface SidebarNavProps {
  onNavigate?: () => void
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-4 px-3 py-5">
      {NAV_GROUPS.map((group, index) => (
        <div key={index} className="space-y-1">
          {index > 0 ? <div className="mx-2 mb-3 border-t" /> : null}
          {group.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                id={`nav-${href.slice(1)}`}
                to={href}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:translate-x-0.5 hover:bg-primary/8 hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{label}</span>
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
