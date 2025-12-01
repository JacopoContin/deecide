"use client";

import { useState, useEffect } from "react";
import ChatInterface from "./ChatInterface";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ConversationalEvaluationProps = {
  decisionTitle: string;
  options: string[];
  criteria: string[];
  onScore: (optionIndex: number, criterionIndex: number, score: number) => void;
  onComplete: () => void;
  onBack: () => void;
  currentScores: Array<{ optionIndex: number; criterionIndex: number; score: number }>;
  onSwitchMode?: () => void;
};

export default function ConversationalEvaluation({
  decisionTitle,
  options,
  criteria,
  onScore,
  onComplete,
  onBack,
  currentScores,
  onSwitchMode,
}: ConversationalEvaluationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentEvaluationIndex, setCurrentEvaluationIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const totalEvaluations = options.length * criteria.length;

  // Calculate current option and criterion
  const getCurrentPair = (index: number) => {
    const optionIndex = Math.floor(index / criteria.length);
    const criterionIndex = index % criteria.length;
    return { optionIndex, criterionIndex };
  };

  // Initialize first question
  useEffect(() => {
    if (messages.length === 0) {
      const { optionIndex, criterionIndex } = getCurrentPair(currentEvaluationIndex);
      setMessages([
        {
          role: "assistant",
          content: `Let's evaluate "${options[optionIndex]}" based on "${criteria[criterionIndex]}".\n\nHow would you rate this? Feel free to describe in your own words.`,
        },
      ]);
    }
  }, []);

  const handleSendMessage = async (userMessage: string) => {
    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { optionIndex, criterionIndex } = getCurrentPair(currentEvaluationIndex);

      // Call AI to parse evaluation
      const response = await fetch("/api/ai/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage,
          option: options[optionIndex],
          criterion: criteria[criterionIndex],
        }),
      });

      const data = await response.json();

      if (data.score) {
        // Record the score
        onScore(optionIndex, criterionIndex, data.score);

        // Move to next evaluation
        const nextIndex = currentEvaluationIndex + 1;

        if (nextIndex < totalEvaluations) {
          // Ask next question
          const { optionIndex: nextOptIdx, criterionIndex: nextCritIdx } =
            getCurrentPair(nextIndex);

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Got it! Scored ${data.score}/5. ${data.reasoning || ""}\n\nNext: Let's evaluate "${options[nextOptIdx]}" based on "${criteria[nextCritIdx]}".\n\nHow would you rate this?`,
            },
          ]);

          setCurrentEvaluationIndex(nextIndex);
        } else {
          // All done
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Perfect! Scored ${data.score}/5. ${data.reasoning || ""}\n\nAll evaluations complete! Ready to move to weighting.`,
            },
          ]);

          // Auto-advance after a short delay
          setTimeout(() => {
            onComplete();
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Evaluation error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble understanding that. Could you rephrase your evaluation?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

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
            Evaluating options ({currentEvaluationIndex}/{totalEvaluations})
          </p>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            placeholder="Type your evaluation..."
            isLoading={isLoading}
          />
        </div>

        {/* Action buttons */}
        <div className="flex-shrink-0 pt-2 pb-4 bg-[#292929]">
          {onSwitchMode && (
            <button
              onClick={onSwitchMode}
              className="w-full mb-2 bg-neutral-800 text-neutral-300 py-2 px-4 rounded-xl hover:bg-neutral-700 transition-colors text-xs font-medium"
            >
              Switch to Slider Mode 🎚️
            </button>
          )}
          <button
            onClick={onBack}
            className="w-full bg-neutral-700 text-white py-3 px-4 rounded-xl hover:bg-neutral-600 transition-colors text-sm font-medium"
          >
            Back to Criteria
          </button>
        </div>
      </div>
    </div>
  );
}
