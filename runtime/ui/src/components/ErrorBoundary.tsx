import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  /** Human-readable pane name shown in the fallback, e.g. "workflow graph". */
  label: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Per-pane error boundary so a render crash in one pane cannot blank the whole
 * operator console. Class component by necessity — React only exposes
 * getDerivedStateFromError on classes.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="pane-error" role="alert">
          <p className="pane-error-title">The {this.props.label} view crashed.</p>
          <p className="pane-error-message">{this.state.error.message}</p>
          <button
            type="button"
            className="pane-error-retry"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
