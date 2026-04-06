import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { useStore } from "../store/useStore";

interface Props {
  children?: ReactNode;
  fallbackName?: string;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ""
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in boundary:", error, errorInfo);
  }

  public handleReset = () => {
    // Clear the timeline state via Zustand outside of React component lifecycle
    useStore.getState().setExecutionTimeline([]);
    this.setState({ hasError: false, errorMsg: "" });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-[#0f0f15] select-none p-6 text-center border-l border-t border-[var(--color-border)]">
          <div className="text-red-500 mb-4 bg-red-500/10 p-3 rounded-full border border-red-500/20">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-gray-200 text-lg font-bold mb-2">
            {this.props.fallbackName || "Component"} Encountered a Render Error
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">
            A corrupt snapshot or unusual execution trace caused the renderer to crash safely. This usually happens on untracked object mutations.
          </p>
          <button
            onClick={this.handleReset}
            className="px-5 py-2 font-bold text-sm bg-[#2a2a3a] hover:bg-[#3a3a4a] text-white rounded-lg transition-all border border-[#4a4a5a]"
          >
            Reset Timeline
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
