import { Link } from 'react-router-dom'
import { usePathname } from '@/hooks/use-navigation'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { MOBILE_NAV_ITEMS } from './nav-items'
import { SidebarNav } from './sidebar-nav'

/** Bottom bar, mobile only (<768px). Four links plus a "More" sheet. */
export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border/70 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      {MOBILE_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            to={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span>{label}</span>
          </Link>
        )
      })}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className="flex flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground"
          aria-label="Open all sections"
        >
          <Menu className="h-5 w-5" aria-hidden />
          <span>More</span>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[80vh] rounded-t-lg">
          <SheetTitle className="mb-2">All sections</SheetTitle>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </nav>
  )
}
