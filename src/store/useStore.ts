import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { problems } from '../data/problems';

interface AppState {
  activeProblemId: string;
  userCode: Record<string, string>;
  solvedProblems: string[];
  
  setActiveProblem: (id: string) => void;
  updateUserCode: (id: string, code: string) => void;
  markProblemSolved: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      activeProblemId: problems[0].id,
      userCode: {},
      solvedProblems: [],
      
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
    }),
    {
      name: 'algo-forge-storage',
    }
  )
);
