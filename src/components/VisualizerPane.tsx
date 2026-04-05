import React from "react";
import { motion } from "framer-motion";
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
      <div className="flex-1 overflow-auto p-4 flex flex-col min-h-0 bg-[#0f0f15]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm tracking-wide uppercase" style={{ color: "var(--color-accent-secondary)" }}>
            Frame {scrubberIndex + 1} <span className="text-gray-500 font-normal ml-1 tracking-normal lowercase">/ {executionTimeline.length}</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="bg-[#1e1e2e] text-xs font-mono px-2 py-0.5 rounded border border-[#2a2a3a] text-gray-300 shadow-sm flex items-center">
              Line {currentFrame.lineNumber} {currentFrame.event === 'return' ? ' ↩ return' : ''}
            </span>
          </div>
        </div>
        
        {/* Render Tracked Variables */}
        <div className="flex-1 overflow-auto flex flex-col gap-4">
          {Object.entries(currentFrame.variables).map(([varName, val]) => {
            
            // Render Animations for Arrays
            if (Array.isArray(val)) {
              return (
                <div key={varName} className="p-3 bg-[#1e1e2e] rounded-xl border border-[#2a2a3a]">
                  <div className="text-xs font-bold text-gray-400 mb-3 ml-1 font-mono">{varName} = list[{val.length}]</div>
                  <div className="flex flex-wrap gap-2 px-1">
                    {val.map((item, i) => (
                      <motion.div
                        layout
                        key={i} // For proper swaps we ideally need unique IDs instead of index, but indices work natively for framer layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="flex items-center justify-center min-w-[2.5rem] h-10 px-2 rounded font-mono text-sm shadow-md border"
                        style={{
                           background: "linear-gradient(135deg, hsla(270, 50%, 40%, 1), hsla(270, 50%, 30%, 1))",
                           borderColor: "hsla(270, 50%, 55%, 1)",
                           color: "#fff"
                        }}
                      >
                        {JSON.stringify(item)}
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            }

            // Render Standard Layouts for Primitives
            return (
              <div key={varName} className="p-3 bg-[#1e1e2e] rounded-xl border border-[#2a2a3a] flex flex-col">
                <span className="text-xs font-bold text-gray-400 mb-1 font-mono">{varName}</span>
                <span className="text-sm font-mono text-[#cdd6f4] break-all">{JSON.stringify(val)}</span>
              </div>
            );
          })}

          {Object.keys(currentFrame.variables).length === 0 && (
             <div className="text-gray-500 font-mono text-sm italic mt-4 px-2">No local variables initialized in this frame.</div>
          )}
        </div>
      </div>

      {/* Scrubber Area */}
      <div className="flex-shrink-0 p-4 border-t border-[#2a2a3a] bg-[#1a1a24] shadow-[0_-4px_10px_rgba(0,0,0,0.2)] z-10 relative">
        <div className="flex flex-col gap-3 relative">
          <input
            type="range"
            min="0"
            max={executionTimeline.length - 1}
            value={scrubberIndex}
            onChange={(e) => setScrubberIndex(Number(e.target.value))}
            className="w-full h-2.5 bg-gray-700/50 rounded-lg appearance-none cursor-pointer hover:bg-gray-600 transition-colors accent-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <span>Start</span>
            <span>End</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizerPane;
