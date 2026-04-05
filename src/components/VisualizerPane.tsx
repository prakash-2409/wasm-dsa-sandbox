import React from "react";
import { useStore } from "../store/useStore";

const VisualizerPane: React.FC = () => {
  const { executionTimeline, scrubberIndex, setScrubberIndex } = useStore();

  if (!executionTimeline || executionTimeline.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 bg-[#16161e] p-4 text-center">
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 mb-4 opacity-50">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
        </svg>
        <p className="font-semibold text-lg">No Executions Found</p>
        <p className="text-sm mt-2 max-w-md">Run your code to automatically generate tracing timelines and visually debug complex variables.</p>
      </div>
    );
  }

  const currentFrame = executionTimeline[scrubberIndex];

  return (
    <div className="flex flex-col h-full bg-[#16161e] border-l border-t border-[var(--color-border)] select-none">
      
      {/* Visual Debugger Data UI */}
      <div className="flex-1 overflow-auto p-4 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm" style={{ color: "var(--color-accent-secondary)" }}>
            Frame {scrubberIndex + 1} <span className="text-gray-500 font-normal ml-1">/ {executionTimeline.length}</span>
          </h3>
          <span className="bg-[#1e1e2e] text-xs font-mono px-2 py-0.5 rounded border border-[#2a2a3a] text-gray-300 shadow-sm">
            Line {currentFrame.line} {currentFrame.event === 'return' ? ' (returning)' : ''}
          </span>
        </div>
        
        {/* Frame Locals JSON Dump */}
        <pre className="flex-1 overflow-auto bg-[#1e1e2e] p-4 rounded-lg font-mono text-sm shadow-inner text-[#cdd6f4] border border-[#2a2a3a]">
{JSON.stringify(currentFrame.locals, null, 2)}
        </pre>
      </div>

      {/* Scrubber Area */}
      <div className="flex-shrink-0 p-4 border-t border-[#2a2a3a] bg-[#1a1a24]">
        <div className="flex flex-col gap-2 relative">
          <input
            type="range"
            min="0"
            max={executionTimeline.length - 1}
            value={scrubberIndex}
            onChange={(e) => setScrubberIndex(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer hover:bg-gray-600 transition-colors accent-violet-500"
          />
          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Start</span>
            <span>End</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizerPane;
