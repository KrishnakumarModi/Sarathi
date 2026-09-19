import { useState } from 'react'
import { usePathname } from '@/hooks/use-navigation'
import { Menu, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { APP_NAME } from '@/lib/constants'
import { getPageTitle } from './nav-items'
import { SidebarNav } from './sidebar-nav'
import { SyncStatus } from './sync-status'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'

interface HeaderProps {
  displayName: string | null
  email: string
}

export function Header({ displayName, email }: HeaderProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-[4.25rem] items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 lg:px-6">
      {/* Tablet: sidebar collapses into a sheet. Mobile uses the bottom bar. */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="hidden md:inline-flex lg:hidden" aria-label="Open navigation">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex h-14 items-center gap-2 border-b px-5">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden />
            <SheetTitle className="text-sm font-semibold">{APP_NAME}</SheetTitle>
          </div>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0">
        <p className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-primary sm:block">Career workspace</p>
        <h2 className="truncate text-sm font-bold">{getPageTitle(pathname)}</h2>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <SyncStatus />
        <ThemeToggle />
        <UserMenu displayName={displayName} email={email} />
      </div>
    </header>
  )
}
