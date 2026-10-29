import { Component, type ErrorInfo, type ReactNode } from 'react';

type State = { failed: boolean };

/** Last line of defence: a render error shows a way out instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info.componentStack);
  }

  /** Clears this app's saved data (everything under the devduo. prefix) and reloads the home page. */
  private reset = () => {
    try {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith('devduo.'))
        .forEach((k) => window.localStorage.removeItem(k));
    } catch {
      /* storage blocked: nothing to clear */
    }
    window.location.assign('/');
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="boundary" role="alert">
        <h1>Something went wrong</h1>
        <p>The page could not be shown. Resetting the demo data usually fixes this. Your orders and edits in this browser will be cleared.</p>
        <div className="boundary-actions">
          <button type="button" className="btn" onClick={this.reset}>
            Reset demo data
          </button>
          <button type="button" className="btn ghost" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </main>
    );
  }
}
