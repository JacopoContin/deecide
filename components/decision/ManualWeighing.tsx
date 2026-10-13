"use client";

import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChatIcon } from "@/lib/icons";
import { DEFAULT_WEIGHT, type Weight } from "@/lib/decision";
import StepLayout from "./StepLayout";
import NavFooter from "./NavFooter";
import WeightScale from "./WeightScale";

type ManualWeighingProps = {
  decisionTitle: string;
  criteria: string[];
  weights: Weight[];
  onWeight: (criterionIndex: number, weight: number) => void;
  onComplete: () => void;
  onBack: () => void;
  onSwitchMode?: () => void;
};

export default function ManualWeighing({
  decisionTitle,
  criteria,
  weights,
  onWeight,
  onComplete,
  onBack,
  onSwitchMode,
}: ManualWeighingProps) {
  const getWeight = (criterionIndex: number) => weights.find((w) => w.criterionIndex === criterionIndex)?.weight;
  const weighted = criteria.filter((_, i) => getWeight(i) !== undefined).length;

  return (
    <StepLayout
      title={decisionTitle}
      subtitle={`How important is each criterion? ${weighted}/${criteria.length} set`}
      stepIndex={3}
      footer={
        <NavFooter
          onBack={onBack}
          onNext={onComplete}
          nextLabel="See results"
          nextDisabled={weighted < criteria.length}
          extra={
            onSwitchMode && (
              <Button variant="ghost" onClick={onSwitchMode} className="self-center text-muted-foreground">
                <ChatIcon data-icon="inline-start" /> Describe in chat instead
              </Button>
            )
          }
        />
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="font-semibold">Importance</CardTitle>
          <CardDescription>1 = not important · 5 = extremely important</CardDescription>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => criteria.forEach((_, index) => onWeight(index, DEFAULT_WEIGHT))}
            >
              Weigh all equally
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {criteria.map((criterion, criterionIndex) => (
            <Fragment key={criterionIndex}>
              {criterionIndex > 0 && <Separator />}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">{criterion}</p>
                <WeightScale
                  label={`Importance of ${criterion}`}
                  value={getWeight(criterionIndex)}
                  onChange={(value) => onWeight(criterionIndex, value)}
                />
              </div>
            </Fragment>
          ))}
        </CardContent>
      </Card>
    </StepLayout>
  );
}
