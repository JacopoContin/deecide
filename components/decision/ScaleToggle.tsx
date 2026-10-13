"use client";

import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type ScaleLevel = {
  value: number;
  // Big text on the button, e.g. "+1" or "4"
  display: string;
  label: string;
  description: string;
  className?: string;
};

type ScaleToggleProps = {
  levels: ScaleLevel[];
  value: number | undefined;
  onChange: (value: number) => void;
  label: string;
};

// Single-choice row of large tap targets, one per level, each showing a value and its meaning
export default function ScaleToggle({ levels, value, onChange, label }: ScaleToggleProps) {
  return (
    <ToggleGroup
      aria-label={label}
      variant="outline"
      spacing={2}
      value={value === undefined ? [] : [String(value)]}
      onValueChange={(next) => {
        // Single choice: ignore attempts to un-press the current value
        if (next.length > 0) onChange(Number(next[next.length - 1]));
      }}
      className="grid w-full"
      style={{ gridTemplateColumns: `repeat(${levels.length}, minmax(0, 1fr))` }}
    >
      {levels.map((level) => (
        <ToggleGroupItem
          key={level.value}
          value={String(level.value)}
          aria-label={`${level.display} ${level.description}`}
          title={level.description}
          className={cn(
            "h-auto min-h-16 min-w-0 flex-col justify-center gap-1 rounded-xl px-1 py-2.5 whitespace-normal pointer-coarse:h-auto",
            level.className
          )}
        >
          <span className="text-lg leading-none font-semibold tabular-nums">{level.display}</span>
          <span className="w-full text-xs leading-tight font-normal text-balance break-words">{level.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
