import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  label?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[Cursor Canvas] Render error:', error, info);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, message: '' });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center p-6">
          <div className="max-w-sm rounded border border-canvas-error/40 bg-canvas-error/10 p-4 text-sm text-canvas-text">
            <p className="font-medium">
              {this.props.label ?? 'Preview'} failed to render
            </p>
            <p className="mt-2 text-xs text-canvas-muted">{this.state.message}</p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="mt-4 rounded bg-canvas-accent px-3 py-1.5 text-xs text-white hover:opacity-90"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
