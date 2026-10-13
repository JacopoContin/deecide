"use client";

import { Badge, Button, Card, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import StepLayout from "./StepLayout";
import NavFooter from "./NavFooter";
import ScoreScale from "./ScoreScale";
import ScoreLegend from "./ScoreLegend";
import type { Score } from "../lib/decision";

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
  const getScore = (optionIndex: number, criterionIndex: number) =>
    scores.find((s) => s.optionIndex === optionIndex && s.criterionIndex === criterionIndex)?.score;

  const totalEvaluations = options.length * criteria.length;
  const completed = scores.length;

  return (
    <StepLayout
      title={decisionTitle}
      subtitle={`How does each option do on each criterion? ${completed}/${totalEvaluations} scored`}
      stepIndex={2}
      footer={
        <NavFooter
          onBack={onBack}
          onNext={onComplete}
          nextDisabled={completed < totalEvaluations}
          extra={
            onSwitchMode && (
              <Button variant="ghost" color="gray" size="2" onClick={onSwitchMode} className="self-center">
                <ChatBubbleIcon /> Describe in chat instead
              </Button>
            )
          }
        />
      }
    >
      <Flex direction="column" gap="4">
        <ScoreLegend />

        {options.map((option, optionIndex) => {
          const scoredForOption = criteria.filter(
            (_, criterionIndex) => getScore(optionIndex, criterionIndex) !== undefined
          ).length;

          return (
            <Card key={optionIndex} size="2">
              <Flex justify="between" align="start" gap="3" mb="3">
                <Heading as="h2" size="4" className="break-words min-w-0">
                  {option}
                </Heading>
                <Badge
                  color={scoredForOption === criteria.length ? "green" : "gray"}
                  variant="soft"
                  className="flex-shrink-0"
                >
                  {scoredForOption}/{criteria.length}
                </Badge>
              </Flex>

              <Flex direction="column" gap="3">
                {criteria.map((criterion, criterionIndex) => (
                  <Flex key={criterionIndex} direction="column" gap="2">
                    {criterionIndex > 0 && <Separator size="4" mb="1" />}
                    <Text size="2" weight="medium">
                      {criterion}
                    </Text>
                    <ScoreScale
                      label={`${option} — ${criterion}`}
                      value={getScore(optionIndex, criterionIndex)}
                      onChange={(value) => onScore(optionIndex, criterionIndex, value)}
                    />
                  </Flex>
                ))}
              </Flex>
            </Card>
          );
        })}
      </Flex>
    </StepLayout>
  );
}
