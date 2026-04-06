import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../store/useStore";

const POINTER_NAMES = ['i', 'j', 'k', 'left', 'right', 'mid', 'start', 'end', 'curr', 'pivot', 'p', 'q', 'slow', 'fast'];

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
  const variables = currentFrame.variables;

  // Helper to categorize variable types and find pointers
  const getPointersForArray = (arrayLength: number) => {
    const pointers: Record<number, string[]> = {};
    Object.entries(variables).forEach(([name, val]) => {
      if (
        typeof val === 'number' && 
        POINTER_NAMES.includes(name.toLowerCase()) && 
        val >= 0 && 
        val < arrayLength
      ) {
        if (!pointers[val]) pointers[val] = [];
        pointers[val].push(name);
      }
    });
    return pointers;
  };

  return (
    <div className="flex flex-col h-full bg-[#16161e] border-l border-t border-[var(--color-border)] select-none font-sans">
      
      {/* Visual Debugger Data UI */}
      <div className="flex-1 overflow-auto p-4 flex flex-col min-h-0 bg-[#0f0f15]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xs tracking-widest uppercase text-gray-400">
            Frame {scrubberIndex + 1} <span className="text-gray-600 font-normal ml-1 tracking-normal lowercase">/ {executionTimeline.length}</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="bg-[#1e1e2e] text-[10px] font-mono px-2 py-0.5 rounded border border-[#2a2a3a] text-purple-400 shadow-sm flex items-center">
              Line {currentFrame.lineNumber} {currentFrame.event === 'return' ? ' ↩ return' : ''}
            </span>
          </div>
        </div>
        
        {/* Render Tracked Variables */}
        <div className="flex-1 overflow-auto flex flex-col gap-6">
          {Object.entries(variables).map(([varName, val]) => {
            
            // 1. Matrix (2D Array) Support
            if (Array.isArray(val) && val.length > 0 && Array.isArray(val[0])) {
              return (
                <div key={varName} className="p-4 bg-[#1e1e2e]/50 rounded-xl border border-[#2a2a3a]">
                  <div className="text-[10px] font-bold text-gray-500 mb-3 ml-1 font-mono uppercase tracking-wider">{varName} = Matrix[{val.length}x{val[0].length}]</div>
                  <div className="flex flex-col gap-1.5 p-1">
                    {val.map((row, rIdx) => (
                      <div key={rIdx} className="flex gap-1.5">
                        {row.map((cell, cIdx) => (
                          <motion.div
                            layout
                            key={`${rIdx}-${cIdx}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-10 h-10 flex items-center justify-center rounded border border-[#3a3a4a] text-xs font-mono text-gray-200"
                            style={{ background: "#252535" }}
                          >
                            {JSON.stringify(cell)}
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // 2. 1D Array Visualizer with Pointers
            if (Array.isArray(val)) {
              const pointers = getPointersForArray(val.length);
              return (
                <div key={varName} className="p-4 bg-[#1e1e2e]/50 rounded-xl border border-[#2a2a3a]">
                  <div className="text-[10px] font-bold text-gray-500 mb-4 ml-1 font-mono uppercase tracking-wider">{varName} = Array[{val.length}]</div>
                  <div className="flex flex-wrap gap-x-2 gap-y-10 px-1 pt-2">
                    {val.map((item, i) => (
                      <div key={i} className="relative flex flex-col items-center group">
                        {/* The Actual Array Box */}
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          className="flex items-center justify-center min-w-[3rem] h-12 px-3 rounded-lg font-mono text-sm font-bold shadow-lg border-2 transition-all"
                          style={{
                             background: "linear-gradient(135deg, #4c1d95, #312e81)",
                             borderColor: "#6d28d9",
                             color: "#fff"
                          }}
                        >
                          {JSON.stringify(item)}
                        </motion.div>

                        {/* Pointer Badge Container */}
                        <div className="absolute top-14 flex flex-col items-center gap-1.5">
                          <AnimatePresence>
                            {pointers[i]?.map(ptrName => (
                              <motion.div
                                key={ptrName}
                                initial={{ opacity: 0, scale: 0.5, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: -5 }}
                                className="px-2 py-0.5 rounded bg-amber-500 text-[10px] font-bold text-black uppercase tracking-tighter shadow-sm whitespace-nowrap"
                                style={{ boxShadow: "0 0 8px rgba(245, 158, 11, 0.3)" }}
                              >
                                {ptrName}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                        
                        {/* Index Indicator */}
                        <div className="absolute -top-5 text-[9px] font-mono text-gray-600 font-bold uppercase">{i}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // 3. Primative Value Rendering
            // Skip variables used as pointers to avoid noise
            if (POINTER_NAMES.includes(varName.toLowerCase()) && typeof val === 'number') return null;

            return (
              <div key={varName} className="p-3 bg-[#1e1e2e]/30 rounded-xl border border-[#2a2a3a] flex flex-col gap-1 transition-colors hover:bg-[#1e1e2e]/50">
                <span className="text-[10px] font-bold text-gray-500 font-mono uppercase tracking-widest">{varName}</span>
                <span className="text-sm font-mono text-[#cdd6f4] break-all">{JSON.stringify(val)}</span>
              </div>
            );
          })}

          {Object.keys(variables).length === 0 && (
             <div className="text-gray-500 font-mono text-sm italic mt-4 px-2">No local variables initialized in this frame.</div>
          )}
        </div>
      </div>

      {/* Scrubber Area */}
      <div className="flex-shrink-0 p-4 border-t border-[#2a2a3a] bg-[#1a1a24] shadow-[0_-4px_15px_rgba(0,0,0,0.3)] z-10 relative">
        <div className="flex flex-col gap-3 relative">
          <div className="flex justify-between items-center px-1">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
               Scrubber Timeline
             </span>
             <span className="text-[10px] font-mono text-gray-500">Step {scrubberIndex + 1}</span>
          </div>
          <input
            type="range"
            min="0"
            max={executionTimeline.length - 1}
            value={scrubberIndex}
            onChange={(e) => setScrubberIndex(Number(e.target.value))}
            className="w-full h-2 bg-gray-700/50 rounded-lg appearance-none cursor-pointer hover:bg-gray-600 transition-all accent-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <div className="flex justify-between text-[9px] font-bold text-gray-600 uppercase tracking-widest px-1">
            <span>Execution Start</span>
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizerPane;
