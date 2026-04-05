import { useState, useCallback, useEffect } from "react";
import Header from "./components/Header";
import EditorPane from "./components/EditorPane";
import TerminalPane from "./components/TerminalPane";
import ProblemPane from "./components/ProblemPane";
import { usePyodide } from "./hooks/usePyodide";
import { problems } from "./data/problems";
import { useStore } from "./store/useStore";

function App() {
  const { activeProblemId, userCode, updateUserCode, markProblemSolved } = useStore();
  
  // Resolve current problem object
  const currentProblem = problems.find(p => p.id === activeProblemId) || problems[0];
  
  // The editor's text value falls back to starter code if undefined
  const code = userCode[activeProblemId] !== undefined ? userCode[activeProblemId] : currentProblem.starterCode;
  
  const handleCodeChange = (newCode: string) => {
    updateUserCode(activeProblemId, newCode);
  };

  const { status, loadProgress, output, runCode, clearOutput, isRunning } = usePyodide();

  // Resizable split panes state
  const [leftWidthPercent, setLeftWidthPercent] = useState(40);
  const [topHeightPercent, setTopHeightPercent] = useState(60);
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);

  const handleRun = useCallback(async () => {
    if (status !== "ready" || isRunning) return;

    // Construct the hidden testing harness string
    let testExecutionString = `\nprint("\\n# --- Executing Test Cases ---")\n`;
    testExecutionString += `try:\n`;
    testExecutionString += `    pass_count = 0\n`;
    
    currentProblem.testCases.forEach((tc, idx) => {
      // In JS we need to escape the string appropriately for Python execution
      testExecutionString += `    result_${idx} = ${currentProblem.functionName}(${tc.inputArguments})\n`;
      testExecutionString += `    assert result_${idx} == ${tc.expectedOutput}, f"Test Case ${tc.id} Failed: Input: {${JSON.stringify(tc.inputArguments)}} | Expected: {${JSON.stringify(tc.expectedOutput)}} | Got: {result_${idx}}"\n`;
      testExecutionString += `    pass_count += 1\n`;
      testExecutionString += `    print(f"✅ Test Case ${tc.id} Passed")\n`;
    });

    // Special exact phrase to trigger markProblemSolved
    testExecutionString += `    print(f"\\n🎯 SUCCESS! All {pass_count}/${currentProblem.testCases.length} tests passed.")\n`;
    testExecutionString += `except AssertionError as e:\n`;
    testExecutionString += `    print(f"\\n❌ {e}")\n`;
    testExecutionString += `except Exception as e:\n`;
    testExecutionString += `    import traceback\n`;
    testExecutionString += `    print("\\n❌ Runtime Error:\\n")\n`;
    testExecutionString += `    traceback.print_exc()\n`;

    // Concatenate user code with test harness
    const finalPyCode = `${code}\n${testExecutionString}`;
    
    await runCode(finalPyCode);
  }, [code, status, isRunning, runCode, currentProblem]);

  // Read output to intercept SUCCESS triggers
  useEffect(() => {
    if (output.length > 0) {
      const lastLine = output[output.length - 1];
      if (lastLine.stream === "stdout" && lastLine.text.includes("🎯 SUCCESS! All")) {
        markProblemSolved(activeProblemId);
      }
    }
  }, [output, activeProblemId, markProblemSolved]);

  // Ctrl+Enter keyboard shortcut for running code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRun]);

  // ── Split pane drag handlers ──
  useEffect(() => {
    if (!isDraggingHorizontal && !isDraggingVertical) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingHorizontal) {
        const percent = (e.clientX / window.innerWidth) * 100;
        setLeftWidthPercent(Math.max(20, Math.min(60, percent)));
      }
      if (isDraggingVertical) {
        const percent = ((e.clientY - 56) / (window.innerHeight - 56)) * 100;
        setTopHeightPercent(Math.max(20, Math.min(80, percent)));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingHorizontal(false);
      setIsDraggingVertical(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = isDraggingHorizontal ? "col-resize" : "row-resize";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDraggingHorizontal, isDraggingVertical]);

  return (
    <div className="flex flex-col h-screen w-screen" style={{ background: "var(--color-bg-primary)" }}>
      {/* Header */}
      <Header
        status={status}
        isRunning={isRunning}
        onRun={handleRun}
        onClear={clearOutput}
      />

      {/* Main 3-Pane Layout */}
      <div className="flex flex-1 min-h-0 relative">
        
        {/* Left: Problem Description */}
        <div
          className="h-full min-w-0"
          style={{ width: `${leftWidthPercent}%` }}
        >
          <ProblemPane problem={currentProblem} />
        </div>

        {/* Drag Handle (Horizontal) */}
        <div
          onMouseDown={() => setIsDraggingHorizontal(true)}
          className="flex-shrink-0 flex items-center justify-center cursor-col-resize z-20 group hover:bg-[var(--color-accent)]"
          style={{ width: "6px", background: "var(--color-border-subtle)", transition: "background 0.2s" }}
        >
          <div className="w-0.5 h-8 rounded-full bg-gray-600 group-hover:bg-white" />
        </div>

        {/* Right Side container (Split vertically) */}
        <div
          className="h-full min-w-0 flex flex-col"
          style={{ width: `${100 - leftWidthPercent}%` }}
        >
          {/* Top: Editor */}
          <div style={{ height: `${topHeightPercent}%` }}>
            <EditorPane code={code} onChange={handleCodeChange} isRunning={isRunning} />
          </div>

          {/* Drag Handle (Vertical) */}
          <div
            onMouseDown={() => setIsDraggingVertical(true)}
            className="flex-shrink-0 flex items-center justify-center cursor-row-resize z-20 group hover:bg-[var(--color-accent)]"
            style={{ height: "6px", background: "var(--color-border)", transition: "background 0.2s" }}
          >
            <div className="h-0.5 w-8 rounded-full bg-gray-600 group-hover:bg-white" />
          </div>

          {/* Bottom: Terminal */}
          <div style={{ height: `${100 - topHeightPercent}%` }}>
            <TerminalPane
              output={output}
              status={status}
              loadProgress={loadProgress}
              onClear={clearOutput}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
