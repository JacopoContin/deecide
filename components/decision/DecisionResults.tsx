"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WinnerIcon } from "@/lib/icons";
import { DEFAULT_WEIGHT, formatSigned } from "@/lib/decision";
import StepLayout from "./StepLayout";
import NavFooter from "./NavFooter";
import QuadrantChart from "./QuadrantChart";

type DecisionResultsProps = {
  decisionTitle: string;
  options: string[];
  criteria: string[];
  getScore: (optionIndex: number, criterionIndex: number) => number | undefined;
  getWeight: (criterionIndex: number) => number | undefined;
  onBack: () => void;
  onRestart: () => void;
};

export default function DecisionResults({
  decisionTitle,
  options,
  criteria,
  getScore,
  getWeight,
  onBack,
  onRestart,
}: DecisionResultsProps) {
  const weightOf = (criterionIndex: number) => getWeight(criterionIndex) ?? DEFAULT_WEIGHT;
  const scoreOf = (optionIndex: number, criterionIndex: number) => getScore(optionIndex, criterionIndex) ?? 0;

  const ranking = options
    .map((option, optionIndex) => ({
      option,
      optionIndex,
      total: criteria.reduce((sum, _, ci) => sum + scoreOf(optionIndex, ci) * weightOf(ci), 0),
    }))
    .sort((a, b) => b.total - a.total);

  const topScore = ranking[0]?.total ?? 0;
  const winners = ranking.filter((r) => r.total === topScore);

  return (
    <StepLayout
      title={decisionTitle}
      stepIndex={4}
      width="wide"
      footer={<NavFooter onBack={onBack} onNext={onRestart} nextLabel="New decision" />}
    >
      <div className="flex flex-col gap-6">
        <Card className="items-center gap-1 bg-primary px-4 py-6 text-center text-primary-foreground ring-0">
          <p className="flex items-center gap-1.5 text-sm opacity-80">
            <WinnerIcon className="size-4" />
            {winners.length > 1 ? "It's a tie" : "Best option"}
          </p>
          <h2 className="font-heading text-3xl font-semibold break-words sm:text-4xl">
            {winners.map((w) => w.option).join(" & ")}
          </h2>
        </Card>

        <QuadrantChart
          ranking={ranking.map((r, rank) => ({ ...r, rank: rank + 1, isWinner: r.total === topScore }))}
          criteria={criteria}
          scoreOf={scoreOf}
          weightOf={weightOf}
        />

        {/* Ranked rows; the table scrolls sideways on narrow screens */}
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Option</TableHead>
                {criteria.map((criterion, ci) => (
                  <TableHead key={ci} className="text-center">
                    {criterion}
                  </TableHead>
                ))}
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking.map(({ option, optionIndex, total }) => {
                const isWinner = total === topScore;
                return (
                  <TableRow key={optionIndex}>
                    <TableCell className="font-medium">{option}</TableCell>
                    {criteria.map((_, ci) => (
                      <TableCell key={ci} className="text-center text-muted-foreground tabular-nums">
                        {formatSigned(scoreOf(optionIndex, ci))}
                      </TableCell>
                    ))}
                    <TableCell
                      className={cn(
                        "text-right font-semibold tabular-nums",
                        isWinner ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {formatSigned(total)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </StepLayout>
  );
}
