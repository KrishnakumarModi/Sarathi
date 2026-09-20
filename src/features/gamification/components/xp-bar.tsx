import { useQuery } from '@tanstack/react-query'
import { fetchGamificationProfile } from '../api'

export function XPBar() {
  const { data: profile } = useQuery({
    queryKey: ['gamification-profile'],
    queryFn: () => fetchGamificationProfile()
  })

  if (!profile) return null

  // Calculate progress to next level
  const currentLevelXP = 50 * (profile.level - 1) * profile.level
  const nextLevelXP = 50 * profile.level * (profile.level + 1)
  const xpNeeded = nextLevelXP - currentLevelXP
  const xpProgress = profile.xp - currentLevelXP
  const progressPercent = Math.min(100, Math.max(0, (xpProgress / xpNeeded) * 100))

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg shadow-sm border mb-6">
      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl">
        {profile.level}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between mb-1">
          <span className="font-medium text-foreground">{profile.title}</span>
          <span className="text-sm text-muted-foreground">{profile.xp} / {nextLevelXP} XP</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
