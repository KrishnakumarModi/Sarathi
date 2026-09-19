import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AptitudeCategoryRow } from '@/types/database.types'
import type { CategorySummary } from '../lib/aptitude-calculations'
import type { TopicWithStats } from '../lib/aptitude-queries'
import { AptitudeTopicCard } from './aptitude-topic-card'

interface AptitudeTrackerProps {
  categories: AptitudeCategoryRow[]
  topicsByCategory: Record<string, TopicWithStats[]>
  summaryByCategory: Record<string, CategorySummary>
}

export function AptitudeTracker({
  categories,
  topicsByCategory,
  summaryByCategory,
}: AptitudeTrackerProps) {
  return (
    <Tabs defaultValue={categories[0]?.id}>
      <div className="overflow-x-auto pb-1">
        <TabsList>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {categories.map((category) => {
        const summary = summaryByCategory[category.id]
        const topics = topicsByCategory[category.id] ?? []

        return (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{category.name}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {summary?.overallAccuracy === null || summary === undefined
                      ? '—'
                      : `${Math.round(summary.overallAccuracy)}%`}
                  </div>
                  <div className="text-xs text-muted-foreground">accuracy</div>
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {summary?.totalQuestionsPracticed ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">questions</div>
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {summary?.topicsPracticed ?? 0}/{topics.length}
                  </div>
                  <div className="text-xs text-muted-foreground">topics touched</div>
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">{summary?.weakTopics ?? 0}</div>
                  <div className="text-xs text-muted-foreground">below 60%</div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 lg:grid-cols-2">
              {topics.map((topic) => (
                <AptitudeTopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
