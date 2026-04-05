import React, { useEffect, useRef } from "react";
import type { TerminalLine, PyodideStatus } from "../hooks/usePyodide";

interface TerminalPaneProps {
  output: TerminalLine[];
  status: PyodideStatus;
  loadProgress: number;
  onClear: () => void;
}

const TerminalPane: React.FC<TerminalPaneProps> = ({ output, status, loadProgress, onClear }) => {
  const terminalRef = useRef<HTMLPreElement>(null);

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const getLineColor = (stream: TerminalLine["stream"]) => {
    switch (stream) {
      case "stdout":
        return "var(--color-terminal-stdout)";
      case "stderr":
        return "var(--color-terminal-stderr)";
      case "system":
        return "var(--color-terminal-prompt)";
      default:
        return "var(--color-terminal-text)";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "loading":
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse-glow" style={{ background: "var(--color-warning)" }} />
            <span style={{ color: "var(--color-warning)" }}>Loading ({loadProgress}%)</span>
          </div>
        );
      case "ready":
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-success)" }} />
            <span style={{ color: "var(--color-success)" }}>Ready</span>
          </div>
        );
      case "running":
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse-glow" style={{ background: "var(--color-accent)" }} />
            <span style={{ color: "var(--color-accent-hover)" }}>Running</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-error)" }} />
            <span style={{ color: "var(--color-error)" }}>Error</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full" id="terminal-pane">
      {/* Terminal Header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)]"
        style={{ background: "var(--color-bg-secondary)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
            Output
          </div>
          <div className="text-xs">{getStatusBadge()}</div>
        </div>

        <button
          onClick={onClear}
          className="px-2.5 py-1 rounded text-xs font-medium transition-all duration-200 cursor-pointer"
          style={{
            color: "var(--color-text-muted)",
            background: "transparent",
            border: "1px solid var(--color-border)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-surface-hover)";
            e.currentTarget.style.color = "var(--color-text-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--color-text-muted)";
          }}
          id="clear-terminal-btn"
        >
          Clear
        </button>
      </div>

      {/* Loading Progress Bar */}
      {status === "loading" && (
        <div className="h-0.5 w-full" style={{ background: "var(--color-bg-tertiary)" }}>
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${loadProgress}%`,
              background: `linear-gradient(90deg, var(--color-accent), var(--color-accent-hover))`,
              boxShadow: `0 0 8px var(--color-accent-glow)`,
            }}
          />
        </div>
      )}

      {/* Terminal Body */}
      <pre
        ref={terminalRef}
        className="flex-1 min-h-0 overflow-auto px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words"
        style={{
          background: "var(--color-terminal-bg)",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
        }}
        id="terminal-output"
      >
        {output.length === 0 && status === "ready" && (
          <span style={{ color: "var(--color-text-muted)" }}>
            {`# Output will appear here after you run your code.\n# Press Ctrl+Enter or click ▶ Run to execute.`}
          </span>
        )}
        {output.map((line, i) => (
          <div key={i} className="animate-fade-in" style={{ color: getLineColor(line.stream) }}>
            {line.text}
          </div>
        ))}
      </pre>
    </div>
  );
};

export default TerminalPane;
