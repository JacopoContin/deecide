"use client";

import { useState, useRef, useEffect } from "react";

type Step = "input" | "options" | "criteria" | "evaluation" | "weighing" | "results";

type Score = {
  optionIndex: number;
  criterionIndex: number;
  score: number;
};

type Weight = {
  criterionIndex: number;
  weight: number;
};

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [decisionTitle, setDecisionTitle] = useState("");
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [criteria, setCriteria] = useState<string[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [weights, setWeights] = useState<Weight[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleStartDecision = () => {
    if (input.trim()) {
      setDecisionTitle(input);
      setInput("");
      setStep("options");
    }
  };

  const handleAddOption = () => {
    if (input.trim()) {
      setOptions([...options, input]);
      setInput("");
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleAddCriteria = () => {
    if (input.trim()) {
      setCriteria([...criteria, input]);
      setInput("");
    }
  };

  const handleRemoveCriteria = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleScore = (optionIndex: number, criterionIndex: number, score: number) => {
    const existingScoreIndex = scores.findIndex(
      (s) => s.optionIndex === optionIndex && s.criterionIndex === criterionIndex
    );

    if (existingScoreIndex >= 0) {
      const newScores = [...scores];
      newScores[existingScoreIndex] = { optionIndex, criterionIndex, score };
      setScores(newScores);
    } else {
      setScores([...scores, { optionIndex, criterionIndex, score }]);
    }
  };

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

  const handleWeight = (criterionIndex: number, weight: number) => {
    const existingWeightIndex = weights.findIndex((w) => w.criterionIndex === criterionIndex);

    if (existingWeightIndex >= 0) {
      const newWeights = [...weights];
      newWeights[existingWeightIndex] = { criterionIndex, weight };
      setWeights(newWeights);
    } else {
      setWeights([...weights, { criterionIndex, weight }]);
    }
  };

  const getWeight = (criterionIndex: number): number | undefined => {
    return weights.find((w) => w.criterionIndex === criterionIndex)?.weight;
  };

  const calculateWeightedScore = (optionIndex: number): number => {
    let totalScore = 0;
    criteria.forEach((_, criterionIndex) => {
      const score = getScore(optionIndex, criterionIndex) || 0;
      const weight = getWeight(criterionIndex) || 1;
      totalScore += score * weight;
    });
    return totalScore;
  };

  const getMaxScore = (): number => {
    return criteria.length * 5 * 5; // max score (5) * max weight (5) * number of criteria
  };

  const getWinningOptionIndex = (): number => {
    let maxScore = -1;
    let winnerIndex = 0;
    options.forEach((_, optionIndex) => {
      const score = calculateWeightedScore(optionIndex);
      if (score > maxScore) {
        maxScore = score;
        winnerIndex = optionIndex;
      }
    });
    return winnerIndex;
  };

  const currentIndex = getCurrentEvaluationIndex();

  // Auto-scroll to next card after scoring or weighing
  useEffect(() => {
    if ((step === "evaluation" || step === "weighing") && scrollContainerRef.current) {
      const cardElements = scrollContainerRef.current.querySelectorAll('[data-card-index]');
      const nextIndex = step === "evaluation" ? currentIndex : weights.length;
      const nextCard = cardElements[nextIndex];
      if (nextCard && nextIndex > 0) {
        nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentIndex, weights.length, step]);

  if (step === "results") {
    const winnerIndex = getWinningOptionIndex();
    const maxScore = getMaxScore();

    return (
      <div className="bg-[#292929] min-h-screen flex flex-col p-4 relative">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          //style={{ backgroundImage: "url('/thai-temple.png')" }}
        />

        <div className="relative z-10 flex flex-col h-full max-w-[900px] mx-auto w-full pb-32 md:pb-4">
          {/* Header */}
          <div className="pt-8 pb-6">
            <h1 className="text-white text-2xl font-semibold text-center">{decisionTitle}</h1>
            <p className="text-neutral-400 text-sm text-center mt-2">Decision Matrix</p>
          </div>

          {/* Winner announcement */}
          <div className="bg-[#735cf6] rounded-2xl p-6 mb-6">
            <p className="text-white/80 text-sm text-center mb-1">Winner</p>
            <h2 className="text-white text-3xl font-bold text-center">{options[winnerIndex]}</h2>
            <p className="text-white/80 text-sm text-center mt-2">
              Score: {calculateWeightedScore(winnerIndex)} / {maxScore}
            </p>
          </div>

          {/* Results table */}
          <div className="bg-[#2c2c2c] border border-neutral-700 rounded-2xl p-4 overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left text-white font-semibold py-3 px-2 sticky left-0 bg-[#2c2c2c]">
                    Option
                  </th>
                  {criteria.map((criterion, index) => (
                    <th key={index} className="text-center text-white font-semibold py-3 px-2 min-w-[80px]">
                      <div className="mb-1">{criterion}</div>
                      <div className="text-xs text-neutral-400 font-normal">
                        (×{getWeight(index)})
                      </div>
                    </th>
                  ))}
                  <th className="text-center text-white font-semibold py-3 px-2 min-w-[100px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {options.map((option, optionIndex) => {
                  const totalScore = calculateWeightedScore(optionIndex);
                  const isWinner = optionIndex === winnerIndex;

                  return (
                    <tr
                      key={optionIndex}
                      className={`border-b border-neutral-700 ${
                        isWinner ? "bg-[#735cf6]/10" : ""
                      }`}
                    >
                      <td className="text-white py-3 px-2 sticky left-0 bg-[#2c2c2c] font-medium">
                        {option}
                        {isWinner && (
                          <span className="ml-2 text-[#735cf6]">👑</span>
                        )}
                      </td>
                      {criteria.map((_, criterionIndex) => {
                        const score = getScore(optionIndex, criterionIndex) || 0;
                        const weight = getWeight(criterionIndex) || 1;
                        const weightedScore = score * weight;

                        return (
                          <td key={criterionIndex} className="text-center py-3 px-2">
                            <div className="text-white">{score}</div>
                            <div className="text-xs text-neutral-400">
                              = {weightedScore}
                            </div>
                          </td>
                        );
                      })}
                      <td className="text-center py-3 px-2">
                        <div className={`text-lg font-bold ${isWinner ? "text-[#735cf6]" : "text-white"}`}>
                          {totalScore}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Navigation buttons */}
          <div className="w-full fixed bottom-0 left-0 right-0 p-4 md:relative md:p-0 md:mt-4">
            <div className="flex gap-3 max-w-[900px] mx-auto">
              <button
                onClick={() => setStep("weighing")}
                className="flex-1 bg-neutral-700 text-white py-3 px-4 rounded-xl hover:bg-neutral-600 transition-colors text-sm font-medium"
              >
                Back
              </button>
              <button
                onClick={() => {
                  // Reset and start new decision
                  setStep("input");
                  setDecisionTitle("");
                  setOptions([]);
                  setCriteria([]);
                  setScores([]);
                  setWeights([]);
                }}
                className="flex-1 bg-[#735cf6] text-white py-3 px-4 rounded-xl hover:bg-[#6247e5] transition-colors text-sm font-medium"
              >
                New Decision
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "weighing") {
    return (
      <div className="bg-[#292929] min-h-screen flex flex-col p-4 relative">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          //style={{ backgroundImage: "url('/thai-temple.png')" }}
        />

        <div className="relative z-10 flex flex-col h-full max-w-[402px] mx-auto w-full">
          {/* Header */}
          <div className="pt-8 pb-6">
            <h1 className="text-white text-2xl font-semibold text-center">{decisionTitle}</h1>
            <p className="text-neutral-400 text-sm text-center mt-2">
              How important is each criterion? ({weights.length}/{criteria.length})
            </p>
          </div>

          {/* Weighing cards - Vertical carousel */}
          <div className="relative h-[400px] md:h-[500px]">
            {/* Top gradient */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#292929] via-[#292929]/90 to-transparent z-20 pointer-events-none" />

            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#292929] via-[#292929]/90 to-transparent z-20 pointer-events-none" />

            <div ref={scrollContainerRef} className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide">
              {/* Spacer top */}
              <div className="h-[150px] flex-shrink-0" />

              {criteria.map((criterion, criterionIndex) => {
                const currentWeight = getWeight(criterionIndex);

                return (
                  <div
                    key={criterionIndex}
                    data-card-index={criterionIndex}
                    className="snap-center flex-shrink-0 px-4 mb-4"
                  >
                    <div className="bg-[#2c2c2c] border border-neutral-700 rounded-2xl p-6">
                      <div className="mb-4">
                        <h3 className="text-white text-lg font-semibold mb-1">{criterion}</h3>
                        <p className="text-neutral-400 text-sm">How important is this to you?</p>
                      </div>

                      {/* Weight buttons */}
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((weight) => (
                          <button
                            key={weight}
                            onClick={() => handleWeight(criterionIndex, weight)}
                            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
                              currentWeight === weight
                                ? "bg-[#735cf6] text-white"
                                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                            }`}
                          >
                            {weight}
                          </button>
                        ))}
                      </div>

                      {/* Weight labels */}
                      <div className="flex justify-between mt-2 px-1">
                        <span className="text-xs text-neutral-500">Not important</span>
                        <span className="text-xs text-neutral-500">Very important</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Spacer bottom */}
              <div className="h-[150px] flex-shrink-0" />
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="w-full fixed bottom-0 left-0 right-0 p-4 md:relative md:p-0 md:mt-4">
            <div className="flex gap-3 max-w-[402px] mx-auto">
              <button
                onClick={() => setStep("evaluation")}
                className="flex-1 bg-neutral-700 text-white py-3 px-4 rounded-xl hover:bg-neutral-600 transition-colors text-sm font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep("results")}
                disabled={weights.length < criteria.length}
                className="flex-1 bg-[#735cf6] text-white py-3 px-4 rounded-xl hover:bg-[#6247e5] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                See Results
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "evaluation") {
    const totalEvaluations = getTotalEvaluations();

    return (
      <div className="bg-[#292929] min-h-screen flex flex-col p-4 relative">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          //style={{ backgroundImage: "url('/thai-temple.png')" }}
        />

        <div className="relative z-10 flex flex-col h-full max-w-[402px] mx-auto w-full">
          {/* Header */}
          <div className="pt-8 pb-6">
            <h1 className="text-white text-2xl font-semibold text-center">{decisionTitle}</h1>
            <p className="text-neutral-400 text-sm text-center mt-2">
              Score each option ({currentIndex}/{totalEvaluations})
            </p>
          </div>

          {/* Evaluation cards - Vertical carousel */}
          <div className="relative h-[400px] md:h-[500px]">
            {/* Top gradient */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#292929] via-[#292929]/90 to-transparent z-20 pointer-events-none" />

            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#292929] via-[#292929]/90 to-transparent z-20 pointer-events-none" />

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
                      className="snap-center flex-shrink-0 px-4 mb-4"
                    >
                      <div className="bg-[#2c2c2c] border border-neutral-700 rounded-2xl p-6">
                        <div className="mb-4">
                          <h3 className="text-white text-lg font-semibold mb-1">{option}</h3>
                          <p className="text-neutral-400 text-sm">{criterion}</p>
                        </div>

                        {/* Score buttons */}
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              onClick={() => handleScore(optionIndex, criterionIndex, score)}
                              className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
                                currentScore === score
                                  ? "bg-[#735cf6] text-white"
                                  : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>

                        {/* Score labels */}
                        <div className="flex justify-between mt-2 px-1">
                          <span className="text-xs text-neutral-500">Least</span>
                          <span className="text-xs text-neutral-500">Most</span>
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
          <div className="w-full fixed bottom-0 left-0 right-0 p-4 md:relative md:p-0 md:mt-4">
            <div className="flex gap-3 max-w-[402px] mx-auto">
              <button
                onClick={() => setStep("criteria")}
                className="flex-1 bg-neutral-700 text-white py-3 px-4 rounded-xl hover:bg-neutral-600 transition-colors text-sm font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep("weighing")}
                disabled={scores.length < totalEvaluations}
                className="flex-1 bg-[#735cf6] text-white py-3 px-4 rounded-xl hover:bg-[#6247e5] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "criteria") {
    return (
      <div className="bg-[#292929] min-h-screen flex flex-col p-4 relative">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          //style={{ backgroundImage: "url('/thai-temple.png')" }}
        />

        <div className="relative z-10 flex flex-col h-full max-w-[402px] mx-auto w-full">
          {/* Header with decision title */}
          <div className="pt-8 pb-6">
            <h1 className="text-white text-xl font-semibold text-center">{decisionTitle}</h1>
            <p className="text-neutral-400 text-sm text-center mt-2">Add your decision criteria</p>
          </div>

          {/* Criteria list - grows upward, scrollable */}
          <div className="flex-1 overflow-y-auto pb-4 md:pb-0">
            <div className="flex flex-col gap-2">
              {criteria.map((criterion, index) => (
                <div
                  key={index}
                  className="bg-[#2c2c2c] border border-neutral-700 rounded-xl p-4 flex items-center justify-between"
                >
                  <span className="text-white text-sm">{criterion}</span>
                  <button
                    onClick={() => handleRemoveCriteria(index)}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Input at bottom - fixed position */}
          <div className="w-full fixed bottom-0 left-0 right-0 p-4 md:relative md:p-0 md:mt-4">
            <div className="bg-[#2c2c2c] border border-neutral-700 rounded-2xl p-4 flex flex-col gap-4 max-w-[402px] mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCriteria()}
                placeholder="Add a criterion..."
                className="bg-transparent text-neutral-400 text-sm leading-5 outline-none placeholder:text-neutral-400 w-full"
              />

              <div className="flex items-center justify-end">
                <button
                  onClick={handleAddCriteria}
                  className="bg-[#735cf6] p-2 rounded-2xl hover:bg-[#6247e5] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2V14M2 8H14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-4 max-w-[402px] mx-auto">
              <button
                onClick={() => setStep("options")}
                className="flex-1 bg-neutral-700 text-white py-3 px-4 rounded-xl hover:bg-neutral-600 transition-colors text-sm font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep("evaluation")}
                disabled={criteria.length < 1}
                className="flex-1 bg-[#735cf6] text-white py-3 px-4 rounded-xl hover:bg-[#6247e5] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "options") {
    return (
      <div className="bg-[#292929] min-h-screen flex flex-col p-4 relative">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          //style={{ backgroundImage: "url('/thai-temple.png')" }}
        />

        <div className="relative z-10 flex flex-col h-full max-w-[402px] mx-auto w-full">
          {/* Header with decision title */}
          <div className="pt-8 pb-6">
            <h1 className="text-white text-xl font-semibold text-center">{decisionTitle}</h1>
            <p className="text-neutral-400 text-sm text-center mt-2">Add your options</p>
          </div>

          {/* Options list - grows upward, scrollable */}
          <div className="flex-1 overflow-y-auto pb-4 md:pb-0">
            <div className="flex flex-col gap-2">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="bg-[#2c2c2c] border border-neutral-700 rounded-xl p-4 flex items-center justify-between"
                >
                  <span className="text-white text-sm">{option}</span>
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Input at bottom - fixed position */}
          <div className="w-full fixed bottom-0 left-0 right-0 p-4 md:relative md:p-0 md:mt-4">
            <div className="bg-[#2c2c2c] border border-neutral-700 rounded-2xl p-4 flex flex-col gap-4 max-w-[402px] mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddOption()}
                placeholder="Add an option..."
                className="bg-transparent text-neutral-400 text-sm leading-5 outline-none placeholder:text-neutral-400 w-full"
              />

              <div className="flex items-center justify-end">
                <button
                  onClick={handleAddOption}
                  className="bg-[#735cf6] p-2 rounded-2xl hover:bg-[#6247e5] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2V14M2 8H14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-4 max-w-[402px] mx-auto">
              <button
                onClick={() => setStep("input")}
                className="flex-1 bg-neutral-700 text-white py-3 px-4 rounded-xl hover:bg-neutral-600 transition-colors text-sm font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep("criteria")}
                disabled={options.length < 2}
                className="flex-1 bg-[#735cf6] text-white py-3 px-4 rounded-xl hover:bg-[#6247e5] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#292929] min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        //style={{ backgroundImage: "url('/thai-temple.png')" }}
      />
      <div className="flex flex-col items-center md:justify-center flex-1 w-full max-w-[402px] relative z-10">
        <p className="text-neutral-400 text-sm leading-5 text-center mb-32 max-w-[259px] md:mb-8">
          &ldquo;ดี Dee&rdquo; Means good in Thai — Make better decisions with structure and
          clarity
        </p>

        <div className="w-full fixed bottom-0 left-0 right-0 p-4 md:relative md:p-0">
          <div className="bg-[#2c2c2c] border border-neutral-700 rounded-2xl p-4 flex flex-col gap-4 max-w-[402px] mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStartDecision()}
              placeholder="What are you deciding?"
              className="bg-transparent text-neutral-400 text-sm leading-5 outline-none placeholder:text-neutral-400 w-full"
            />

            <div className="flex items-center justify-end">
              <button
                onClick={handleStartDecision}
                className="bg-[#735cf6] p-2 rounded-2xl hover:bg-[#6247e5] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 12L8 4M8 4L4 8M8 4L12 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
