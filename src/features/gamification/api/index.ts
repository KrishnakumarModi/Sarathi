import { api, toActionResult } from '@/lib/api-client'
import type { ActionResult } from '@/types/global'

export interface GamificationProfile {
  xp: number
  level: number
  title: string
  freeze_tokens: number
}

export function fetchGamificationProfile(signal?: AbortSignal): Promise<GamificationProfile> {
  return api.get<GamificationProfile>('/gamification/profile', signal)
}
