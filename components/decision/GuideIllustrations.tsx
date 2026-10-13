import type { SVGProps } from "react";

// Minimal 4:3 diagrams for the How it works panel. Drawn with theme tokens so they follow the theme:
// neutral shapes use the border color, the one thing each step is about uses primary.

type IllustrationProps = SVGProps<SVGSVGElement>;

function Frame({ children, ...props }: IllustrationProps) {
  return (
    <svg viewBox="0 0 240 180" fill="none" strokeWidth={1.5} aria-hidden {...props}>
      {children}
    </svg>
  );
}

// Three option cards side by side, equal footing
export function OptionsIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      {[36, 96, 156].map((x, i) => (
        <g key={x}>
          <rect x={x} y={50} width={48} height={80} rx={8} className={i === 1 ? "stroke-primary" : "stroke-border"} />
          <circle cx={x + 24} cy={76} r={8} className={i === 1 ? "fill-primary" : "fill-border"} />
          <rect x={x + 12} y={96} width={24} height={4} rx={2} className="fill-border" />
          <rect x={x + 16} y={106} width={16} height={4} rx={2} className="fill-border" />
        </g>
      ))}
    </Frame>
  );
}

// A matrix whose header row (the criteria) is highlighted
export function CriteriaIllustration(props: IllustrationProps) {
  const cols = [84, 128, 172];
  const rows = [80, 108, 136];
  return (
    <Frame {...props}>
      {cols.map((x) => (
        <rect key={x} x={x} y={40} width={36} height={20} rx={5} className="fill-primary" />
      ))}
      {rows.map((y) => (
        <g key={y}>
          <rect x={36} y={y} width={36} height={20} rx={5} className="stroke-border" />
          {cols.map((x) => (
            <rect key={x} x={x} y={y} width={36} height={20} rx={5} className="stroke-border" strokeDasharray="3 3" />
          ))}
        </g>
      ))}
    </Frame>
  );
}

// The same matrix with one cell being scored
export function ScoreIllustration(props: IllustrationProps) {
  const cols = [64, 108, 152];
  const rows = [44, 76, 108];
  return (
    <Frame {...props}>
      {rows.map((y, r) =>
        cols.map((x, c) => {
          const active = r === 1 && c === 1;
          const done = r === 0 || (r === 1 && c === 0);
          return (
            <g key={`${x}-${y}`}>
              <rect
                x={x}
                y={y}
                width={36}
                height={24}
                rx={6}
                className={active ? "fill-primary/15 stroke-primary" : "stroke-border"}
              />
              {(active || done) && (
                <circle cx={x + 18} cy={y + 12} r={4} className={active ? "fill-primary" : "fill-border"} />
              )}
            </g>
          );
        }),
      )}
      {/* A five-step scale under the active cell */}
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={96 + i * 12} cy={152} r={4} className={i === 3 ? "fill-primary" : "fill-border"} />
      ))}
    </Frame>
  );
}

// Criteria as bars of different weights
export function WeighIllustration(props: IllustrationProps) {
  const weights = [0.9, 0.45, 0.7, 0.25];
  return (
    <Frame {...props}>
      {weights.map((w, i) => {
        const y = 44 + i * 26;
        return (
          <g key={i}>
            <rect x={44} y={y + 3} width={24} height={6} rx={3} className="fill-border" />
            <rect x={80} y={y} width={116} height={12} rx={6} className="fill-border/50" />
            <rect x={80} y={y} width={116 * w} height={12} rx={6} className="fill-primary" opacity={0.4 + w * 0.6} />
          </g>
        );
      })}
    </Frame>
  );
}

// Weighted totals per option; the tallest wins
export function ResultsIllustration(props: IllustrationProps) {
  const totals = [0.55, 0.9, 0.4];
  return (
    <Frame {...props}>
      <line x1={48} y1={140} x2={192} y2={140} className="stroke-border" />
      {totals.map((t, i) => {
        const h = 90 * t;
        const x = 66 + i * 40;
        const winner = i === 1;
        return (
          <g key={i}>
            <rect x={x} y={140 - h} width={28} height={h} rx={6} className={winner ? "fill-primary" : "fill-border"} />
            {winner && (
              <path
                d={`M${x + 8} ${130 - h} l4 4 l8 -8`}
                className="stroke-primary"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </g>
        );
      })}
    </Frame>
  );
}
