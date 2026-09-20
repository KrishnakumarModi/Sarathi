/**
 * Prerequisite gating — client-side contract.
 *
 * The gating itself ("a unit unlocks only when every prerequisite has theory
 * AND practice complete", curriculum/04_PREREQUISITES.md) is evaluated in
 * the backend and arrives already resolved on each unit. What the UI needs
 * is the shape it renders: whether the unit is locked, and which
 * prerequisites are still missing so the tooltip can name them.
 */

export interface UnlockStatus {
  isUnlocked: boolean
  missingPrerequisites: string[]
}
