import { Component, type ErrorInfo, type ReactNode } from 'react'

import { ErrorDisplay } from './error-display'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * The replacement for `app/error.tsx`.
 *
 * React only recovers from a render error through a class boundary, so this
 * one stays a class. "Try again" clears the error and re-renders rather than
 * reloading the page, which is what `reset()` did.
 */
export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[RootError]', error.message, info.componentStack)
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children

    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <ErrorDisplay
          title="Something went wrong"
          description="An unexpected error occurred. Try again, and if it keeps happening reload the page."
          retry={() => this.setState({ error: null })}
        />
      </main>
    )
  }
}
