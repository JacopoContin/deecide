"use client";

import { useState } from "react";
import { Badge, Box, Card, Flex, Heading, Table, Text } from "@radix-ui/themes";
import { ChevronDownIcon, ChevronUpIcon, MagicWandIcon } from "@radix-ui/react-icons";
import StepLayout from "./StepLayout";
import NavFooter from "./NavFooter";
import LoadingIndicator from "./LoadingIndicator";
import { DEFAULT_WEIGHT, MAX_SCORE, MIN_SCORE, formatSigned, getScoreLevel } from "../lib/decision";

type DecisionResultsProps = {
  decisionTitle: string;
  options: string[];
  criteria: string[];
  getScore: (optionIndex: number, criterionIndex: number) => number | undefined;
  getWeight: (criterionIndex: number) => number | undefined;
  aiExplanation: string;
  isLoadingExplanation: boolean;
  onBack: () => void;
  onRestart: () => void;
};

function ScoreBadge({ score }: { score: number }) {
  const level = getScoreLevel(score);
  return (
    <Badge color={level?.color ?? "gray"} variant="soft" className="min-w-8 justify-center">
      {formatSigned(score)}
    </Badge>
  );
}

export default function DecisionResults({
  decisionTitle,
  options,
  criteria,
  getScore,
  getWeight,
  aiExplanation,
  isLoadingExplanation,
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
      footer={
<NavFooter onBack={onBack} onNext={onRestart} nextLabel="New decision" />
      }
    >
      <Flex direction="column" gap="4">
        {/* Winner */}
        <Card size="3" className="!bg-[var(--accent-9)]">
          <Flex direction="column" align="center" gap="1" className="text-[var(--accent-contrast)] text-center">
            <Text size="2" className="opacity-80">
              {isTie ? "It's a tie between" : "Best option"}
            </Text>
            <Heading as="h2" size={{ initial: "6", sm: "8" }} className="break-words">
              {winners.map((w) => w.option).join(" & ")}
            </Heading>
            <Text size="2" className="opacity-80">
              Weighted score {formatSigned(topScore)} · range {minTotal} to +{maxTotal}
            </Text>
          </Flex>
        </Card>

        {/* AI analysis */}
        {(aiExplanation || isLoadingExplanation) && (
          <Card size="2">
            <Flex align="center" gap="2" mb="2">
              <MagicWandIcon color="var(--accent-11)" />
              <Heading as="h3" size="3">
                AI analysis
              </Heading>
            </Flex>
            {isLoadingExplanation ? (
              <LoadingIndicator label="Analysing your results…" />
            ) : (
              <Text as="p" size="2" color="gray" className="whitespace-pre-wrap leading-relaxed">
                {aiExplanation}
              </Text>
            )}
          </Card>
        )}

        {/* Ranking: works on every screen size, with a per-option breakdown */}
        <Box>
          <Heading as="h3" size="3" mb="2">
            Ranking
          </Heading>
          <Flex direction="column" gap="2">
            {ranking.map(({ option, optionIndex, total }, rank) => {
              const isOpen = expanded === optionIndex;
              const isWinner = total === topScore;
              return (
                <Card key={optionIndex} size="2">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : optionIndex)}
                    aria-expanded={isOpen}
                    className="w-full text-left cursor-pointer"
                  >
                    <Flex align="center" gap="3">
                      <Badge
                        size="2"
                        radius="full"
                        variant={isWinner ? "solid" : "soft"}
                        color={isWinner ? undefined : "gray"}
                      >
                        {rank + 1}
                      </Badge>
                      <Flex direction="column" gap="2" className="flex-1 min-w-0">
                        <Flex justify="between" align="center" gap="2">
                          <Text size="3" weight="medium" className="break-words min-w-0">
                            {option}
                          </Text>
                          <Text size="3" weight="bold" color={isWinner ? undefined : "gray"} highContrast={isWinner}>
                            {formatSigned(total)}
                          </Text>
                        </Flex>
                        <div className="h-2 rounded-full bg-[var(--gray-a4)] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isWinner ? "bg-[var(--accent-9)]" : "bg-[var(--gray-8)]"}`}
                            style={{ width: `${percentOf(total)}%` }}
                          />
                        </div>
                      </Flex>
                      {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </Flex>
                  </button>

                  {isOpen && (
                    <Flex direction="column" gap="2" mt="3" pt="3" className="border-t border-[var(--gray-a4)]">
                      {criteria.map((criterion, ci) => {
                        const score = scoreOf(optionIndex, ci);
                        const weight = weightOf(ci);
                        return (
                          <Flex key={ci} align="center" justify="between" gap="2">
                            <Text size="2" color="gray" className="min-w-0 break-words">
                              {criterion}
                            </Text>
                            <Flex align="center" gap="2" className="flex-shrink-0">
                              <ScoreBadge score={score} />
                              <Text size="1" color="gray">
                                × {weight} =
                              </Text>
                              <Text size="2" weight="medium" className="w-8 text-right">
                                {formatSigned(score * weight)}
                              </Text>
                            </Flex>
                          </Flex>
                        );
                      })}
                    </Flex>
                  )}
                </Card>
              );
            })}
          </Flex>
        </Box>

        {/* Full matrix: only on larger screens, where a wide table fits */}
        <Box className="hidden sm:block">
          <Heading as="h3" size="3" mb="2">
            Full matrix
          </Heading>
          <Card size="1">
            <Table.Root size="2" layout="auto">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Option</Table.ColumnHeaderCell>
                  {criteria.map((criterion, ci) => (
                    <Table.ColumnHeaderCell key={ci} justify="center">
                      <Flex direction="column" align="center" gap="1">
                        <Text>{criterion}</Text>
                        <Badge variant="outline" color="gray" size="1">
                          weight {weightOf(ci)}
                        </Badge>
                      </Flex>
                    </Table.ColumnHeaderCell>
                  ))}
                  <Table.ColumnHeaderCell justify="end">Total</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {options.map((option, optionIndex) => {
                  const total = ranking.find((r) => r.optionIndex === optionIndex)?.total ?? 0;
                  const isWinner = total === topScore;
                  return (
                    <Table.Row key={optionIndex} className={isWinner ? "bg-[var(--accent-a3)]" : undefined}>
                      <Table.RowHeaderCell>
                        <Text weight="medium">{option}</Text>
                      </Table.RowHeaderCell>
                      {criteria.map((_, ci) => {
                        const score = scoreOf(optionIndex, ci);
                        return (
                          <Table.Cell key={ci} justify="center">
                            <Flex direction="column" align="center" gap="1">
                              <ScoreBadge score={score} />
                              <Text size="1" color="gray">
                                {formatSigned(score * weightOf(ci))}
                              </Text>
                            </Flex>
                          </Table.Cell>
                        );
                      })}
                      <Table.Cell justify="end">
                        <Text weight="bold" size="3" color={isWinner ? undefined : "gray"} highContrast={isWinner}>
                          {formatSigned(total)}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </Card>
        </Box>
      </Flex>
    </StepLayout>
  );
}
