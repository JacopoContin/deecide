"use client";

import { useRef, useEffect } from "react";

type Score = {
  optionIndex: number;
  criterionIndex: number;
  score: number;
};

type ManualEvaluationProps = {
  decisionTitle: string;
  options: string[];
  criteria: string[];
  scores: Score[];
  onScore: (optionIndex: number, criterionIndex: number, score: number) => void;
  onComplete: () => void;
  onBack: () => void;
  onSwitchMode?: () => void;
};

export default function ManualEvaluation({
  decisionTitle,
  options,
  criteria,
  scores,
  onScore,
  onComplete,
  onBack,
  onSwitchMode,
}: ManualEvaluationProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getScore = (optionIndex: number, criterionIndex: number): number | undefined => {
    return scores.find(
      (s) => s.optionIndex === optionIndex && s.criterionIndex === criterionIndex
    )?.score;
  };

  const getCurrentEvaluationIndex = () => {
    return scores.length;
  };

  const getTotalEvaluations = () => {
    return options.length * criteria.length;
  };

  const currentIndex = getCurrentEvaluationIndex();

  // Auto-scroll to next card after scoring
  useEffect(() => {
    if (scrollContainerRef.current) {
      const cardElements = scrollContainerRef.current.querySelectorAll('[data-card-index]');
      const nextCard = cardElements[currentIndex];
      if (nextCard && currentIndex > 0) {
        nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentIndex]);

  const totalEvaluations = getTotalEvaluations();

  return (
    <div className="bg-[#292929] h-screen flex flex-col relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        //style={{ backgroundImage: "url('/thai-temple.png')" }}
      />

      <div className="relative z-10 flex flex-col h-full max-w-[402px] mx-auto w-full px-4">
        {/* Header */}
        <div className="pt-8 pb-4 flex-shrink-0">
          <h1 className="text-white text-2xl font-semibold text-center">{decisionTitle}</h1>
          <p className="text-neutral-400 text-sm text-center mt-2">
            Score each option ({currentIndex}/{totalEvaluations})
          </p>
        </div>

        {/* Evaluation cards - Vertical carousel */}
        <div className="flex-1 relative overflow-hidden">
          {/* Top gradient */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#292929] via-[#292929]/90 to-transparent z-10 pointer-events-none" />

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-transparent via-[#292929]/90 to-[#292929] z-10 pointer-events-none" />

          <div ref={scrollContainerRef} className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide">
            {/* Spacer top */}
            <div className="h-[150px] flex-shrink-0" />

            {options.map((option, optionIndex) =>
              criteria.map((criterion, criterionIndex) => {
                const linearIndex = optionIndex * criteria.length + criterionIndex;
                const currentScore = getScore(optionIndex, criterionIndex);

                return (
                  <div
                    key={`${optionIndex}-${criterionIndex}`}
                    data-card-index={linearIndex}
                    className="snap-center flex-shrink-0 mb-4"
                  >
                    <div className="bg-[#2c2c2c] border border-neutral-700 rounded-2xl p-6">
                      <div className="mb-6">
                        <h3 className="text-white text-lg font-semibold mb-1">{option}</h3>
                        <p className="text-neutral-400 text-sm">{criterion}</p>
                      </div>

                      {/* Slider */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs text-neutral-500">Least desirable</span>
                          <span className="text-2xl font-bold text-[#735cf6]">
                            {currentScore || "-"}
                          </span>
                          <span className="text-xs text-neutral-500">Most desirable</span>
                        </div>

                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={currentScore || 3}
                          onChange={(e) => onScore(optionIndex, criterionIndex, parseInt(e.target.value))}
                          className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: currentScore
                              ? `linear-gradient(to right, #735cf6 0%, #735cf6 ${((currentScore - 1) / 4) * 100}%, #404040 ${((currentScore - 1) / 4) * 100}%, #404040 100%)`
                              : undefined
                          }}
                        />

                        {/* Score markers */}
                        <div className="flex justify-between mt-2 px-1">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              onClick={() => onScore(optionIndex, criterionIndex, score)}
                              className={`text-xs transition-colors ${
                                currentScore === score
                                  ? "text-[#735cf6] font-semibold"
                                  : "text-neutral-500 hover:text-neutral-300"
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Spacer bottom */}
            <div className="h-[150px] flex-shrink-0" />
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex-shrink-0 pt-4 pb-4 bg-[#292929] border-t border-neutral-800 relative z-30">
          {onSwitchMode && (
            <button
              onClick={onSwitchMode}
              className="w-full mb-2 bg-neutral-800 text-neutral-300 py-2 px-4 rounded-xl hover:bg-neutral-700 transition-colors text-xs font-medium"
            >
              Switch to Chat Mode 💬
            </button>
          )}
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 bg-neutral-700 text-white py-3 px-4 rounded-xl hover:bg-neutral-600 transition-colors text-sm font-medium shadow-lg"
            >
              Back
            </button>
            <button
              onClick={onComplete}
              disabled={scores.length < totalEvaluations}
              className="flex-1 bg-[#735cf6] text-white py-3 px-4 rounded-xl hover:bg-[#6247e5] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #735cf6;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #735cf6;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
