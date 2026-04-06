import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, type StackFrame } from "../store/useStore";

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
  const callStack = currentFrame.callStack || [];

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
      
      {/* Metrics Dashboard */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-[#2a2a3a] bg-[#1a1a24]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Total Operations:</span>
          <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{executionTimeline.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Max Stack Depth:</span>
          <span className="text-xs font-mono font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            {Math.max(0, ...executionTimeline.map(t => t.callStack ? t.callStack.length : 0))}
          </span>
        </div>
      </div>

      {/* Main Content Split: Variables | Call Stack */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 bg-[#0f0f15]">
        
        {/* Left Column: Arrays & Matrices (2/3 width) */}
        <div className="lg:col-span-2 overflow-auto p-6 flex flex-col gap-8 custom-scrollbar">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs tracking-widest uppercase text-gray-500">
              Data Structures
            </h3>
            <div className="bg-[#1e1e2e] text-[10px] font-mono px-2 py-0.5 rounded border border-[#2a2a3a] text-purple-400">
              Frame {scrubberIndex + 1} / {executionTimeline.length}
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {Object.entries(variables).map(([varName, val]: [string, any]) => {
              // 2D Array / Matrix
              if (Array.isArray(val) && val.length > 0 && Array.isArray(val[0])) {
                return (
                  <motion.div 
                    key={varName} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-[#1e1e2e]/40 rounded-xl border border-[#2a2a3a]"
                  >
                    <div className="text-[10px] font-bold text-indigo-400 mb-3 font-mono uppercase tracking-wider">{varName} (matrix)</div>
                    <div className="flex flex-col gap-1.5 overflow-auto pb-2">
                      {val.map((row: any, rIdx: number) => (
                        <div key={rIdx} className="flex gap-1.5">
                          {row.map((cell: any, cIdx: number) => (
                            <motion.div
                              layout
                              key={`${rIdx}-${cIdx}`}
                              className="w-10 h-10 min-w-[2.5rem] flex items-center justify-center rounded border border-[#3a3a4a] text-xs font-mono text-gray-200"
                              style={{ background: "#252535" }}
                            >
                              {JSON.stringify(cell)}
                            </motion.div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              }

              // 1D Array with Pointer integration
              if (Array.isArray(val)) {
                const pointers = getPointersForArray(val.length);
                return (
                  <motion.div 
                    key={varName} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-[#1e1e2e]/40 rounded-xl border border-[#2a2a3a]"
                  >
                    <div className="text-[10px] font-bold text-blue-400 mb-4 font-mono uppercase tracking-wider">{varName} (list)</div>
                    <div className="flex flex-wrap gap-x-2 gap-y-12 px-1 pt-4 pb-8">
                      {val.map((item: any, i: number) => (
                        <div key={i} className="relative flex flex-col items-center">
                          <motion.div
                            layout
                            className="flex items-center justify-center min-w-[2.5rem] h-11 px-3 rounded-lg font-mono text-sm font-bold shadow-lg border-2"
                            style={{
                              background: "linear-gradient(135deg, #1e40af, #1e3a8a)",
                              borderColor: "#3b82f6",
                              color: "#fff"
                            }}
                          >
                            {JSON.stringify(item)}
                          </motion.div>
                          
                          {/* Top: Index */}
                          <div className="absolute -top-6 text-[9px] font-mono text-gray-600 font-bold">{i}</div>

                          {/* Bottom: Pointers */}
                          <div className="absolute top-14 flex flex-col items-center gap-1">
                            <AnimatePresence>
                              {pointers[i]?.map((ptr: string) => (
                                <motion.div
                                  key={ptr}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0 }}
                                  className="px-1.5 py-0.5 rounded bg-amber-500 text-[10px] font-extrabold text-black uppercase tracking-tighter shadow-md"
                                >
                                  {ptr}
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              }

              // Filter out pointers from the "Other Variables" list to keep it clean
              if (POINTER_NAMES.includes(varName.toLowerCase()) && typeof val === 'number') return null;

              return (
                <motion.div 
                  key={varName} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-[#1e1e2e]/20 rounded-lg border border-[#2a2a3a] flex items-center justify-between"
                >
                  <span className="text-[10px] font-bold text-gray-500 font-mono uppercase">{varName}</span>
                  <span className="text-sm font-mono text-gray-300">{JSON.stringify(val)}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Column: Call Stack (1/3 width) */}
      <div className="border-l border-[#2a2a3a] bg-[#0b0b10] p-6 flex flex-col gap-4 overflow-hidden">
        <h3 className="font-bold text-xs tracking-widest uppercase text-gray-500">
          Call Stack
        </h3>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col-reverse gap-3">
          <AnimatePresence mode="popLayout">
            {callStack.map((frame: StackFrame, index: number) => {
              const isTop = index === callStack.length - 1;
              return (
                <motion.div
                  key={`${frame.name}-${index}`}
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  layout
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    isTop ? "bg-[#1e1e2e] border-purple-500/50 shadow-lg shadow-purple-500/10" : "bg-[#16161e] border-[#2a2a3a] opacity-80"
                  }`}
                  style={{
                    marginLeft: `${index * 8}px` // Visual indentation for recursion depth
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-mono text-sm font-bold ${isTop ? "text-purple-400" : "text-gray-400"}`}>
                      {frame.name}()
                    </span>
                    {frame.returnValue !== null && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold border border-green-500/30"
                      >
                        ret: {JSON.stringify(frame.returnValue)}
                      </motion.span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {Object.entries(frame.args).map(([argName, argVal]: [string, any]) => (
                      <div key={argName} className="flex justify-between text-[10px] font-mono">
                        <span className="text-gray-500">{argName}:</span>
                        <span className="text-gray-300">{JSON.stringify(argVal)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Scrubber Area */}
      <div className="flex-shrink-0 p-4 border-t border-[#2a2a3a] bg-[#1a1a24] z-20">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center mb-1">
             <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Line {currentFrame.lineNumber} • {currentFrame.event.toUpperCase()} </span>
             <span className="text-[10px] font-mono text-purple-400">Time Layer {scrubberIndex + 1}</span>
          </div>
          <input
            type="range"
            min="0"
            max={executionTimeline.length - 1}
            value={scrubberIndex}
            onChange={(e) => setScrubberIndex(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>
    </div>
  );
};

export default VisualizerPane;
