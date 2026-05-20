import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ChatErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ContextualChat]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0b0f1a] p-8 text-center">
          <p className="text-lg font-semibold text-[#f1f5f9]">Chat indisponible</p>
          <p className="max-w-md text-sm text-[#94a3b8]">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-[#5ba3ff] px-4 py-2 text-sm font-semibold text-white"
          >
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
