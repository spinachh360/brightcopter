import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
export class ErrorBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Do not send customer details or component state to an external logger.
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="container empty-state glass runtime-error" role="alert">
      <p className="eyebrow">LET’S GET YOU BACK ON TRACK</p>
      <h1>Something interrupted the page.</h1>
      <p>Please reload and try again. If the problem continues, our team can help on +91 94008 85633.</p>
      <button className="button" onClick={() => window.location.reload()}>Reload the page</button>
      <a className="button button-outline" href="tel:+919400885633">Call customer care</a>
    </main>;
  }
}
