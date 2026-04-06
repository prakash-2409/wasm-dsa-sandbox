import React, { useState } from 'react';

const MobileOverlay: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#0f0f15]/95 backdrop-blur-sm text-center md:hidden">
      <div className="w-16 h-16 mb-6 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]"
           style={{ background: "linear-gradient(135deg, var(--color-accent), #a855f7)" }}>
        <span className="text-3xl text-white">⚡</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">AlgoForge Desktop</h2>
      <p className="text-gray-400 mb-8 max-w-sm text-sm leading-relaxed">
        AlgoForge is an advanced visual IDE optimized for larger screens. 
        Please open this link on your computer to continue enjoying the full 3-pane debugging experience.
      </p>
      <button 
        onClick={() => setDismissed(true)}
        className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 border border-[#2a2a3a] text-gray-300 hover:bg-[#1a1a24] hover:text-white hover:border-gray-500"
      >
        Proceed Anyway (Not Recommended)
      </button>
    </div>
  );
};

export default MobileOverlay;
