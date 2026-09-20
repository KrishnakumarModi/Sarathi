import {
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  Code,
  Cpu,
  Database,
  FlaskConical,
  GitBranch,
  GraduationCap,
  Layers,
  LineChart,
  Network,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Sigma,
  Sparkles,
  Target,
  Terminal,
  Workflow,
  type LucideIcon,
} from 'lucide-react'

/**
 * Curriculum domains name their icon in the seed data, so the component has
 * to resolve a string to a component at runtime.
 *
 * The Next.js version did `import * as Icons from 'lucide-react'` and
 * indexed the namespace. That works there because Next rewrites
 * `lucide-react` imports per-icon; with a plain bundler the same namespace
 * import pulls the entire ~770 kB library into the initial chunk. An
 * explicit map keeps the behaviour — including the BookOpen fallback for an
 * unknown name — and lets the bundler drop everything unused.
 *
 * Add a row here when a new icon appears in `domains.json`.
 */
const ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  Code,
  Cpu,
  Database,
  FlaskConical,
  GitBranch,
  GraduationCap,
  Layers,
  LineChart,
  Network,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Sigma,
  Sparkles,
  Target,
  Terminal,
  Workflow,
}

export function DomainIcon({ name, className }: { name: string | null; className?: string }) {
  const Icon = (name && ICONS[name]) || BookOpen
  return <Icon className={className} aria-hidden />
}
