"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Suggestion, Suggestions } from "@/components/ai/suggestions";
import { SettingsIcon } from "@/lib/icons";
import { SCORE_SCALE, formatSigned, getScoreLevel } from "@/lib/decision";
import ChatInterface, { type ChatMessage } from "./ChatInterface";
import StepLayout from "./StepLayout";
import NavFooter from "./NavFooter";

type ConversationalEvaluationProps = {
  decisionTitle: string;
  options: string[];
  criteria: string[];
  onScore: (optionIndex: number, criterionIndex: number, score: number) => void;
  onComplete: () => void;
  onBack: () => void;
  onSwitchMode?: () => void;
};

const scaleHint = SCORE_SCALE.map((level) => `${formatSigned(level.value)} ${level.label.toLowerCase()}`).join(
  " · "
);

export default function ConversationalEvaluation({
  decisionTitle,
  options,
  criteria,
  onScore,
  onComplete,
  onBack,
  onSwitchMode,
}: ConversationalEvaluationProps) {
  const totalEvaluations = options.length * criteria.length;

  const getPair = (index: number) => ({
    optionIndex: Math.floor(index / criteria.length),
    criterionIndex: index % criteria.length,
  });

  const askAbout = (index: number) => {
    const { optionIndex, criterionIndex } = getPair(index);
    return `How does "${options[optionIndex]}" affect "${criteria[criterionIndex]}"?\n\nDescribe it in your own words, or tap a score below.`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: "assistant",
      content: `Let's score each option. The scale is:\n${scaleHint}\n\n${askAbout(0)}`,
    },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const isComplete = currentIndex >= totalEvaluations;

  const recordScore = (score: number, reasoning?: string) => {
    const { optionIndex, criterionIndex } = getPair(currentIndex);
    onScore(optionIndex, criterionIndex, score);

    const level = getScoreLevel(score);
    const scored = `Scored ${formatSigned(score)} (${level?.label ?? "Neutral"}).${reasoning ? ` ${reasoning}` : ""}`;
    const nextIndex = currentIndex + 1;

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          nextIndex < totalEvaluations
            ? `${scored}\n\nNext: ${askAbout(nextIndex)}`
            : `${scored}\n\nAll evaluations complete! Continue to weigh your criteria.`,
      },
    ]);
    setCurrentIndex(nextIndex);
  };

  const handleQuickScore = (score: number) => {
    const level = getScoreLevel(score);
    setMessages((prev) => [...prev, { role: "user", content: `${formatSigned(score)} ${level?.label}` }]);
    recordScore(score);
  };

  const handleSendMessage = async (userMessage: string) => {
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { optionIndex, criterionIndex } = getPair(currentIndex);
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
      if (!response.ok || typeof data.score !== "number") {
        throw new Error(data.error || "Invalid response");
      }

      recordScore(data.score, data.reasoning);
    } catch (error) {
      console.error("Evaluation error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble understanding that. Could you rephrase, or tap one of the scores below?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StepLayout
      title={decisionTitle}
      subtitle={`Evaluating options · ${Math.min(currentIndex, totalEvaluations)}/${totalEvaluations} scored`}
      stepIndex={2}
      fixedBody
      footer={
        <NavFooter
          onBack={onBack}
          onNext={onComplete}
          nextDisabled={!isComplete}
          extra={
            onSwitchMode && (
              <Button variant="ghost" onClick={onSwitchMode} className="self-center text-muted-foreground">
                <SettingsIcon data-icon="inline-start" /> Score with buttons instead
              </Button>
            )
          }
        />
      }
    >
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        placeholder={isComplete ? "All done!" : "e.g. it's great for this…"}
        isLoading={isLoading}
        disabled={isComplete}
        quickReplies={
          !isComplete && (
            <Suggestions aria-label="Quick score">
              {SCORE_SCALE.map((level) => (
                <Suggestion
                  key={level.value}
                  suggestion={String(level.value)}
                  onSelect={() => handleQuickScore(level.value)}
                  disabled={isLoading}
                  title={level.description}
                >
                  <span className="font-semibold tabular-nums text-foreground">{formatSigned(level.value)}</span>{" "}
                  {level.label}
                </Suggestion>
              ))}
            </Suggestions>
          )
        }
      />
    </StepLayout>
  );
}
