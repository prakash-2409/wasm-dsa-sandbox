import { useState, useEffect, useRef, useCallback } from "react";

export type PyodideStatus = "loading" | "ready" | "running" | "error";

export interface TerminalLine {
  text: string;
  stream: "stdout" | "stderr" | "system";
}

export interface UsePyodideReturn {
  status: PyodideStatus;
  loadProgress: number;
  output: TerminalLine[];
  runCode: (code: string) => Promise<void>;
  terminate: () => void;
  clearOutput: () => void;
  isRunning: boolean;
}

export function usePyodide(): UsePyodideReturn {
  const [status, setStatus] = useState<PyodideStatus>("loading");
  const [loadProgress, setLoadProgress] = useState(0);
  const [output, setOutput] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const runTimeoutRef = useRef<number | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runPromiseRef = useRef<{ resolve: () => void; reject: (err: any) => void } | null>(null);

  const appendOutput = useCallback((text: string, stream: TerminalLine["stream"]) => {
    setOutput((prev) => [...prev, { text, stream }]);
  }, []);

  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  const initWorker = useCallback(() => {
    // If a worker currently exists, terminate it (graceful restart check)
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    
    setStatus("loading");
    setLoadProgress(10);
    appendOutput("⏳ Spinning up isolated Python Web Worker...", "system");
    
    // Critical Vite Worker Syntax
    const worker = new Worker(new URL('../workers/pyodideWorker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;
    
    worker.onmessage = (e) => {
      const { type, stream, text, version, error } = e.data;
      if (type === "ready") {
        setLoadProgress(100);
        setStatus("ready");
        appendOutput(`✅ Python ${version} ready (Isolated Thread)`, "system");
      } else if (type === "output") {
        appendOutput(text, stream);
      } else if (type === "done") {
        setIsRunning(false);
        setStatus("ready");
        if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
        if (runPromiseRef.current) {
          runPromiseRef.current.resolve();
          runPromiseRef.current = null;
        }
      } else if (type === "error") {
        setStatus("error");
        appendOutput(`❌ Initialization Error: ${error}`, "stderr");
      }
    };
    
    // Kickstart the CDN load from within the worker
    worker.postMessage({ type: "init" });
  }, [appendOutput]);

  // Mount logic
  useEffect(() => {
    initWorker();
    return () => {
      if (workerRef.current) workerRef.current.terminate();
      if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
    };
  }, [initWorker]);

  // The Kill Switch
  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      setIsRunning(false);
      appendOutput("\n\n🛑 [Execution Terminated] Infinite loop prevented by Kill Switch.", "stderr");
      
      if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
      if (runPromiseRef.current) {
        // Resolve early so the awaiter in the UI doesn't hang forever
        runPromiseRef.current.resolve();
        runPromiseRef.current = null;
      }
      
      // Spawn a fresh, clean worker immediately so the user can continue
      initWorker();
    }
  }, [appendOutput, initWorker]);

  const runCode = useCallback(async (code: string) => {
    if (!workerRef.current || status !== "ready") {
      appendOutput("⚠️ Python environment is not ready.", "stderr");
      return;
    }

    setIsRunning(true);
    setStatus("running");
    clearOutput();
    appendOutput("▶ Submitting task to Main Worker...", "system");
    
    return new Promise<void>((resolve, reject) => {
      runPromiseRef.current = { resolve, reject };
      
      workerRef.current!.postMessage({ type: "run", code });
      
      // 5-Second Auto-Timeout Kill Switch
      runTimeoutRef.current = window.setTimeout(() => {
        terminate();
      }, 5000);
    });
  }, [status, clearOutput, appendOutput, terminate]);

  return {
    status,
    loadProgress,
    output,
    runCode,
    terminate,
    clearOutput,
    isRunning,
  };
}
