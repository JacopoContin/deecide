"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightIcon, ArrowUpIcon } from "@/lib/icons";
import { MAX_SCORE, MIN_SCORE, formatSigned } from "@/lib/decision";

export type RankedOption = {
  option: string;
  optionIndex: number;
  rank: number;
  isWinner: boolean;
};

type QuadrantChartProps = {
  ranking: RankedOption[];
  criteria: string[];
  scoreOf: (optionIndex: number, criterionIndex: number) => number;
  weightOf: (criterionIndex: number) => number;
};

// Opinionated split: the most important half of the criteria goes up, everything else goes right.
// Ties keep the order the user entered them in.
const splitByImportance = (count: number, weightOf: (criterionIndex: number) => number) => {
  const byWeight = Array.from({ length: count }, (_, i) => i).sort((a, b) => weightOf(b) - weightOf(a) || a - b);
  const top = byWeight.slice(0, Math.ceil(count / 2)).sort((a, b) => a - b);
  const rest = byWeight.slice(Math.ceil(count / 2)).sort((a, b) => a - b);
  return { yCriteria: top, xCriteria: rest };
};

// Inset the scale so dots at -1 or +2 sit inside the plot instead of on its edge
const PLOT_INSET = 8;
const percentOnScale = (value: number) =>
  PLOT_INSET + ((value - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * (100 - 2 * PLOT_INSET);
const ZERO = percentOnScale(0);

// Same position for several options: fan them out on a circle wide enough that the 28px dots don't touch
const DOT_GAP_PX = 15;
const fanRadius = (count: number) => (count > 1 ? DOT_GAP_PX / Math.sin(Math.PI / count) : 0);

function formatAverage(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return formatSigned(rounded);
}

function AxisValues({ x, y }: { x: number; y: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground tabular-nums">
      <ArrowUpIcon className="size-3" aria-label="vertical" /> {formatAverage(y)}
      <ArrowRightIcon className="ml-1.5 size-3" aria-label="horizontal" /> {formatAverage(x)}
    </span>
  );
}

function AxisTitle({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <p className="flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
      {icon} {label}
    </p>
  );
}

export default function QuadrantChart({ ranking, criteria, scoreOf, weightOf }: QuadrantChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (criteria.length < 2) return null;

  const { yCriteria, xCriteria } = splitByImportance(criteria.length, weightOf);

  // Weighted average of the option's scores on the criteria assigned to an axis (-1 … +2)
  const axisValue = (optionIndex: number, criteriaOnAxis: number[]) => {
    const totalWeight = criteriaOnAxis.reduce((sum, ci) => sum + weightOf(ci), 0);
    if (totalWeight === 0) return 0;
    return criteriaOnAxis.reduce((sum, ci) => sum + scoreOf(optionIndex, ci) * weightOf(ci), 0) / totalWeight;
  };

  const points = ranking.map((entry) => ({
    ...entry,
    x: axisValue(entry.optionIndex, xCriteria),
    y: axisValue(entry.optionIndex, yCriteria),
  }));

  const positionKey = (p: { x: number; y: number }) => `${p.x.toFixed(2)}:${p.y.toFixed(2)}`;
  const groups = new Map<string, number>();
  const placed = points.map((p) => {
    const key = positionKey(p);
    const slot = groups.get(key) ?? 0;
    groups.set(key, slot + 1);
    return { ...p, key, slot };
  });

  const axisLabel = (criteriaOnAxis: number[]) => criteriaOnAxis.map((ci) => criteria[ci]).join(" + ");

  const active = placed.find((p) => p.optionIndex === activeIndex);

  return (
    <Card>
      <CardContent className="flex flex-col gap-5">
        {/* Chart */}
        <figure className="flex flex-col gap-2">
          <figcaption className="sr-only">
            {`Options plotted by top priorities (${axisLabel(yCriteria)}, vertical) against everything else (${axisLabel(xCriteria)}, horizontal)`}
          </figcaption>

          <AxisTitle
            icon={<ArrowUpIcon className="size-3 shrink-0" />}
            label={axisLabel(yCriteria)}
          />

          <div className="flex items-stretch gap-2">
            {/* Vertical axis ticks */}
            <div className="relative w-6 shrink-0 text-right text-[11px] text-muted-foreground tabular-nums">
              <span className="absolute right-0 -translate-y-1/2" style={{ top: `${100 - percentOnScale(MAX_SCORE)}%` }}>
                {formatSigned(MAX_SCORE)}
              </span>
              <span className="absolute right-0 -translate-y-1/2" style={{ top: `${100 - ZERO}%` }}>
                0
              </span>
              <span className="absolute right-0 translate-y-1/2" style={{ bottom: `${percentOnScale(MIN_SCORE)}%` }}>
                {formatSigned(MIN_SCORE)}
              </span>
            </div>

            <div
              className="relative h-72 flex-1 rounded-lg border bg-muted/20 sm:h-96"
              onPointerLeave={() => setActiveIndex(null)}
            >
              {/* Quadrant tint: the "helps on both" corner */}
              <div
                className="absolute right-0 top-0 rounded-tr-lg bg-success/5"
                style={{ left: `${ZERO}%`, bottom: `${ZERO}%` }}
                aria-hidden
              />
              {/* Neutral lines at 0 */}
              <div className="absolute inset-y-0 w-px bg-border" style={{ left: `${ZERO}%` }} aria-hidden />
              <div className="absolute inset-x-0 h-px bg-border" style={{ bottom: `${ZERO}%` }} aria-hidden />

              {placed.map((p) => {
                const count = groups.get(p.key) ?? 1;
                const angle = (2 * Math.PI * p.slot) / count;
                const dx = Math.cos(angle) * fanRadius(count);
                const dy = Math.sin(angle) * fanRadius(count);
                const isActive = activeIndex === p.optionIndex;
                return (
                  <button
                    key={p.optionIndex}
                    type="button"
                    aria-label={`${p.rank}. ${p.option}: ${formatAverage(p.y)} vertical, ${formatAverage(p.x)} horizontal`}
                    onPointerEnter={() => setActiveIndex(p.optionIndex)}
                    onFocus={() => setActiveIndex(p.optionIndex)}
                    onClick={() => setActiveIndex(isActive ? null : p.optionIndex)}
                    className="absolute grid size-11 -translate-x-1/2 translate-y-1/2 cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    style={{
                      left: `calc(${percentOnScale(p.x)}% + ${dx}px)`,
                      bottom: `calc(${percentOnScale(p.y)}% + ${dy}px)`,
                      zIndex: isActive ? 20 : 10 - p.rank,
                    }}
                  >
                    <span
                      className={cn(
                        "grid size-7 place-items-center rounded-full text-xs font-semibold tabular-nums ring-2 ring-card transition-transform",
                        p.isWinner ? "bg-primary text-primary-foreground" : "bg-foreground/80 text-background",
                        isActive && "scale-125"
                      )}
                    >
                      {p.rank}
                    </span>
                  </button>
                );
              })}

              {/* Tooltip for the hovered / tapped dot */}
              {active && (
                <div
                  role="status"
                  className="pointer-events-none absolute z-30 w-max max-w-48 rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-md"
                  style={{
                    left: `clamp(0px, calc(${percentOnScale(active.x)}% - 4rem), calc(100% - 12rem))`,
                    ...(active.y > (MIN_SCORE + MAX_SCORE) / 2
                      ? { top: `calc(${100 - percentOnScale(active.y)}% + 1.5rem)` }
                      : { bottom: `calc(${percentOnScale(active.y)}% + 1.5rem)` }),
                  }}
                >
                  <p className="font-medium">
                    {active.rank}. {active.option}
                  </p>
                  <AxisValues x={active.x} y={active.y} />
                </div>
              )}
            </div>
          </div>

          {/* Horizontal axis ticks */}
          <div className="ml-8 flex flex-col gap-1">
            <div className="relative h-4 text-[11px] text-muted-foreground tabular-nums">
              <span className="absolute -translate-x-1/2" style={{ left: `${percentOnScale(MIN_SCORE)}%` }}>
                {formatSigned(MIN_SCORE)}
              </span>
              <span className="absolute -translate-x-1/2" style={{ left: `${ZERO}%` }}>
                0
              </span>
              <span className="absolute -translate-x-1/2" style={{ left: `${percentOnScale(MAX_SCORE)}%` }}>
                {formatSigned(MAX_SCORE)}
              </span>
            </div>
            <AxisTitle
              icon={<ArrowRightIcon className="size-3 shrink-0" />}
              label={axisLabel(xCriteria)}
            />
          </div>
        </figure>

        {/* Legend: identity comes from the number, never colour alone */}
        <ol className="grid grid-cols-1 gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {points.map((p) => (
            <li key={p.optionIndex} className="flex items-center gap-2">
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums",
                  p.isWinner ? "bg-primary text-primary-foreground" : "bg-foreground/80 text-background"
                )}
              >
                {p.rank}
              </span>
              <span className="min-w-0 flex-1 break-words">{p.option}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
