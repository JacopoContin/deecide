"use client";

import { useState, useCallback } from "react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { VoiceOrb } from "@/components/voice/voice-orb";
import { AmbientBackground } from "@/components/effects/ambient-background";
import ManualEvaluation from "@/components/decision/ManualEvaluation";
import ManualWeighing from "@/components/decision/ManualWeighing";
import DecisionResults from "@/components/decision/DecisionResults";
import ListBuilder from "@/components/decision/ListBuilder";
import StepLayout from "@/components/decision/StepLayout";
import NavFooter from "@/components/decision/NavFooter";
import { ArrowRightIcon } from "@/lib/icons";
import type { Score, Weight } from "@/lib/decision";

type Step = "input" | "options" | "criteria" | "evaluation" | "weighing" | "results";

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [decisionTitle, setDecisionTitle] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [criteria, setCriteria] = useState<string[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [weights, setWeights] = useState<Weight[]>([]);

  const handleStartDecision = () => {
    const title = titleInput.trim();
    if (!title) return;

    setDecisionTitle(title);
    setTitleInput("");
    setStep("options");
  };

  // Scores and weights are stored by index, so removing an item invalidates them
  const resetEvaluation = () => {
    setScores([]);
    setWeights([]);
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
  };

  const handleWeight = (criterionIndex: number, weight: number) => {
    setWeights((prev) => [...prev.filter((w) => w.criterionIndex !== criterionIndex), { criterionIndex, weight }]);
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

  const handleRestart = () => {
    setStep("input");
    setDecisionTitle("");
    setOptions([]);
    setCriteria([]);
    resetEvaluation();
  };

  if (step === "results") {
    return (
      <DecisionResults
        decisionTitle={decisionTitle}
        options={options}
        criteria={criteria}
        getScore={getScore}
        getWeight={getWeight}
        onBack={() => setStep("weighing")}
        onRestart={handleRestart}
      />
    );
  }

  if (step === "weighing") {
    return (
      <ManualWeighing
        decisionTitle={decisionTitle}
        criteria={criteria}
        weights={weights}
        onWeight={handleWeight}
        onComplete={() => setStep("results")}
        onBack={() => setStep("evaluation")}
      />
    );
  }

  if (step === "evaluation") {
    return (
      <ManualEvaluation
        decisionTitle={decisionTitle}
        options={options}
        criteria={criteria}
        scores={scores}
        onScore={handleScore}
        onComplete={() => setStep("weighing")}
        onBack={() => setStep("criteria")}
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
          />
        }
      >
        <ListBuilder
          key="criteria"
          items={criteria}
          onAdd={addCriterion}
          onRemove={removeCriterion}
          placeholder="Add a criterion, e.g. Cost"
          emptyText="No criteria yet. Add at least one."
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
            onNext={() => setStep("criteria")}
            nextDisabled={options.length < 2}
          />
        }
      >
        <ListBuilder
          key="options"
          items={options}
          onAdd={addOption}
          onRemove={removeOption}
          placeholder="Add an option"
          emptyText="No options yet. Add at least two."
        />
      </StepLayout>
    );
  }

  return (
    <div className="relative isolate flex h-dvh flex-col overflow-hidden pt-[var(--safe-top)] pb-[var(--safe-bottom)]">
      <AmbientBackground variant="mesh" intensity={0.1} grain={0.4} />
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
