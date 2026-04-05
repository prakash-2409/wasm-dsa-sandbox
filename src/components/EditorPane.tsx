import React, { useRef, useEffect } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useStore } from "../store/useStore";

interface EditorPaneProps {
  code: string;
  onChange: (value: string) => void;
  isRunning: boolean;
}

const EditorPane: React.FC<EditorPaneProps> = ({ code, onChange, isRunning }) => {
  const { executionTimeline, scrubberIndex } = useStore();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monacoRef = useRef<any>(null);
  const decoratorsRef = useRef<string[]>([]); // old decorations

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    if (!executionTimeline || executionTimeline.length === 0) {
      if (decoratorsRef.current.length > 0) {
        decoratorsRef.current = editorRef.current.deltaDecorations(decoratorsRef.current, []);
      }
      return;
    }

    const currentFrame = executionTimeline[scrubberIndex];
    if (currentFrame && currentFrame.lineNumber) {
      decoratorsRef.current = editorRef.current.deltaDecorations(
        decoratorsRef.current,
        [
          {
            range: new monacoRef.current.Range(currentFrame.lineNumber, 1, currentFrame.lineNumber, 1),
            options: {
              isWholeLine: true,
              className: "visualizer-active-line",
              marginClassName: "visualizer-active-margin"
            }
          }
        ]
      );
      
      // Optionally reveal the line if it's off-screen while scrubbing
      editorRef.current.revealLineInCenterIfOutsideViewport(currentFrame.lineNumber);
    }
  }, [executionTimeline, scrubberIndex]);

  return (
    <div className="flex flex-col h-full" id="editor-pane">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)]" style={{ background: "var(--color-bg-secondary)" }}>
        <div className="flex items-center gap-2">
          {/* File tab */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium"
            style={{ background: "var(--color-accent-soft)", color: "var(--color-text-accent)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
            main.py
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRunning && (
            <div className="flex items-center gap-1.5 text-xs animate-pulse-glow" style={{ color: "var(--color-warning)" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-warning)" }} />
              Executing...
            </div>
          )}
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Python 3.11</span>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onMount={handleEditorDidMount}
          onChange={(value) => onChange(value ?? "")}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            lineNumbers: "on",
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 8,
            lineNumbersMinChars: 3,
            renderLineHighlight: "all",
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            tabSize: 4,
            wordWrap: "on",
            automaticLayout: true,
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
          }}
          loading={
            <div className="flex items-center justify-center h-full w-full" style={{ background: "var(--color-bg-primary)" }}>
              <div className="animate-shimmer h-full w-full" />
            </div>
          }
        />
      </div>
    </div>
  );
};

export default EditorPane;
