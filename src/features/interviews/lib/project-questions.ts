/**
 * The thirteen prompts a portfolio project has to survive
 * (career/07_INTERVIEW_ENGINE.md). Generated from the project's own
 * metadata so the wording is specific rather than generic.
 */

export interface ProjectContext {
  title: string
  techStack: string[]
  status: string
}

export function generateProjectQuestions(project: ProjectContext): string[] {
  const stack = project.techStack.length > 0 ? project.techStack.join(', ') : 'your stack'
  const primary = project.techStack[0] ?? 'the main technology'

  return [
    `Explain ${project.title} in 60 seconds.`,
    `Now explain ${project.title} in 5 minutes, walking through the architecture.`,
    `Draw the architecture of ${project.title}. Why ${stack}?`,
    `What trade-offs did you make in ${project.title}, and what did you give up?`,
    `What failed while building ${project.title}, and what did you change afterwards?`,
    `How would you scale ${project.title} to 100x its current traffic?`,
    `What is the latency profile of ${project.title}, and which component dominates it?`,
    `What are the security considerations for ${project.title}?`,
    `What does ${project.title} cost to run, and how would you halve that?`,
    `How did you test ${project.title}?`,
    `How do you evaluate whether ${project.title} is actually working well?`,
    `If you rebuilt ${project.title} today, what would you do differently?`,
    `Why did you choose ${primary}, and what would you use instead?`,
  ]
}
