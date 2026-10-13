"use client";

import { useState, useEffect, useCallback } from "react";
import { Flex, Heading, IconButton, SegmentedControl, Text, TextField } from "@radix-ui/themes";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import ConversationalEvaluation from "./components/ConversationalEvaluation";
import ConversationalWeighing from "./components/ConversationalWeighing";
import ManualEvaluation from "./components/ManualEvaluation";
import DecisionResults from "./components/DecisionResults";
import ListBuilder from "./components/ListBuilder";
import StepLayout from "./components/StepLayout";
import NavFooter from "./components/NavFooter";
import { DEFAULT_WEIGHT, type Score, type Weight } from "./lib/decision";

type Step = "input" | "options" | "criteria" | "evaluation" | "weighing" | "results";
type EvaluationMode = "conversational" | "manual";

async function fetchSuggestions(decisionTitle: string, type: "options" | "criteria"): Promise<string[]> {
  try {
    const response = await fetch("/api/ai/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decisionTitle, type }),
    });
    const data = await response.json();
    return Array.isArray(data.suggestions) ? data.suggestions : [];
  } catch (error) {
    console.error("Failed to fetch AI suggestions:", error);
    return [];
  }
}

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [decisionTitle, setDecisionTitle] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [criteria, setCriteria] = useState<string[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [weights, setWeights] = useState<Weight[]>([]);
  const [optionSuggestions, setOptionSuggestions] = useState<string[]>([]);
  const [criteriaSuggestions, setCriteriaSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [evaluationMode, setEvaluationMode] = useState<EvaluationMode>("conversational");

  const handleStartDecision = async () => {
    const title = titleInput.trim();
    if (!title) return;

    setDecisionTitle(title);
    setTitleInput("");
    setStep("options");

    setIsLoadingSuggestions(true);
    setOptionSuggestions(await fetchSuggestions(title, "options"));
    setIsLoadingSuggestions(false);
  };

  const handleMoveToCriteria = async () => {
    setStep("criteria");
    if (criteriaSuggestions.length > 0) return;

    setIsLoadingSuggestions(true);
    setCriteriaSuggestions(await fetchSuggestions(decisionTitle, "criteria"));
    setIsLoadingSuggestions(false);
  };

  // Scores and weights are stored by index, so removing an item invalidates them
  const resetEvaluation = () => {
    setScores([]);
    setWeights([]);
    setAiExplanation("");
  };

  const addOption = (option: string) => {
    if (options.includes(option)) return;
    setOptions([...options, option]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
    resetEvaluation();
  };

  const addCriterion = (criterion: string) => {
    if (criteria.includes(criterion)) return;
    setCriteria([...criteria, criterion]);
  };

  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
    resetEvaluation();
  };

  const handleScore = (optionIndex: number, criterionIndex: number, score: number) => {
    setScores((prev) => [
      ...prev.filter((s) => !(s.optionIndex === optionIndex && s.criterionIndex === criterionIndex)),
      { optionIndex, criterionIndex, score },
    ]);
    setAiExplanation("");
  };

  const handleWeight = (criterionIndex: number, weight: number) => {
    setWeights((prev) => [...prev.filter((w) => w.criterionIndex !== criterionIndex), { criterionIndex, weight }]);
    setAiExplanation("");
  };

  const getScore = useCallback(
    (optionIndex: number, criterionIndex: number) =>
      scores.find((s) => s.optionIndex === optionIndex && s.criterionIndex === criterionIndex)?.score,
    [scores]
  );

  const getWeight = useCallback(
    (criterionIndex: number) => weights.find((w) => w.criterionIndex === criterionIndex)?.weight,
    [weights]
  );

  const getWinningOptionIndex = useCallback(() => {
    let best = -Infinity;
    let winnerIndex = 0;
    options.forEach((_, optionIndex) => {
      const total = criteria.reduce(
        (sum, _, ci) => sum + (getScore(optionIndex, ci) ?? 0) * (getWeight(ci) ?? DEFAULT_WEIGHT),
        0
      );
      if (total > best) {
        best = total;
        winnerIndex = optionIndex;
      }
    });
    return winnerIndex;
  }, [options, criteria, getScore, getWeight]);

  const handleRestart = () => {
    setStep("input");
    setDecisionTitle("");
    setOptions([]);
    setCriteria([]);
    setOptionSuggestions([]);
    setCriteriaSuggestions([]);
    resetEvaluation();
  };

  // Fetch AI explanation when results load
  useEffect(() => {
    if (step !== "results" || aiExplanation !== "" || isLoadingExplanation) return;

    setIsLoadingExplanation(true);
    fetch("/api/ai/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decisionTitle,
        options,
        criteria,
        scores,
        weights,
        winnerIndex: getWinningOptionIndex(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.explanation) {
          setAiExplanation(data.explanation);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch AI explanation:", error);
      })
      .finally(() => {
        setIsLoadingExplanation(false);
      });
  }, [step, aiExplanation, isLoadingExplanation, decisionTitle, options, criteria, scores, weights, getWinningOptionIndex]);

  if (step === "results") {
    return (
      <DecisionResults
        decisionTitle={decisionTitle}
        options={options}
        criteria={criteria}
        getScore={getScore}
        getWeight={getWeight}
        aiExplanation={aiExplanation}
        isLoadingExplanation={isLoadingExplanation}
        onBack={() => setStep("weighing")}
        onRestart={handleRestart}
      />
    );
  }

  if (step === "weighing") {
    return (
      <ConversationalWeighing
        decisionTitle={decisionTitle}
        criteria={criteria}
        onWeight={handleWeight}
        onComplete={() => setStep("results")}
        onBack={() => setStep("evaluation")}
        alreadyWeighted={weights.length === criteria.length}
      />
    );
  }

  if (step === "evaluation") {
    const evaluationProps = {
      decisionTitle,
      options,
      criteria,
      onScore: handleScore,
      onComplete: () => setStep("weighing"),
      onBack: () => setStep("criteria"),
    };

    return evaluationMode === "conversational" ? (
      <ConversationalEvaluation {...evaluationProps} onSwitchMode={() => setEvaluationMode("manual")} />
    ) : (
      <ManualEvaluation
        {...evaluationProps}
        scores={scores}
        onSwitchMode={() => setEvaluationMode("conversational")}
      />
    );
  }

  if (step === "criteria") {
    return (
      <StepLayout
        title={decisionTitle}
        subtitle="What matters when choosing? Add the criteria you'll judge each option by."
        stepIndex={1}
        footer={
          <NavFooter
            onBack={() => setStep("options")}
            onNext={() => setStep("evaluation")}
            nextDisabled={criteria.length < 1}
            extra={
              <Flex direction="column" gap="1">
                <Text size="1" color="gray">
                  How do you want to score?
                </Text>
                <SegmentedControl.Root
                  value={evaluationMode}
                  onValueChange={(value) => setEvaluationMode(value as EvaluationMode)}
                  size="2"
                  className="w-full"
                >
                  <SegmentedControl.Item value="conversational">Chat with AI</SegmentedControl.Item>
                  <SegmentedControl.Item value="manual">Tap to score</SegmentedControl.Item>
                </SegmentedControl.Root>
              </Flex>
            }
          />
        }
      >
        <ListBuilder
          items={criteria}
          onAdd={addCriterion}
          onRemove={removeCriterion}
          placeholder="Add a criterion, e.g. Cost"
          emptyText="No criteria yet. Add at least one."
          suggestions={criteriaSuggestions}
          isLoadingSuggestions={isLoadingSuggestions}
        />
      </StepLayout>
    );
  }

  if (step === "options") {
    return (
      <StepLayout
        title={decisionTitle}
        subtitle="What are you choosing between? Add at least two options."
        stepIndex={0}
        footer={
          <NavFooter
            onBack={() => setStep("input")}
            onNext={handleMoveToCriteria}
            nextDisabled={options.length < 2}
          />
        }
      >
        <ListBuilder
          items={options}
          onAdd={addOption}
          onRemove={removeOption}
          placeholder="Add an option"
          emptyText="No options yet. Add at least two."
          suggestions={optionSuggestions}
          isLoadingSuggestions={isLoadingSuggestions}
        />
      </StepLayout>
    );
  }

  return (
    <div className="h-dvh flex flex-col safe-top safe-bottom">
      <Flex direction="column" justify="center" className="flex-1 w-full max-w-[560px] mx-auto px-4 py-8" gap="6">
        <Flex direction="column" gap="3" align="center" className="text-center">
          <Heading as="h1" size={{ initial: "8", sm: "9" }}>
            Deecide
          </Heading>
          <Text size="3" color="gray" className="max-w-[320px]">
            &ldquo;ดี Dee&rdquo; means good in Thai. Make better decisions with structure and clarity.
          </Text>
        </Flex>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleStartDecision();
          }}
        >
          <TextField.Root
            size="3"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="What are you deciding?"
            aria-label="What are you deciding?"
            autoFocus
          >
            <TextField.Slot side="right">
              <IconButton type="submit" size="2" disabled={!titleInput.trim()} aria-label="Start">
                <ArrowRightIcon />
              </IconButton>
            </TextField.Slot>
          </TextField.Root>
        </form>
      </Flex>
    </div>
  );
}
