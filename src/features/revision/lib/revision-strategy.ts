/**
 * Spaced repetition — client-side contract.
 *
 * The 3/7/15 schedule lives in `backend/app/services/revision_strategy.py`.
 * The UI only ever displays the qualitative retention signal, which is
 * deliberately not a percentage: a number invites over-reading a small
 * sample (curriculum/06_SPACED_REPETITION.md).
 */

export type RetentionHealth = 'strong' | 'steady' | 'fragile' | 'insufficient-data'
