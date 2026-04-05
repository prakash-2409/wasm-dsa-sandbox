import React from "react";
import type { PyodideStatus } from "../hooks/usePyodide";
import { useStore } from "../store/useStore";
import { problems } from "../data/problems";

interface HeaderProps {
  status: PyodideStatus;
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onClear: () => void;
}

const Header: React.FC<HeaderProps> = ({ status, isRunning, onRun, onStop, onClear }) => {
  const canRun = status === "ready" && !isRunning;
  
  const { activeProblemId, setActiveProblem, solvedProblems } = useStore();

  return (
    <header
      className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)]"
      style={{ background: "var(--color-bg-secondary)" }}
      id="app-header"
    >
      {/* Logo & Branding */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold"
          style={{
            background: "linear-gradient(135deg, var(--color-accent), #a855f7)",
            color: "#fff",
            boxShadow: "0 2px 10px var(--color-accent-glow)",
          }}
        >
          ⚡
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            AlgoForge
          </h1>
          <p className="text-[10px] font-medium tracking-wider uppercase" style={{ color: "var(--color-text-muted)" }}>
            In-Browser Python · WebAssembly
          </p>
        </div>
      </div>

      {/* Primary Navigation / Problem Selector */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <select 
            value={activeProblemId}
            onChange={(e) => setActiveProblem(e.target.value)}
            className="appearance-none bg-[#16161e] border border-[#2a2a3a] text-[#e4e4ed] text-sm font-medium rounded-lg px-4 py-1.5 pr-10 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer transition-colors hover:bg-[#1e1e2a]"
          >
            {problems.map((prob) => {
              const isSolved = solvedProblems.includes(prob.id);
              return (
                <option key={prob.id} value={prob.id}>
                  {isSolved ? "✅ " : "☐ "} {prob.title}
                </option>
              );
            })}
          </select>
          {/* Custom Chevron for select */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Clear Button */}
        <button
          onClick={onClear}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
          style={{
            color: "var(--color-text-secondary)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-surface-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--color-surface)";
          }}
          id="header-clear-btn"
        >
          Clear Output
        </button>

        {/* Stop Button */}
        {isRunning && (
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200 shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer"
            id="stop-code-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
            </svg>
            Stop ⏹️
          </button>
        )}

        {/* Run Button */}
        <button
          onClick={onRun}
          disabled={!canRun}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: canRun
              ? "linear-gradient(135deg, var(--color-accent), #a855f7)"
              : "var(--color-bg-elevated)",
            color: canRun ? "#fff" : "var(--color-text-muted)",
            boxShadow: canRun ? "0 2px 12px var(--color-accent-glow)" : "none",
            border: "none",
          }}
          onMouseEnter={(e) => {
            if (canRun) {
              e.currentTarget.style.boxShadow = "0 4px 20px var(--color-accent-glow)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (canRun) {
              e.currentTarget.style.boxShadow = "0 2px 12px var(--color-accent-glow)";
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
          id="run-code-btn"
        >
          {isRunning ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Running...
            </>
          ) : status === "loading" ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Loading...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Run Code
            </>
          )}
        </button>

        {/* Keyboard shortcut hint */}
        {canRun && (
          <span className="text-[10px] hidden sm:inline-block ml-1" style={{ color: "var(--color-text-muted)" }}>
            Ctrl+↵
          </span>
        )}
      </div>
    </header>
  );
};

export default Header;
