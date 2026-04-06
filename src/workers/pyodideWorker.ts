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
import copy

def _algo_forge_tracer(frame, event, arg):
    # Ignore internal pyodide and library modules
    filename = frame.f_code.co_filename
    if "pyodide" in filename or filename.startswith("<frozen") or "site-packages" in filename:
        return _algo_forge_tracer
        
    func_name = frame.f_code.co_name
    
    # Initialize timeline and call stack on sys if not exists
    if not hasattr(sys, '_algo_forge_timeline'):
        sys._algo_forge_timeline = []
        sys._algo_forge_stack = []
        
    # We only care about user-defined functions
    if func_name == "<module>":
        return _algo_forge_tracer

    def get_serializable_locals(local_vars):
        clean = {}
        for k, v in local_vars.items():
            if not k.startswith('__') and not callable(v) and str(type(v)) != "<class 'module'>":
                try:
                    # Deep copy by JSON stringification
                    clean[k] = json.loads(json.dumps(v))
                except:
                    clean[k] = str(v)
        return clean

    def record_snapshot(current_event, current_arg=None):
        # We need a deep copy of the stack at this point in time
        stack_copy = json.loads(json.dumps(sys._algo_forge_stack))
        
        # If this is a return event, the top of the stack should reflect the return value
        if current_event == 'return' and stack_copy:
            try:
                stack_copy[-1]['returnValue'] = json.loads(json.dumps(current_arg))
            except:
                stack_copy[-1]['returnValue'] = str(current_arg)

        sys._algo_forge_timeline.append({
            "event": current_event,
            "lineNumber": frame.f_lineno,
            "func": func_name,
            "variables": get_serializable_locals(frame.f_locals),
            "callStack": stack_copy
        })

    if event == 'call':
        # Push to stack
        sys._algo_forge_stack.append({
            "name": func_name,
            "args": get_serializable_locals(frame.f_locals),
            "returnValue": None
        })
        # We don't necessarily need a snapshot on EVERY call, usually 'line' is enough, 
        # but for recursion depth, seeing the entry is nice.
        record_snapshot('call')
        
    elif event == 'line':
        record_snapshot('line')
        
    elif event == 'return':
        # Capture return value in snapshot before popping
        record_snapshot('return', arg)
        if sys._algo_forge_stack:
            sys._algo_forge_stack.pop()
        
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
sys._algo_forge_stack = []
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
