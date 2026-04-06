import type { ExecutionSnapshot } from "../store/useStore";

export function generateHeatmap(timeline: ExecutionSnapshot[]): { frequencies: Record<number, number>, maxFrequency: number } {
  const frequencies: Record<number, number> = {};
  let maxFrequency = 0;

  for (const snapshot of timeline) {
    if (snapshot.lineNumber && snapshot.func && snapshot.func !== '<module>') {
      frequencies[snapshot.lineNumber] = (frequencies[snapshot.lineNumber] || 0) + 1;
      if (frequencies[snapshot.lineNumber] > maxFrequency) {
        maxFrequency = frequencies[snapshot.lineNumber];
      }
    }
  }

  return { frequencies, maxFrequency };
}
