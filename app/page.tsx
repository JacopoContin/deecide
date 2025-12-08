"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ConversationalEvaluation from "./components/ConversationalEvaluation";
import ConversationalWeighing from "./components/ConversationalWeighing";
import ManualEvaluation from "./components/ManualEvaluation";

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
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [evaluationMode, setEvaluationMode] = useState<"conversational" | "manual">("conversational");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleStartDecision = async () => {
    if (input.trim()) {
      const title = input;
      setDecisionTitle(title);
      setInput("");
      setStep("options");

      // Fetch AI suggestions for options
      setIsLoadingSuggestions(true);
      try {
        const response = await fetch("/api/ai/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decisionTitle: title, type: "options" }),
        });
        const data = await response.json();
        if (data.suggestions) {
          setAiSuggestions(data.suggestions);
        }
      } catch (error) {
        console.error("Failed to fetch AI suggestions:", error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }
  };

  const handleAddOption = () => {
    if (input.trim()) {
      setOptions([...options, input]);
      setInput("");
    }
  };

  const handleAddSuggestion = (suggestion: string, type: "option" | "criterion") => {
    if (type === "option") {
      if (!options.includes(suggestion)) {
        setOptions([...options, suggestion]);
      }
    } else {
      if (!criteria.includes(suggestion)) {
        setCriteria([...criteria, suggestion]);
      }
    }
  };

  const isSuggestionAdded = (suggestion: string, type: "option" | "criterion") => {
    return type === "option" ? options.includes(suggestion) : criteria.includes(suggestion);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleMoveToCriteria = async () => {
    setStep("criteria");

    // Fetch AI suggestions for criteria
    setIsLoadingSuggestions(true);
    setAiSuggestions([]);
    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisionTitle, type: "criteria" }),
      });
      const data = await response.json();
      if (data.suggestions) {
        setAiSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("Failed to fetch AI suggestions:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
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

  const getScore = useCallback((optionIndex: number, criterionIndex: number): number | undefined => {
    return scores.find(
      (s) => s.optionIndex === optionIndex && s.criterionIndex === criterionIndex
    )?.score;
  }, [scores]);

  const getCurrentEvaluationIndex = () => {
    return scores.length;
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

  const getWeight = useCallback((criterionIndex: number): number | undefined => {
    return weights.find((w) => w.criterionIndex === criterionIndex)?.weight;
  }, [weights]);

  const calculateWeightedScore = useCallback((optionIndex: number): number => {
    let totalScore = 0;
    criteria.forEach((_, criterionIndex) => {
      const score = getScore(optionIndex, criterionIndex) || 0;
      const weight = getWeight(criterionIndex) || 1;
      totalScore += score * weight;
    });
    return totalScore;
  }, [criteria, getScore, getWeight]);

  const getMaxScore = useCallback((): number => {
    return criteria.length * 5 * 5; // max score (5) * max weight (5) * number of criteria
  }, [criteria.length]);

  const getWinningOptionIndex = useCallback((): number => {
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
  }, [options, calculateWeightedScore]);

  const currentIndex = getCurrentEvaluationIndex();

  // Auto-scroll to next card after scoring or weighing
  useEffect(() => {
    if ((step === "evaluation" || step === "weighing") && scrollContainerRef.current) {
      const cardElements = scrollContainerRef.current.querySelectorAll('[data-card-index]');

      // When first entering weighing step, scroll to first card
      if (step === "weighing" && weights.length === 0) {
        const firstCard = cardElements[0];
        if (firstCard) {
          setTimeout(() => {
            firstCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
        return;
      }

      // Otherwise scroll to next card after scoring/weighing
      const nextIndex = step === "evaluation" ? currentIndex : weights.length;
      const nextCard = cardElements[nextIndex];
      if (nextCard && nextIndex > 0) {
        nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentIndex, weights.length, step]);

  // Fetch AI explanation when results load
  useEffect(() => {
    if (step === "results" && aiExplanation === "" && !isLoadingExplanation) {
      setIsLoadingExplanation(true);
      const winnerIdx = getWinningOptionIndex();
      fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decisionTitle,
          options,
          criteria,
          scores,
          weights,
          winnerIndex: winnerIdx,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.explanation) {
            setAiExplanation(data.explanation);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch AI explanation:", error);
        })
        .finally(() => {
          setIsLoadingExplanation(false);
        });
    }
  }, [step, aiExplanation, isLoadingExplanation, decisionTitle, options, criteria, scores, weights, getWinningOptionIndex]);

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

          {/* AI Explanation */}
          {(aiExplanation || isLoadingExplanation) && (
            <div className="bg-[#2c2c2c] border border-neutral-700 rounded-2xl p-6 mb-6">
              <h3 className="text-white text-lg font-semibold mb-3">AI Analysis</h3>
              {isLoadingExplanation ? (
                <div className="flex space-x-2 justify-center py-4">
                  <div className="w-2 h-2 bg-[#735cf6] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-[#735cf6] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-[#735cf6] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              ) : (
                <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">{aiExplanation}</p>
              )}
            </div>
          )}

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
                  setAiSuggestions([]);
                  setAiExplanation("");
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
      <ConversationalWeighing
        decisionTitle={decisionTitle}
        criteria={criteria}
        onWeight={handleWeight}
        onComplete={() => setStep("results")}
        onBack={() => setStep("evaluation")}
      />
    );
  }

  if (step === "evaluation") {
    if (evaluationMode === "conversational") {
      return (
        <ConversationalEvaluation
          decisionTitle={decisionTitle}
          options={options}
          criteria={criteria}
          onScore={handleScore}
          onComplete={() => setStep("weighing")}
          onBack={() => setStep("criteria")}
          currentScores={scores}
          onSwitchMode={() => setEvaluationMode("manual")}
        />
      );
    } else {
      return (
        <ManualEvaluation
          decisionTitle={decisionTitle}
          options={options}
          criteria={criteria}
          scores={scores}
          onScore={handleScore}
          onComplete={() => setStep("weighing")}
          onBack={() => setStep("criteria")}
          onSwitchMode={() => setEvaluationMode("conversational")}
        />
      );
    }
  }

  if (step === "criteria") {
    return (
      <div className="bg-[#292929] h-screen flex flex-col relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          //style={{ backgroundImage: "url('/thai-temple.png')" }}
        />

        <div className="relative z-10 flex flex-col h-full max-w-[402px] mx-auto w-full px-4">
          {/* Header with decision title */}
          <div className="pt-8 pb-4 flex-shrink-0">
            <h1 className="text-white text-xl font-semibold text-center">{decisionTitle}</h1>
            <p className="text-neutral-400 text-sm text-center mt-2">Add your decision criteria</p>
          </div>

          {/* Criteria list - grows upward from input, scrollable */}
          <div className="flex-1 overflow-y-auto pb-2">
            <div className="flex flex-col gap-2 min-h-full justify-end">
              {/* User's criteria */}
              {criteria.slice().reverse().map((criterion, reverseIndex) => {
                const index = criteria.length - 1 - reverseIndex;
                return (
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
                );
              })}
            </div>
          </div>

          {/* Input at bottom - moves with keyboard */}
          <div className="flex-shrink-0 pt-2 pb-4 bg-[#292929]">
            {/* AI Suggestions Chips */}
            {aiSuggestions.length > 0 && (
              <div className="mb-3">
                <p className="text-neutral-400 text-xs mb-2">AI suggestions - tap to add</p>
                {isLoadingSuggestions ? (
                  <div className="flex justify-center py-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-[#735cf6] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-[#735cf6] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-[#735cf6] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map((suggestion, index) => {
                      const isAdded = isSuggestionAdded(suggestion, "criterion");
                      return (
                        <button
                          key={index}
                          onClick={() => handleAddSuggestion(suggestion, "criterion")}
                          disabled={isAdded}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            isAdded
                              ? "bg-[#735cf6] text-white cursor-default"
                              : "bg-[#735cf6]/10 border border-[#735cf6]/30 text-[#735cf6] hover:bg-[#735cf6]/20"
                          }`}
                        >
                          {suggestion} {isAdded && "✓"}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="bg-[#2c2c2c] border border-neutral-700 rounded-2xl p-4 flex flex-col gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCriteria()}
                placeholder="Add a criterion..."
                className="bg-transparent text-neutral-400 text-base outline-none placeholder:text-neutral-400 w-full"
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

            {/* Evaluation mode toggle */}
            <div className="mb-4">
              <p className="text-neutral-400 text-xs mb-2 text-center">Choose evaluation method:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setEvaluationMode("conversational")}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                    evaluationMode === "conversational"
                      ? "bg-[#735cf6] text-white"
                      : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                  }`}
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => setEvaluationMode("manual")}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                    evaluationMode === "manual"
                      ? "bg-[#735cf6] text-white"
                      : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                  }`}
                >
                  🎚️ Sliders
                </button>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 max-w-[402px] mx-auto">
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
      <div className="bg-[#292929] h-screen flex flex-col relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          //style={{ backgroundImage: "url('/thai-temple.png')" }}
        />

        <div className="relative z-10 flex flex-col h-full max-w-[402px] mx-auto w-full px-4">
          {/* Header with decision title */}
          <div className="pt-8 pb-4 flex-shrink-0">
            <h1 className="text-white text-xl font-semibold text-center">{decisionTitle}</h1>
            <p className="text-neutral-400 text-sm text-center mt-2">Add your options</p>
          </div>

          {/* Options list - grows upward from input, scrollable */}
          <div className="flex-1 overflow-y-auto pb-2">
            <div className="flex flex-col gap-2 min-h-full justify-end">
              {/* User's options */}
              {options.slice().reverse().map((option, reverseIndex) => {
                const index = options.length - 1 - reverseIndex;
                return (
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
                );
              })}
            </div>
          </div>

          {/* Input at bottom - moves with keyboard */}
          <div className="flex-shrink-0 pt-2 pb-4 bg-[#292929]">
            {/* AI Suggestions Chips */}
            {aiSuggestions.length > 0 && (
              <div className="mb-3">
                <p className="text-neutral-400 text-xs mb-2">AI suggestions - tap to add</p>
                {isLoadingSuggestions ? (
                  <div className="flex justify-center py-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-[#735cf6] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-[#735cf6] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-[#735cf6] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map((suggestion, index) => {
                      const isAdded = isSuggestionAdded(suggestion, "option");
                      return (
                        <button
                          key={index}
                          onClick={() => handleAddSuggestion(suggestion, "option")}
                          disabled={isAdded}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            isAdded
                              ? "bg-[#735cf6] text-white cursor-default"
                              : "bg-[#735cf6]/10 border border-[#735cf6]/30 text-[#735cf6] hover:bg-[#735cf6]/20"
                          }`}
                        >
                          {suggestion} {isAdded && "✓"}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="bg-[#2c2c2c] border border-neutral-700 rounded-2xl p-4 flex flex-col gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddOption()}
                placeholder="Add an option..."
                className="bg-transparent text-neutral-400 text-base outline-none placeholder:text-neutral-400 w-full"
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
                onClick={handleMoveToCriteria}
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
      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-[402px] relative z-10">
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
