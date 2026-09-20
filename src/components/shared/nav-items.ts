import {
  BarChart3, BookOpen, Brain, Briefcase, CalendarDays, Code, FolderKanban,
  GraduationCap, LayoutDashboard, Map, MessageSquare, RefreshCw, Send,
  Settings, Target, type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

/** Grouped exactly as specified in 05_DESIGN_SYSTEM.md. */
export const NAV_GROUPS: NavItem[][] = [
  [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/today', label: 'Today', icon: CalendarDays },
    { href: '/revision', label: 'Revision', icon: RefreshCw },
    { href: '/roadmap', label: 'Roadmap', icon: Map },
    { href: '/curriculum', label: 'Curriculum', icon: BookOpen },
    { href: '/skills', label: 'Skills', icon: Target },
    { href: '/roles', label: 'Roles', icon: Briefcase },
  ],
  [
    { href: '/dsa', label: 'DSA', icon: Code },
    { href: '/cs', label: 'CS Fundamentals', icon: GraduationCap },
    { href: '/aptitude', label: 'Aptitude', icon: Brain },
  ],
  [
    { href: '/projects', label: 'Projects', icon: FolderKanban },
    { href: '/applications', label: 'Applications', icon: Send },
    { href: '/interviews', label: 'Interviews', icon: MessageSquare },
  ],
  [
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ],
]

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flat()

/** The five items shown in the mobile bottom bar. */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/today', label: 'Today', icon: CalendarDays },
  { href: '/dsa', label: 'DSA', icon: Code },
  { href: '/skills', label: 'Skills', icon: Target },
]

export function getPageTitle(pathname: string): string {
  const match = ALL_NAV_ITEMS.filter((item) => pathname.startsWith(item.href)).sort(
    (a, b) => b.href.length - a.href.length
  )[0]
  return match?.label ?? 'AI Career OS'
}
