"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDownIcon, SparkleIcon, WinnerIcon } from "@/lib/icons";
import { DEFAULT_WEIGHT, MAX_SCORE, MIN_SCORE, formatSigned } from "@/lib/decision";
import StepLayout from "./StepLayout";
import NavFooter from "./NavFooter";
import ScoreBadge from "./ScoreBadge";
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
  const [expanded, setExpanded] = useState<number | null>(null);

  const weightOf = (criterionIndex: number) => getWeight(criterionIndex) ?? DEFAULT_WEIGHT;
  const scoreOf = (optionIndex: number, criterionIndex: number) => getScore(optionIndex, criterionIndex) ?? 0;

  const totalWeight = criteria.reduce((sum, _, i) => sum + weightOf(i), 0);
  const minTotal = totalWeight * MIN_SCORE;
  const maxTotal = totalWeight * MAX_SCORE;

  const ranking = options
    .map((option, optionIndex) => ({
      option,
      optionIndex,
      total: criteria.reduce((sum, _, ci) => sum + scoreOf(optionIndex, ci) * weightOf(ci), 0),
    }))
    .sort((a, b) => b.total - a.total);

  const topScore = ranking[0]?.total ?? 0;
  const winners = ranking.filter((r) => r.total === topScore);
  const isTie = winners.length > 1;
  const percentOf = (total: number) =>
    maxTotal === minTotal ? 0 : Math.round(((total - minTotal) / (maxTotal - minTotal)) * 100);

  return (
    <StepLayout
      title={decisionTitle}
      subtitle="Your decision matrix"
      stepIndex={4}
      width="wide"
      footer={<NavFooter onBack={onBack} onNext={onRestart} nextLabel="New decision" />}
    >
      <div className="flex flex-col gap-6">
        {/* Winner */}
        <Card className="items-center gap-1 bg-primary px-4 py-6 text-center text-primary-foreground ring-0">
          <p className="flex items-center gap-1.5 text-sm opacity-80">
            <WinnerIcon className="size-4" />
            {isTie ? "It's a tie between" : "Best option"}
          </p>
          <h2 className="font-heading text-3xl font-semibold break-words sm:text-4xl">
            {winners.map((w) => w.option).join(" & ")}
          </h2>
          <p className="text-sm opacity-80">
            Weighted score {formatSigned(topScore)} · possible range {minTotal} to +{maxTotal}
          </p>
        </Card>

        {/* AI analysis: switched off until the explain endpoint works again */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <SparkleIcon className="size-4" /> AI analysis
            </CardTitle>
            <CardDescription>A written explanation of why this option came out on top.</CardDescription>
            <CardAction>
              <Badge variant="secondary">Coming soon</Badge>
            </CardAction>
          </CardHeader>
        </Card>

        {/* Ranking: works on every screen size, with a per-option breakdown */}
        <section className="flex flex-col gap-2">
          <h3 className="font-heading font-medium">Ranking</h3>
          <ol className="flex flex-col gap-2">
            {ranking.map(({ option, optionIndex, total }, rank) => {
              const isWinner = total === topScore;
              return (
                <li key={optionIndex}>
                  <Collapsible
                    open={expanded === optionIndex}
                    onOpenChange={(open) => setExpanded(open ? optionIndex : null)}
                  >
                    <Card size="sm" className="gap-0 py-0">
                      <CollapsibleTrigger className="group/trigger flex w-full cursor-pointer items-center gap-3 p-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                        <Badge variant={isWinner ? "default" : "secondary"} className="size-6 rounded-full tabular-nums">
                          {rank + 1}
                        </Badge>
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="min-w-0 font-medium break-words">{option}</span>
                            <span
                              className={cn(
                                "text-base font-semibold tabular-nums",
                                isWinner ? "text-foreground" : "text-muted-foreground"
                              )}
                            >
                              {formatSigned(total)}
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn("h-full rounded-full", isWinner ? "bg-primary" : "bg-muted-foreground/50")}
                              style={{ width: `${percentOf(total)}%` }}
                            />
                          </div>
                        </div>
                        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]/trigger:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <dl className="flex flex-col gap-2 border-t p-3">
                          {criteria.map((criterion, ci) => {
                            const score = scoreOf(optionIndex, ci);
                            const weight = weightOf(ci);
                            return (
                              <div key={ci} className="flex items-center justify-between gap-2">
                                <dt className="min-w-0 break-words text-muted-foreground">{criterion}</dt>
                                <dd className="flex shrink-0 items-center gap-2">
                                  <ScoreBadge score={score} />
                                  <span className="text-xs text-muted-foreground">× {weight} =</span>
                                  <span className="w-8 text-right font-medium tabular-nums">
                                    {formatSigned(score * weight)}
                                  </span>
                                </dd>
                              </div>
                            );
                          })}
                        </dl>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </li>
              );
            })}
          </ol>
        </section>

        <QuadrantChart
          ranking={ranking.map((r, rank) => ({ ...r, rank: rank + 1, isWinner: r.total === topScore }))}
          criteria={criteria}
          scoreOf={scoreOf}
          weightOf={weightOf}
        />

        {/* Full matrix: only on larger screens, where a wide table fits */}
        <section className="hidden flex-col gap-2 sm:flex">
          <h3 className="font-heading font-medium">Full matrix</h3>
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Option</TableHead>
                  {criteria.map((criterion, ci) => (
                    <TableHead key={ci} className="text-center">
                      <div className="flex flex-col items-center gap-1 py-2">
                        <span className="whitespace-normal">{criterion}</span>
                        <Badge variant="outline" className="font-normal text-muted-foreground">
                          weight {weightOf(ci)}
                        </Badge>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {options.map((option, optionIndex) => {
                  const total = ranking.find((r) => r.optionIndex === optionIndex)?.total ?? 0;
                  const isWinner = total === topScore;
                  return (
                    <TableRow key={optionIndex} className={isWinner ? "bg-primary/10 hover:bg-primary/15" : undefined}>
                      <TableCell className="font-medium whitespace-normal">{option}</TableCell>
                      {criteria.map((_, ci) => {
                        const score = scoreOf(optionIndex, ci);
                        return (
                          <TableCell key={ci} className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <ScoreBadge score={score} />
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {formatSigned(score * weightOf(ci))}
                              </span>
                            </div>
                          </TableCell>
                        );
                      })}
                      <TableCell
                        className={cn(
                          "text-right text-base font-semibold tabular-nums",
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
        </section>
      </div>
    </StepLayout>
  );
}
