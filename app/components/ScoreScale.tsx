"use client";

import { SCORE_SCALE, formatSigned } from "../lib/decision";

type ScoreScaleProps = {
  value: number | undefined;
  onChange: (value: number) => void;
  label: string;
};

// Tap-to-score control for the -1 … +2 scale. Each level is a large touch target
// showing both the number and its meaning, coloured from detrimental to very positive.
export default function ScoreScale({ value, onChange, label }: ScoreScaleProps) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-4 gap-2">
      {SCORE_SCALE.map((level) => {
        const selected = value === level.value;
        return (
          <button
            key={level.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${formatSigned(level.value)} ${level.label}`}
            title={level.description}
            onClick={() => onChange(level.value)}
            data-accent-color={level.color}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-[var(--radius-3)] px-1 py-2 min-h-[56px] transition-colors cursor-pointer border focus-visible:outline-2 focus-visible:outline-[var(--accent-8)] ${
              selected
                ? "bg-[var(--accent-9)] border-[var(--accent-9)] text-[var(--accent-contrast)]"
                : "bg-[var(--accent-a2)] border-[var(--accent-a5)] text-[var(--accent-11)] hover:bg-[var(--accent-a4)]"
            }`}
          >
            <span className="text-base font-bold leading-none">{formatSigned(level.value)}</span>
            <span className="text-[11px] leading-tight text-center">{level.label}</span>
          </button>
        );
      })}
    </div>
  );
}
