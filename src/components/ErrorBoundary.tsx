import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-zinc-100">
          <h1 className="font-display text-xl font-bold text-gradient mb-2">Something went wrong</h1>
          <p className="text-zinc-400 text-sm mb-4 text-center max-w-md">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="btn-primary"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
