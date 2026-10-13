"use client";

import { useSyncExternalStore, type ComponentType, type SVGProps } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { CloseIcon, HelpIcon } from "@/lib/icons";
import {
  CriteriaIllustration,
  OptionsIllustration,
  ResultsIllustration,
  ScoreIllustration,
  WeighIllustration,
} from "./GuideIllustrations";
import ScoreLegend from "./ScoreLegend";
import WeightLegend from "./WeightLegend";

type StepGuide = {
  title: string;
  body: string;
  Illustration: ComponentType<SVGProps<SVGSVGElement>>;
  // Reference for the step's tap scale, if it has one
  Legend?: ComponentType;
};

// One entry per STEPS item, in the same order
const GUIDE: StepGuide[] = [
  {
    title: "Add your options",
    Illustration: OptionsIllustration,
    body: "A weighted decision matrix compares options side by side. Listing them first keeps every alternative on equal footing.",
  },
  {
    title: "Choose your criteria",
    Illustration: CriteriaIllustration,
    body: "Criteria are the matrix's columns. Fixing them up front means every option is judged by the same yardstick.",
  },
  {
    title: "Score each option",
    Illustration: ScoreIllustration,
    Legend: ScoreLegend,
    body: "Scoring one cell at a time turns one big gut call into small, honest judgements that are easier to make.",
  },
  {
    title: "Weigh your criteria",
    Illustration: WeighIllustration,
    Legend: WeightLegend,
    body: "Weights reflect what matters most to you, so a deal-breaker counts for more than a nice-to-have.",
  },
  {
    title: "Read your results",
    Illustration: ResultsIllustration,
    body: "Each score is multiplied by its weight and summed. The highest total is the option that best fits your priorities.",
  },
];

// Open state lives outside React so the panel stays open as the user moves between steps
let helpOpen = false;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const setHelpOpen = (open: boolean) => {
  helpOpen = open;
  listeners.forEach((listener) => listener());
};
const useHelpOpen = () => useSyncExternalStore(subscribe, () => helpOpen, () => false);

// Wide screens dock the panel beside the step; narrow ones get a sheet over it
const DOCKED_QUERY = "(min-width: 1024px)";
const subscribeDocked = (listener: () => void) => {
  const query = window.matchMedia(DOCKED_QUERY);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};
const useDocked = () => useSyncExternalStore(subscribeDocked, () => window.matchMedia(DOCKED_QUERY).matches, () => false);

export function HowItWorksButton({ className }: { className?: string }) {
  const open = useHelpOpen();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="How it works"
      title="How it works"
      aria-expanded={open}
      onClick={() => setHelpOpen(!open)}
      className={cn("text-muted-foreground", className)}
    >
      <HelpIcon />
    </Button>
  );
}

function GuideBody({ stepIndex, docked }: { stepIndex: number; docked: boolean }) {
  const guide = GUIDE[stepIndex];
  const Title = docked ? "h2" : SheetTitle;
  const Body = docked ? "p" : SheetDescription;

  return (
    <div className="flex flex-col gap-6 px-6 pt-14 pb-8">
      <Title className="sr-only">{guide.title}</Title>
      <div className="aspect-[4/3] rounded-xl bg-muted/40">
        <guide.Illustration className="size-full" />
      </div>
      <Body className="text-sm leading-relaxed text-muted-foreground">{guide.body}</Body>
      {guide.Legend && <guide.Legend />}
    </div>
  );
}

// Explains the current step only. Renders nothing while closed.
export default function HowItWorksPanel({ stepIndex }: { stepIndex: number }) {
  const open = useHelpOpen();
  const docked = useDocked();

  if (docked) {
    if (!open) return null;
    return (
      <aside
        aria-label="How it works"
        className="relative w-96 shrink-0 animate-in overflow-y-auto border-l pt-[var(--safe-top)] pr-[var(--safe-right)] duration-200 fade-in slide-in-from-right-4"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setHelpOpen(false)}
          aria-label="Close"
          className="absolute top-3 right-3 mt-[var(--safe-top)] mr-[var(--safe-right)]"
        >
          <CloseIcon />
        </Button>
        <GuideBody stepIndex={stepIndex} docked />
      </aside>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setHelpOpen}>
      <SheetContent className="w-[88%] gap-0 overflow-y-auto">
        <GuideBody stepIndex={stepIndex} docked={false} />
      </SheetContent>
    </Sheet>
  );
}
