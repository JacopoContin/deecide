"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { CloseIcon, HelpIcon } from "@/lib/icons";

type StepGuide = {
  title: string;
  body: string;
  // Path under /public; a placeholder is shown until one is set
  illustration?: string;
};

// One entry per STEPS item, in the same order
const GUIDE: StepGuide[] = [
  {
    title: "Add your options",
    body: "List what you're choosing between, side by side, so nothing gets judged against a vague \u201csomething else\u201d.",
  },
  {
    title: "Choose your criteria",
    body: "Name what matters, like cost or time, so every option is judged by the same yardstick.",
  },
  {
    title: "Score each option",
    body: "Rate each option on each criterion, from \u22121 to +2. Small judgements are easier to make honestly.",
  },
  {
    title: "Weigh your criteria",
    body: "Rate each criterion from 1 to 5, so a deal-breaker counts for more than a nice-to-have.",
  },
  {
    title: "Read your results",
    body: "Scores \u00d7 weights, added up. If the winner feels wrong, a criterion or weight is probably off.",
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
  const Body = docked ? "p" : SheetDescription;

  return (
    <div className="flex flex-col gap-6 px-6 pt-14 pb-8">
      <Title className="sr-only">{guide.title}</Title>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
        {guide.illustration ? (
          <Image src={guide.illustration} alt="" fill sizes="384px" className="object-contain" />
        ) : (
          <div className="flex size-full items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground">
            Illustration
          </div>
        )}
      </div>
      <Body className="text-sm leading-relaxed text-muted-foreground">{guide.body}</Body>
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
