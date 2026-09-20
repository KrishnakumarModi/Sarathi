/**
 * Backlog — client-side contract.
 *
 * Classification, ageing, and the reschedule/expire decisions happen in the
 * backend (`backend/app/services/backlog_manager.py`). The UI renders the
 * summary it is given, in deliberately neutral language.
 */

export interface BacklogSummary {
  size: number
  oldestAgeDays: number
  totalMinutes: number
  /** Sum of impact across the backlog. */
  totalImpact: number
  agingCount: number
}
