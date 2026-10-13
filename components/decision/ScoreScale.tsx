"use client";

import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SCORE_SCALE, formatSigned, type ScoreLevel } from "@/lib/decision";

// Resting and pressed colours per tone, from the theme's status tokens
const toneClasses: Record<ScoreLevel["tone"], string> = {
  negative:
    "border-destructive/30 bg-destructive/5 text-destructive-foreground hover:bg-destructive/15 hover:text-destructive-foreground data-pressed:border-destructive data-pressed:bg-destructive data-pressed:text-white dark:data-pressed:text-background",
  neutral:
    "border-border bg-muted/40 text-muted-foreground hover:bg-muted data-pressed:border-foreground/40 data-pressed:bg-foreground/15 data-pressed:text-foreground",
  positive:
    "border-success/30 bg-success/5 text-success-foreground hover:bg-success/15 hover:text-success-foreground data-pressed:border-success data-pressed:bg-success data-pressed:text-white dark:data-pressed:text-background",
};

type ScoreScaleProps = {
  value: number | undefined;
  onChange: (value: number) => void;
  label: string;
};

// Tap-to-score control for the -1 … +2 scale: one large target per level, showing the number and its meaning
export default function ScoreScale({ value, onChange, label }: ScoreScaleProps) {
  return (
    <ToggleGroup
      aria-label={label}
      variant="outline"
      spacing={2}
      value={value === undefined ? [] : [String(value)]}
      onValueChange={(next) => {
        // Single choice: ignore attempts to un-press the current score
        if (next.length > 0) onChange(Number(next[next.length - 1]));
      }}
      className="grid w-full grid-cols-4"
    >
      {SCORE_SCALE.map((level) => (
        <ToggleGroupItem
          key={level.value}
          value={String(level.value)}
          aria-label={`${formatSigned(level.value)} ${level.label}`}
          title={level.description}
          className={cn(
            "h-auto min-h-14 flex-col gap-0.5 px-1 py-2 whitespace-normal pointer-coarse:h-auto",
            toneClasses[level.tone]
          )}
        >
          <span className="text-base leading-none font-semibold tabular-nums">{formatSigned(level.value)}</span>
          <span className="text-[11px] leading-tight font-normal">{level.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
