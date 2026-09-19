/**
 * Deterministic baseline assessment.
 *
 * A small, rule-scored questionnaire — no LLM, no external API. The user may
 * skip it entirely and start from fundamentals instead
 * (06_PRODUCT_ALIGNMENT_PLAN.md Phase 1).
 */

export interface BaselineQuestion {
  id: string
  /** Skill ids this question provides evidence for. */
  area: string[]
  prompt: string
  options: Array<{ value: string; label: string; score: number }>
}

const SCALE = [
  { value: 'none', label: 'Never used it', score: 0 },
  { value: 'aware', label: 'I know what it is', score: 25 },
  { value: 'guided', label: 'I can use it with docs open', score: 50 },
  { value: 'confident', label: 'I can build with it unaided', score: 75 },
  { value: 'expert', label: 'I have shipped it and debugged it in anger', score: 100 },
]

export const BASELINE_QUESTIONS: BaselineQuestion[] = [
  { id: 'baseline-python', area: ['python', 'oop-python'], prompt: 'Python', options: SCALE },
  { id: 'baseline-sql', area: ['sql', 'dbms'], prompt: 'SQL and relational databases', options: SCALE },
  { id: 'baseline-math', area: ['linear-algebra', 'probability', 'statistics'], prompt: 'Maths for ML (linear algebra, probability, statistics)', options: SCALE },
  { id: 'baseline-ml', area: ['supervised-learning', 'scikit-learn', 'model-evaluation'], prompt: 'Classical machine learning', options: SCALE },
  { id: 'baseline-dl', area: ['neural-networks', 'pytorch'], prompt: 'Deep learning and PyTorch', options: SCALE },
  { id: 'baseline-llm', area: ['llm-apis', 'prompt-engineering'], prompt: 'Working with LLM APIs', options: SCALE },
  { id: 'baseline-rag', area: ['rag', 'embeddings', 'vector-databases'], prompt: 'Retrieval and RAG', options: SCALE },
  { id: 'baseline-backend', area: ['fastapi', 'rest-apis'], prompt: 'Building backend APIs', options: SCALE },
  { id: 'baseline-devops', area: ['docker', 'ci-cd'], prompt: 'Docker and CI/CD', options: SCALE },
  { id: 'baseline-dsa', area: ['dsa-patterns', 'problem-solving'], prompt: 'Data structures and algorithms', options: SCALE },
]

export function scoreFor(questionId: string, value: string): number {
  const question = BASELINE_QUESTIONS.find((q) => q.id === questionId)
  const option = question?.options.find((o) => o.value === value)
  return option?.score ?? 0
}

/** Skill ids a baseline answer maps to. */
export function areasFor(questionId: string): string[] {
  return BASELINE_QUESTIONS.find((q) => q.id === questionId)?.area ?? []
}
