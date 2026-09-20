import type { RoleWithReadiness } from '../lib/role-queries'
import { RoleCard } from './role-card'

const TIER_HEADINGS = {
  A: { title: 'Tier A', blurb: 'Closest fit for an AI-focused engineering profile.' },
  B: { title: 'Tier B', blurb: 'Strong adjacent options that share most of the same skills.' },
  C: { title: 'Tier C', blurb: 'Specialised directions worth knowing about.' },
} as const

interface RoleGridProps {
  roles: RoleWithReadiness[]
  skillNames: Record<string, string>
}

export function RoleGrid({ roles, skillNames }: RoleGridProps) {
  return (
    <div className="space-y-8">
      {(['A', 'B', 'C'] as const).map((tier) => {
        const tierRoles = roles.filter((role) => role.tier === tier)
        if (tierRoles.length === 0) return null

        return (
          <section key={tier} className="space-y-3">
            <div>
              <h2 className="text-xl font-semibold">{TIER_HEADINGS[tier].title}</h2>
              <p className="text-sm text-muted-foreground">{TIER_HEADINGS[tier].blurb}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tierRoles.map((role) => (
                <RoleCard key={role.id} role={role} skillNames={skillNames} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
