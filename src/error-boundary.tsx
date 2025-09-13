import { Alert, Button } from "./components/ui";
import { Component, type ErrorInfo, type ReactNode } from "react";
import logger from "./utils/logger";

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  hasError: boolean;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      error: null,
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      error,
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    this.setState({
      error: null,
      hasError: false,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="container mx-auto space-y-4 p-6">
            <Alert type="danger">Something went wrong</Alert>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {this.state.error?.message && (
                <p className="font-mono">Error: {this.state.error.message}</p>
              )}
            </div>
            <Button onClick={this.resetErrorBoundary}>Try again</Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
