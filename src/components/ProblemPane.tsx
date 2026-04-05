import React from "react";
import type { Problem } from "../data/problems";

interface ProblemPaneProps {
  problem: Problem;
}

const ProblemPane: React.FC<ProblemPaneProps> = ({ problem }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "Medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "Hard":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-primary)] border-r border-[var(--color-border)]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center sticky top-0 z-10">
        <h2 className="text-xl font-bold text-white mb-2">{problem.title}</h2>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar">
        <div 
          className="prose prose-invert max-w-none text-sm leading-relaxed text-gray-300"
          dangerouslySetInnerHTML={{ __html: problem.descriptionHtml }}
        />
      </div>
    </div>
  );
};

export default ProblemPane;
