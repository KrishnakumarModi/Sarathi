import { Link } from 'react-router-dom'
import { APP_NAME } from '@/lib/constants'
import { SidebarNav } from './sidebar-nav'

/** Fixed 256px sidebar, desktop only. Tablet uses the Sheet in the header. */
export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 shrink-0 border-r border-border/70 bg-card/90 backdrop-blur-xl lg:block">
      <div className="flex h-[4.25rem] items-center gap-2.5 border-b border-border/70 px-5">
        <img src="/images/sarathi-logo.svg" alt="" className="h-8 w-7 object-cover object-top" />
        <Link to="/dashboard" className="text-sm font-bold tracking-tight">
          {APP_NAME}
        </Link>
      </div>
      <div className="h-[calc(100vh-4.25rem)] overflow-y-auto">
        <SidebarNav />
      </div>
    </aside>
  )
}
