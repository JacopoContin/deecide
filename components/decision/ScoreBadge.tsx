import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatSigned, getScoreLevel, type ScoreLevel } from "@/lib/decision";

const toneClasses: Record<ScoreLevel["tone"], string> = {
  negative: "bg-destructive/15 text-destructive-foreground",
  neutral: "bg-muted text-muted-foreground",
  positive: "bg-success/15 text-success-foreground",
};

export default function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const tone = getScoreLevel(score)?.tone ?? (score > 0 ? "positive" : score < 0 ? "negative" : "neutral");
  return (
    <Badge variant="secondary" className={cn("min-w-8 tabular-nums", toneClasses[tone], className)}>
      {formatSigned(score)}
    </Badge>
  );
}
