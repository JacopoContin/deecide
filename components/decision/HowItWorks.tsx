"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { STEPS } from "@/lib/decision";
import { CloseIcon, HelpIcon } from "@/lib/icons";

type StepGuide = {
  title: string;
  description: string;
  why: string;
  // Path under /public; a placeholder is shown until one is set
  illustration?: string;
};

// One entry per STEPS item, in the same order
const GUIDE: StepGuide[] = [
  {
    title: "Add your options",
    description: "List the options you want to compare. You'll score each one against your criteria in the next steps.",
    why: "Seeing every option side by side keeps you from comparing a favourite against a vague “something else”. Add as many as you like, at least two.",
  },
  {
    title: "Choose your criteria",
    description: "Add the things that matter for this decision, like cost, time or how it feels.",
    why: "Agreeing on criteria up front means every option is judged by the same yardstick, not by whatever comes to mind first.",
  },
  {
    title: "Score each option",
    description: "Rate how each option does on each criterion, from −1 (works against it) to +2 (excels at it).",
    why: "Small judgements made one at a time are easier to make honestly than one big gut call.",
  },
  {
    title: "Weigh your criteria",
    description: "Rate how important each criterion is, from 1 (not important) to 5 (critical).",
    why: "Not everything matters equally. Weights let a deal-breaker count for more than a nice-to-have.",
  },
  {
    title: "Read your results",
    description: "Each score is multiplied by its criterion's weight and added up. The highest total wins.",
    why: "You can see where each option gained or lost points. If the winner feels wrong, a criterion may be missing or a weight off, so go back and adjust.",
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
      size="sm"
      aria-expanded={open}
      onClick={() => setHelpOpen(!open)}
      className={cn("text-muted-foreground", className)}
    >
      <HelpIcon data-icon="inline-start" /> How it works
    </Button>
  );
}

function GuideBody({ stepIndex, docked }: { stepIndex: number; docked: boolean }) {
  const guide = GUIDE[stepIndex];
  const Title = docked ? "h2" : SheetTitle;
  const Description = docked ? "p" : SheetDescription;

  return (
    <div className="flex flex-col px-6 pt-14 pb-8">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Step {stepIndex + 1} of {STEPS.length}
      </p>
      <Title className="mt-2 font-heading text-2xl font-semibold text-foreground">{guide.title}</Title>
      <Description className="mt-3 text-sm leading-relaxed text-muted-foreground">{guide.description}</Description>

      <div className="relative my-8 aspect-[4/3] overflow-hidden rounded-xl">
        {guide.illustration ? (
          <Image src={guide.illustration} alt="" fill sizes="384px" className="object-contain" />
        ) : (
          <div className="flex size-full items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground">
            Illustration
          </div>
        )}
      </div>

      <h3 className="font-heading text-base font-semibold text-foreground">Why this is important</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{guide.why}</p>
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
