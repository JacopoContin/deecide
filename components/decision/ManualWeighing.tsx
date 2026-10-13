"use client";

import { Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChatIcon } from "@/lib/icons";
import { DEFAULT_WEIGHT, type Weight } from "@/lib/decision";
import StepLayout from "./StepLayout";
import NavFooter from "./NavFooter";
import WeightLegend from "./WeightLegend";
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
  const done = weighted === criteria.length;

  return (
    <StepLayout
      title={decisionTitle}
      subtitle={`Rate how important each criterion is · ${weighted}/${criteria.length} done`}
      stepIndex={3}
      footer={
        <NavFooter
          onBack={onBack}
          onNext={onComplete}
          nextLabel="See results"
          nextDisabled={!done}
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
      <div className="flex flex-col gap-4">
        <WeightLegend />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Importance</CardTitle>
            <CardAction>
              <Badge
                variant="secondary"
                className={done ? "bg-success/15 text-success-foreground tabular-nums" : "tabular-nums"}
              >
                {weighted}/{criteria.length}
              </Badge>
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

        <Button
          variant="outline"
          onClick={() => criteria.forEach((_, index) => onWeight(index, DEFAULT_WEIGHT))}
          className="self-center"
        >
          Weigh all equally
        </Button>
      </div>
    </StepLayout>
  );
}
