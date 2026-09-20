import { useQuery } from '@tanstack/react-query'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDocumentTitle } from '@/components/shared/document-title'
import { PageHeader } from '@/components/shared/page-header'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { InterviewSession } from '@/features/interviews/components/interview-session'
import { fetchInterviewsView } from '@/features/interviews/api'
import { percent } from '@/lib/utils'
import { InterviewsSkeleton } from './skeletons/interviews'

export default function InterviewsPage() {
  useDocumentTitle('Interviews')
  const query = useQuery({
    queryKey: ['interviews'],
    queryFn: ({ signal }) => fetchInterviewsView(signal),
  })

  return (
    <QueryBoundary query={query} skeleton={<InterviewsSkeleton />}>
      {({ questionsByCategory, projects, sessions }) => {
        const totalAsked = sessions.reduce((sum, s) => sum + s.total_questions, 0)
        const totalCorrect = sessions.reduce((sum, s) => sum + s.correct_answers, 0)

        return (
          <div className="space-y-6">
            <PageHeader
              title="Interviews"
              description={
                sessions.length > 0
                  ? `${sessions.length} recent session${sessions.length === 1 ? '' : 's'} · ${Math.round(percent(totalCorrect, totalAsked))}% rated "good"`
                  : 'Practise out loud. Self-grading is the point — be strict.'
              }
            />

            <InterviewSession questionsByCategory={questionsByCategory} projects={projects} />

            {sessions.length > 0 ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recent sessions</CardTitle>
                  <CardDescription>Your last {sessions.length}.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5 text-sm">
                    {sessions.map((session, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span className="capitalize">{session.session_type.replace(/-/g, ' ')}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {session.correct_answers}/{session.total_questions} ·{' '}
                          {session.session_date}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </div>
        )
      }}
    </QueryBoundary>
  )
}
