import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Pyodide execution engine status.
 * FUTURE: This hook is designed for easy refactoring into a Web Worker.
 * The public API (loadingState, runCode, output) remains the same —
 * only the internal execution bridge needs to change.
 */
export type PyodideStatus = "loading" | "ready" | "running" | "error";

export interface TerminalLine {
  text: string;
  stream: "stdout" | "stderr" | "system";
}

export interface UsePyodideReturn {
  /** Current lifecycle status of the Pyodide engine */
  status: PyodideStatus;
  /** Percentage estimate of loading progress (0–100) */
  loadProgress: number;
  /** Terminal output lines with stream metadata */
  output: TerminalLine[];
  /** Execute a Python code string */
  runCode: (code: string) => Promise<void>;
  /** Clear terminal output */
  clearOutput: () => void;
  /** Whether the engine is currently executing code */
  isRunning: boolean;
}

// CDN URL for Pyodide (MVP: loaded from jsdelivr)
const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";

export function usePyodide(): UsePyodideReturn {
  const [status, setStatus] = useState<PyodideStatus>("loading");
  const [loadProgress, setLoadProgress] = useState(0);
  const [output, setOutput] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Ref to hold the pyodide instance across renders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pyodideRef = useRef<any>(null);

  /** Append a line to terminal output */
  const appendOutput = useCallback((text: string, stream: TerminalLine["stream"]) => {
    setOutput((prev) => [...prev, { text, stream }]);
  }, []);

  /** Clear all terminal output */
  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  // ── Initialize Pyodide on mount ──
  useEffect(() => {
    let cancelled = false;

    async function initPyodide() {
      try {
        setLoadProgress(10);
        appendOutput("⏳ Loading Python environment from CDN...", "system");

        // Dynamically load the Pyodide script from CDN
        setLoadProgress(20);
        const script = document.createElement("script");
        script.src = `${PYODIDE_CDN}pyodide.js`;
        script.async = true;

        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Pyodide script from CDN"));
          document.head.appendChild(script);
        });

        if (cancelled) return;
        setLoadProgress(50);
        appendOutput("📦 Initializing WebAssembly runtime...", "system");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const loadPyodide = (window as any).loadPyodide;
        if (!loadPyodide) {
          throw new Error("loadPyodide not found on window after script load");
        }

        const pyodide = await loadPyodide({
          indexURL: PYODIDE_CDN,
          stdout: (text: string) => {
            appendOutput(text, "stdout");
          },
          stderr: (text: string) => {
            appendOutput(text, "stderr");
          },
        });

        if (cancelled) return;
        setLoadProgress(90);

        // Pre-warm: run a trivial script to ensure Python is fully booted
        await pyodide.runPythonAsync("import sys");

        if (cancelled) return;
        pyodideRef.current = pyodide;
        setLoadProgress(100);
        setStatus("ready");
        appendOutput(`✅ Python ${pyodide.version} ready (Pyodide WebAssembly)`, "system");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        appendOutput(`❌ Failed to initialize Python: ${(err as Error).message}`, "stderr");
      }
    }

    initPyodide();

    return () => {
      cancelled = true;
    };
  }, [appendOutput]);

  // ── Execute user code ──
  const runCode = useCallback(
    async (code: string) => {
      const pyodide = pyodideRef.current;
      if (!pyodide || status !== "ready") {
        appendOutput("⚠️  Python environment is not ready yet.", "stderr");
        return;
      }

      setIsRunning(true);
      setStatus("running");
      clearOutput();
      appendOutput("▶ Running...", "system");

      const startTime = performance.now();

      try {
        await pyodide.runPythonAsync(code);
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
        appendOutput(`\n✅ Finished in ${elapsed}s`, "system");
      } catch (err) {
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
        // Extract the Python traceback from the error
        const errorMessage = (err as Error).message || String(err);
        appendOutput(`\n${errorMessage}`, "stderr");
        appendOutput(`\n❌ Exited with error after ${elapsed}s`, "system");
      } finally {
        setIsRunning(false);
        setStatus("ready");
      }
    },
    [status, appendOutput, clearOutput],
  );

  return {
    status,
    loadProgress,
    output,
    runCode,
    clearOutput,
    isRunning,
  };
}
