"use client";

import { useState, useEffect } from "react";
import ChatInterface from "./ChatInterface";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ConversationalWeighingProps = {
  decisionTitle: string;
  criteria: string[];
  onWeight: (criterionIndex: number, weight: number) => void;
  onComplete: () => void;
  onBack: () => void;
};

export default function ConversationalWeighing({
  decisionTitle,
  criteria,
  onWeight,
  onComplete,
  onBack,
}: ConversationalWeighingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize first question
  useEffect(() => {
    if (messages.length === 0) {
      const criteriaList = criteria.map((c, i) => `${i + 1}. ${c}`).join('\n');
      setMessages([
        {
          role: "assistant",
          content: `Now let's assign importance to each criterion. Here are your criteria:\n\n${criteriaList}\n\nTell me which ones matter most to you. For example: "Price and convenience are very important, but design is less critical" or "They're all equally important."`,
        },
      ]);
    }
  }, [criteria, messages.length]);

  const handleSendMessage = async (userMessage: string) => {
    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Call AI to parse weights
      const response = await fetch("/api/ai/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage,
          criteria,
        }),
      });

      const data = await response.json();

      if (data.weights && Array.isArray(data.weights)) {
        // Apply all weights
        data.weights.forEach((w: { criterionIndex: number; weight: number }) => {
          onWeight(w.criterionIndex, w.weight);
        });

        // Show confirmation with weights
        const weightSummary = data.weights
          .map((w: { criterionIndex: number; weight: number; reasoning: string }) =>
            `• ${criteria[w.criterionIndex]}: ${w.weight}/5 - ${w.reasoning}`
          )
          .join('\n');

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Perfect! Here's how I've weighted your criteria:\n\n${weightSummary}\n\n${data.summary || ""}\n\nReady to see your results!`,
          },
        ]);

        setIsComplete(true);

        // Auto-advance after a short delay
        setTimeout(() => {
          onComplete();
        }, 3000);
      }
    } catch (error) {
      console.error("Weight parsing error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble understanding that. Could you tell me again which criteria are most important to you?",
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
            Weighting criteria
          </p>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            placeholder={isComplete ? "Moving to results..." : "Tell me what's important..."}
            isLoading={isLoading}
          />
        </div>

        {/* Back button */}
        <div className="flex-shrink-0 pt-2 pb-4 bg-[#292929]">
          <button
            onClick={onBack}
            disabled={isComplete}
            className="w-full bg-neutral-700 text-white py-3 px-4 rounded-xl hover:bg-neutral-600 transition-colors text-sm font-medium disabled:opacity-50"
          >
            Back to Evaluation
          </button>
        </div>
      </div>
    </div>
  );
}
