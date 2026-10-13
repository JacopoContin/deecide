"use client";

import { Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Score } from "@/lib/decision";
import StepLayout from "./StepLayout";
import NavFooter from "./NavFooter";
import ScoreScale from "./ScoreScale";

type ManualEvaluationProps = {
  decisionTitle: string;
  options: string[];
  criteria: string[];
  scores: Score[];
  onScore: (optionIndex: number, criterionIndex: number, score: number) => void;
  onComplete: () => void;
  onBack: () => void;
};

export default function ManualEvaluation({
  decisionTitle,
  options,
  criteria,
  scores,
  onScore,
  onComplete,
  onBack,
}: ManualEvaluationProps) {
  const getScore = (optionIndex: number, criterionIndex: number) =>
    scores.find((s) => s.optionIndex === optionIndex && s.criterionIndex === criterionIndex)?.score;

  const totalEvaluations = options.length * criteria.length;
  const completed = scores.length;

  return (
    <StepLayout
      title={decisionTitle}
      subtitle={`Score every option on every criterion · ${completed}/${totalEvaluations} done`}
      stepIndex={2}
      footer={
        <NavFooter
          onBack={onBack}
          onNext={onComplete}
          nextDisabled={completed < totalEvaluations}
        />
      }
    >
      <div className="flex flex-col gap-4">
        {options.map((option, optionIndex) => {
          const scoredForOption = criteria.filter(
            (_, criterionIndex) => getScore(optionIndex, criterionIndex) !== undefined
          ).length;
          const done = scoredForOption === criteria.length;

          return (
            <Card key={optionIndex}>
              <CardHeader className="items-center">
                <CardTitle className="text-lg font-semibold break-words">{option}</CardTitle>
                <CardAction>
                  <Badge
                    variant="secondary"
                    className={done ? "bg-success/15 text-success-foreground tabular-nums" : "tabular-nums"}
                  >
                    {scoredForOption}/{criteria.length}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {criteria.map((criterion, criterionIndex) => (
                  <Fragment key={criterionIndex}>
                    {criterionIndex > 0 && <Separator />}
                    <div className="flex flex-col gap-2.5">
                      <p className="text-sm font-medium break-words">{criterion}</p>
                      <ScoreScale
                        label={`${option} — ${criterion}`}
                        value={getScore(optionIndex, criterionIndex)}
                        onChange={(value) => onScore(optionIndex, criterionIndex, value)}
                      />
                    </div>
                  </Fragment>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </StepLayout>
  );
}
