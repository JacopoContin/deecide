"use client";

import { SCORE_SCALE, formatSigned, type ScoreLevel } from "@/lib/decision";
import ScaleToggle, { type ScaleLevel } from "./ScaleToggle";

// Resting and pressed colours per tone, from the theme's status tokens
const toneClasses: Record<ScoreLevel["tone"], string> = {
  negative:
    "border-destructive/30 bg-destructive/5 text-destructive-foreground hover:bg-destructive/15 hover:text-destructive-foreground data-pressed:border-destructive data-pressed:bg-destructive data-pressed:text-white dark:data-pressed:text-background",
  neutral:
    "border-border bg-muted/40 text-muted-foreground hover:bg-muted data-pressed:border-foreground/40 data-pressed:bg-foreground/15 data-pressed:text-foreground",
  positive:
    "border-success/30 bg-success/5 text-success-foreground hover:bg-success/15 hover:text-success-foreground data-pressed:border-success data-pressed:bg-success data-pressed:text-white dark:data-pressed:text-background",
};

const levels: ScaleLevel[] = SCORE_SCALE.map((level) => ({
  value: level.value,
  display: formatSigned(level.value),
  label: level.label,
  description: level.description,
  className: toneClasses[level.tone],
}));

type ScoreScaleProps = {
  value: number | undefined;
  onChange: (value: number) => void;
  label: string;
};

// Tap-to-score control for the -1 … +2 scale
export default function ScoreScale(props: ScoreScaleProps) {
  return <ScaleToggle levels={levels} {...props} />;
}
