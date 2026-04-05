import { loadPyodide } from "pyodide";

// Global reference isolated inside the worker
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodide: any = null;

async function instantiate() {
  // Pass stdout and stderr back to the main thread seamlessly
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/",
    stdout: (text: string) => {
      self.postMessage({ type: "output", stream: "stdout", text });
    },
    stderr: (text: string) => {
      self.postMessage({ type: "output", stream: "stderr", text });
    },
  });
  
  // Pre-warm the environment
  await pyodide.runPythonAsync("import sys");
  self.postMessage({ type: "ready", version: pyodide.version });
}

// Listen to the main-thread command pipeline
self.onmessage = async (event) => {
  const { type, code } = event.data;

  if (type === "init") {
    try {
      await instantiate();
    } catch (err: any) {
      self.postMessage({ type: "error", error: err.message });
    }
  } else if (type === "run") {
    const startTime = performance.now();
    try {
      await pyodide.runPythonAsync(code);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      self.postMessage({ type: "output", stream: "system", text: `\n✅ Finished heavily isolated thread in ${elapsed}s` });
      self.postMessage({ type: "done" });
    } catch (err: any) {
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      // Catch exceptions (Tracebacks syntax errors) and stream them gracefully as stderr
      self.postMessage({ type: "output", stream: "stderr", text: `\n${err.message || String(err)}` });
      self.postMessage({ type: "output", stream: "system", text: `\n❌ Exited with error after ${elapsed}s` });
      self.postMessage({ type: "done" });
    }
  }
};
