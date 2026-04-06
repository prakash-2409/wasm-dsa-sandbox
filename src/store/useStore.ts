import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { problems } from '../data/problems';

export interface StackFrame {
  name: string;
  args: Record<string, any>;
  returnValue: any | null;
}

export interface ExecutionSnapshot {
  lineNumber: number;
  variables: Record<string, any>;
  callStack: StackFrame[];
  event: string;
  func: string;
}

interface AppState {
  activeProblemId: string;
  userCode: Record<string, string>;
  solvedProblems: string[];
  
  // Transient Timeline State
  executionTimeline: ExecutionSnapshot[];
  scrubberIndex: number;
  
  setActiveProblem: (id: string) => void;
  updateUserCode: (id: string, code: string) => void;
  markProblemSolved: (id: string) => void;
  setExecutionTimeline: (timeline: ExecutionSnapshot[]) => void;
  setScrubberIndex: (index: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      activeProblemId: problems[0].id,
      userCode: {},
      solvedProblems: [],
      executionTimeline: [],
      scrubberIndex: 0,
      
      setActiveProblem: (id) => set({ activeProblemId: id }),
      
      updateUserCode: (id, code) => set((state) => ({
        userCode: {
          ...state.userCode,
          [id]: code
        }
      })),
      
      markProblemSolved: (id) => set((state) => {
        if (!state.solvedProblems.includes(id)) {
          return { solvedProblems: [...state.solvedProblems, id] };
        }
        return state;
      }),

      setExecutionTimeline: (timeline) => set({ 
        executionTimeline: timeline, 
        scrubberIndex: timeline.length > 0 ? 0 : 0 
      }),
      setScrubberIndex: (index) => set({ scrubberIndex: index })
    }),
    {
      name: 'algo-forge-storage',
      // Only persist user data, do not persist heavy execution traces
      partialize: (state) => ({
        activeProblemId: state.activeProblemId,
        userCode: state.userCode,
        solvedProblems: state.solvedProblems,
      }),
    }
  )
);
