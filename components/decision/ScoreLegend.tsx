"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "@/lib/icons";
import { SCORE_SCALE } from "@/lib/decision";
import ScoreBadge from "./ScoreBadge";

export default function ScoreLegend() {
  return (
    <Alert>
      <InfoIcon />
      <AlertTitle>How does each option affect a criterion?</AlertTitle>
      <AlertDescription>
        <ul className="mt-1 flex flex-col gap-1.5">
          {SCORE_SCALE.map((level) => (
            <li key={level.value} className="flex items-center gap-2">
              <ScoreBadge score={level.value} />
              <span>
                <span className="font-medium text-foreground">{level.label}</span> ·{" "}
                {level.description.toLowerCase()}
              </span>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
