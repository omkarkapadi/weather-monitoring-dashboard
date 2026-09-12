import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="centered">
          <section className="panel-card">
            <p className="eyebrow">Something broke</p>
            <h2>This panel failed to load</h2>
            <p className="lede">The rest of the app is still available. Reload the page to try again.</p>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
