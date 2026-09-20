/** Skills API. */

import { api } from '@/lib/api-client'
import type { SkillsView } from './lib/skill-queries'

export function fetchSkillsView(signal?: AbortSignal): Promise<SkillsView> {
  return api.get<SkillsView>('/skills', signal)
}
