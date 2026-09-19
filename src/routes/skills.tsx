import { useQuery } from '@tanstack/react-query'

import { useDocumentTitle } from '@/components/shared/document-title'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { RealtimeSync } from '@/components/shared/realtime-sync'
import { SkillGrid } from '@/features/skills/components/skill-grid'
import { fetchSkillsView } from '@/features/skills/api'
import { SkillsSkeleton } from './skeletons/skills'

const REALTIME_TABLES = ['skill_mastery']

export default function SkillsPage() {
  useDocumentTitle('Skills')
  const query = useQuery({
    queryKey: ['skills'],
    queryFn: ({ signal }) => fetchSkillsView(signal),
  })

  return (
    <QueryBoundary query={query} skeleton={<SkillsSkeleton />}>
      {(view) => {
        const started = view.skills.filter((s) => s.masteryScore > 0).length
        return (
          <div className="space-y-6">
            <RealtimeSync tables={REALTIME_TABLES} />

            <PageHeader
              title="Skills"
              description={`${started} of ${view.skills.length} skills have evidence behind them. Scores come from what you have demonstrated, not from checkboxes alone.`}
            />

            <SkillGrid
              skills={view.skills}
              categories={view.categories}
              enabledRoleIds={view.enabledRoleIds}
            />
          </div>
        )
      }}
    </QueryBoundary>
  )
}
