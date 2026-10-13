"use client";

import { WEIGHT_SCALE } from "@/lib/decision";
import ScaleToggle, { type ScaleLevel } from "./ScaleToggle";

const levels: ScaleLevel[] = WEIGHT_SCALE.map((level) => ({
  value: level.value,
  display: String(level.value),
  label: level.label,
  description: level.description,
  className:
    // Neutral at rest like the score scale, filled with the primary colour once chosen
    "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground data-pressed:border-primary data-pressed:bg-primary data-pressed:text-primary-foreground",
}));

type WeightScaleProps = {
  value: number | undefined;
  onChange: (value: number) => void;
  label: string;
};

// Tap-to-weigh control for criterion importance, 1 (not important) to 5 (extremely important)
export default function WeightScale(props: WeightScaleProps) {
  return <ScaleToggle levels={levels} {...props} />;
}
