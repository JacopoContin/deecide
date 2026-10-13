"use client";

import { useState, useEffect, useCallback } from "react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { VoiceOrb } from "@/components/voice/voice-orb";
import ConversationalEvaluation from "@/components/decision/ConversationalEvaluation";
import ConversationalWeighing from "@/components/decision/ConversationalWeighing";
import ManualEvaluation from "@/components/decision/ManualEvaluation";
import DecisionResults from "@/components/decision/DecisionResults";
import ListBuilder from "@/components/decision/ListBuilder";
import StepLayout from "@/components/decision/StepLayout";
import NavFooter from "@/components/decision/NavFooter";
import { ArrowRightIcon, ChatIcon, SettingsIcon } from "@/lib/icons";
import { DEFAULT_WEIGHT, type Score, type Weight } from "@/lib/decision";

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
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-muted-foreground">How do you want to score?</p>
                <ToggleGroup
                  aria-label="Scoring method"
                  variant="outline"
                  spacing={2}
                  value={[evaluationMode]}
                  onValueChange={(next) => {
                    if (next.length > 0) setEvaluationMode(next[next.length - 1] as EvaluationMode);
                  }}
                  className="grid w-full grid-cols-2"
                >
                  <ToggleGroupItem value="conversational">
                    <ChatIcon data-icon="inline-start" /> Chat with AI
                  </ToggleGroupItem>
                  <ToggleGroupItem value="manual">
                    <SettingsIcon data-icon="inline-start" /> Tap to score
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
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
    <div className="flex h-dvh flex-col pt-[var(--safe-top)] pb-[var(--safe-bottom)]">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-8 px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <VoiceOrb size={112} glow={0.4} aria-hidden />
          <h1 className="font-heading text-4xl font-semibold sm:text-5xl">Deecide</h1>
          <p className="max-w-xs text-muted-foreground">
            &ldquo;ดี Dee&rdquo; means good in Thai. Make better decisions with structure and clarity.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleStartDecision();
          }}
        >
          <InputGroup className="h-12 rounded-2xl pointer-coarse:h-12">
            <InputGroupInput
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="What are you deciding?"
              aria-label="What are you deciding?"
              autoFocus
              className="pl-4"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="submit"
                variant="default"
                size="icon-sm"
                disabled={!titleInput.trim()}
                aria-label="Start"
                className="rounded-xl"
              >
                <ArrowRightIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>
    </div>
  );
}
