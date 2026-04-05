import { loadPyodide } from "pyodide";

// Global reference isolated inside the worker
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodide: any = null;

async function instantiate() {
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/",
    stdout: (text: string) => {
      self.postMessage({ type: "output", stream: "stdout", text });
    },
    stderr: (text: string) => {
      self.postMessage({ type: "output", stream: "stderr", text });
    },
  });
  
  // Inject the AlgoForge Pyodide Tracer 
  await pyodide.runPythonAsync(`
import sys
import json

def _algo_forge_tracer(frame, event, arg):
    # Ignore internal pyodide and library modules
    filename = frame.f_code.co_filename
    if "pyodide" in filename or filename.startswith("<frozen") or "site-packages" in filename:
        return _algo_forge_tracer
        
    func_name = frame.f_code.co_name
    
    # Trace inside user functions, ignore the test harness <module> level stuff entirely
    if event in ['line', 'return'] and func_name != "<module>":
        clean_locals = {}
        for k, v in frame.f_locals.items():
            if not k.startswith('__') and not callable(v) and str(type(v)) != "<class 'module'>":
                try:
                    # Deep copy by JSON stringification, avoiding memory references keeping final mutated state
                    clean_locals[k] = json.loads(json.dumps(v))
                except:
                    clean_locals[k] = str(v)
        
        if not hasattr(sys, '_algo_forge_timeline'):
            sys._algo_forge_timeline = []
            
        sys._algo_forge_timeline.append({
            "event": event,
            "lineNumber": frame.f_lineno,
            "func": func_name,
            "variables": clean_locals
        })
        
    return _algo_forge_tracer
  `);

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
      // Clear timeline and hook tracer
      await pyodide.runPythonAsync(`
import sys
sys._algo_forge_timeline = []
sys.settrace(_algo_forge_tracer)
      `);
      
      // Execute User Code + Test Harness
      await pyodide.runPythonAsync(code);
      
      // Unhook tracer gracefully and extract timeline
      await pyodide.runPythonAsync('sys.settrace(None)');
      const timelineStr = await pyodide.runPythonAsync('import json; json.dumps(sys._algo_forge_timeline)');
      const timelineData = JSON.parse(timelineStr);
      
      // Dispatch Timeline back
      self.postMessage({ type: "timeline", data: timelineData });
      
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      self.postMessage({ type: "output", stream: "system", text: `\n✅ Finished heavily isolated thread in ${elapsed}s` });
      self.postMessage({ type: "done" });
    } catch (err: any) {
      // Unhook tracer in error cases
      await pyodide.runPythonAsync('sys.settrace(None)');
      
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      self.postMessage({ type: "output", stream: "stderr", text: `\n${err.message || String(err)}` });
      self.postMessage({ type: "output", stream: "system", text: `\n❌ Exited with error after ${elapsed}s` });
      self.postMessage({ type: "done" });
    }
  }
};
