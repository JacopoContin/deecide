"use client";

import { SCORE_SCALE } from "@/lib/decision";
import ScaleLegend from "./ScaleLegend";
import ScoreBadge from "./ScoreBadge";

export default function ScoreLegend() {
  return (
    <ScaleLegend
      title="How does each option affect a criterion?"
      items={SCORE_SCALE.map((level) => ({
        key: level.value,
        badge: <ScoreBadge score={level.value} />,
        label: level.label,
        description: level.description,
      }))}
    />
  );
}
