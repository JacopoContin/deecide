"use client";

import { useState } from "react";
import { Button, Flex, Text } from "@radix-ui/themes";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import ChatInterface, { type Message } from "./ChatInterface";
import StepLayout from "./StepLayout";
import NavFooter from "./NavFooter";
import { SCORE_SCALE, formatSigned, getScoreLevel } from "../lib/decision";

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

  const [messages, setMessages] = useState<Message[]>(() => [
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
              <Button variant="ghost" color="gray" size="2" onClick={onSwitchMode} className="self-center">
                <MixerHorizontalIcon /> Score with buttons instead
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
            <Flex gap="2" align="center" wrap="wrap">
              <Text size="1" color="gray">
                Quick score:
              </Text>
              {SCORE_SCALE.map((level) => (
                <Button
                  key={level.value}
                  size="1"
                  variant="soft"
                  color={level.color}
                  disabled={isLoading}
                  onClick={() => handleQuickScore(level.value)}
                  title={level.label}
                >
                  {formatSigned(level.value)} {level.label}
                </Button>
              ))}
            </Flex>
          )
        }
      />
    </StepLayout>
  );
}
