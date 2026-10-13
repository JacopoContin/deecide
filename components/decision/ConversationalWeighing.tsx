"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Suggestion, Suggestions } from "@/components/ai/suggestions";
import { SettingsIcon } from "@/lib/icons";
import { DEFAULT_WEIGHT, MAX_WEIGHT, MIN_WEIGHT } from "@/lib/decision";
import ChatInterface, { type ChatMessage } from "./ChatInterface";
import StepLayout from "./StepLayout";
import NavFooter from "./NavFooter";

type ConversationalWeighingProps = {
  decisionTitle: string;
  criteria: string[];
  onWeight: (criterionIndex: number, weight: number) => void;
  onComplete: () => void;
  onBack: () => void;
  // True when returning to this step with weights already set
  alreadyWeighted?: boolean;
  onSwitchMode?: () => void;
};

export default function ConversationalWeighing({
  decisionTitle,
  criteria,
  onWeight,
  onComplete,
  onBack,
  alreadyWeighted = false,
  onSwitchMode,
}: ConversationalWeighingProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: "assistant",
      content: `Now let's decide how much each criterion matters (${MIN_WEIGHT} = not important, ${MAX_WEIGHT} = extremely important):\n\n${criteria
        .map((c, i) => `${i + 1}. ${c}`)
        .join(
          "\n"
        )}\n\nTell me which ones matter most. For example: "Price is crucial, design matters less" or "They're all equally important."`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasWeights, setHasWeights] = useState(alreadyWeighted);

  const handleSendMessage = async (userMessage: string) => {
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage, criteria }),
      });

      const data = await response.json();
      if (!response.ok || !Array.isArray(data.weights)) {
        throw new Error(data.error || `API error: ${response.status}`);
      }

      data.weights.forEach((w: { criterionIndex: number; weight: number }) => {
        onWeight(w.criterionIndex, w.weight);
      });

      const weightSummary = data.weights
        .map(
          (w: { criterionIndex: number; weight: number; reasoning: string }) =>
            `• ${criteria[w.criterionIndex]}: ${w.weight}/${MAX_WEIGHT}${w.reasoning ? ` — ${w.reasoning}` : ""}`
        )
        .join("\n");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Here's how I've weighted your criteria:\n\n${weightSummary}\n\n${
            data.summary || ""
          }\n\nTap Continue to see your results, or tell me what to adjust.`,
        },
      ]);
      setHasWeights(true);
    } catch (error) {
      console.error("Weight parsing error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I had trouble understanding that. Could you tell me again which criteria matter most? Or tap "Weigh all equally" below.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const weighEqually = () => {
    criteria.forEach((_, index) => onWeight(index, DEFAULT_WEIGHT));
    onComplete();
  };

  return (
    <StepLayout
      title={decisionTitle}
      subtitle="How important is each criterion?"
      stepIndex={3}
      fixedBody
      footer={
        <NavFooter
          onBack={onBack}
          onNext={onComplete}
          nextLabel="See results"
          nextDisabled={!hasWeights || isLoading}
          extra={
            onSwitchMode && (
              <Button variant="ghost" onClick={onSwitchMode} className="self-center text-muted-foreground">
                <SettingsIcon data-icon="inline-start" /> Weigh with buttons instead
              </Button>
            )
          }
        />
      }
    >
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        placeholder="Tell me what's important…"
        isLoading={isLoading}
        quickReplies={
          !hasWeights && (
            <Suggestions>
              <Suggestion suggestion="Weigh all equally" onSelect={weighEqually} disabled={isLoading} />
            </Suggestions>
          )
        }
      />
    </StepLayout>
  );
}
